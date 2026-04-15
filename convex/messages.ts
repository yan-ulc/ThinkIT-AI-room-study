import { v } from "convex/values";
import { api } from "./_generated/api";
import { mutation, query } from "./_generated/server";

// STEP 3.1 & 3.2 — Send & Save Message
export const send = mutation({
  args: {
    roomId: v.id("rooms"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    // 1. Regex untuk deteksi mention (Step 4.1)
    const mentionRegex = /@(\w+)/g;
    const matches = args.content.match(mentionRegex) || [];

    const mentionedUsers: string[] = [];
    let hasAiMention = false;

    // 2. Resolve Username (Step 4.2 & 4.4)
    for (const match of matches) {
      const username = match.substring(1).toLowerCase(); // ilangin '@'

      if (username === "ai") {
        hasAiMention = true;
        mentionedUsers.push("ai"); // Special flag untuk AI (Step 4.4)
        continue;
      }

      const targetUser = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", username))
        .unique();

      if (targetUser) {
        mentionedUsers.push(targetUser._id); // Simpan ID user asli (Step 4.3)
      }
    }

    // 3. Simpan ke database
    const messageId = await ctx.db.insert("messages", {
      roomId: args.roomId,
      senderId: user._id,
      content: args.content,
      type: "text",
      mentionedUsers, // Array ID atau "ai"
      // createdAt DIHAPUS karena otomatis ada di _creationTime
    });

    // STEP 7.1: If @ai is mentioned, trigger the chatWithAi Action
    if (hasAiMention) {
      await ctx.scheduler.runAfter(0, api.ai.chatWithAi, {
        roomId: args.roomId,
        message: args.content,
      });
    }

    return messageId;
  },
});

// STEP 3.3 — Fetch Messages
export const getMessages = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Validasi akses sebelum kasih data
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const membership = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", args.roomId).eq("userId", user._id),
      )
      .unique();

    if (!membership) return [];

    // Ambil pesan urut waktu (Step 3.3)
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();

    // Join dengan data sender agar muncul nama & foto di UI
    return await Promise.all(
      messages.map(async (msg) => {
        const sender = msg.senderId ? await ctx.db.get(msg.senderId) : null;
        return {
          ...msg,
          senderName: sender?.username || sender?.displayName || "AI Assistant",
          senderUsername: sender?.username || "ai",
          senderImage: sender?.imageUrl,
          isMine: !!msg.senderId && msg.senderId === user._id,
        };
      }),
    );
  },
});
