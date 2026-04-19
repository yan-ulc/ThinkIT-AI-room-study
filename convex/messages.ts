import { v } from "convex/values";
import { api } from "./_generated/api";
import { mutation, query } from "./_generated/server";

// STEP 3.1 & 3.2 — Send & Save Message
// convex/messages.ts

export const send = mutation({
  args: {
    roomId: v.id("rooms"),
    content: v.string(),
    replyToId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Tetap ambil data user untuk mention logic
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    // --- LOGIC MENTION LU (JANGAN DIUBAH) ---
    const mentionRegex = /@(\w+)/g;
    const matches = args.content.match(mentionRegex) || [];
    const mentionedUsers: string[] = [];
    let hasAiMention = false;

    for (const match of matches) {
      const username = match.substring(1).toLowerCase();
      if (username === "ai") {
        hasAiMention = true;
        mentionedUsers.push("ai");
        continue;
      }
      const targetUser = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", username))
        .unique();
      if (targetUser) {
        mentionedUsers.push(targetUser._id);
      }
    }
    // --- END LOGIC MENTION ---

    // Trigger AI as well when user replies directly to an AI message.
    if (args.replyToId) {
      const repliedMessage = await ctx.db.get(args.replyToId);
      if (repliedMessage?.type === "ai") {
        hasAiMention = true;
        if (!mentionedUsers.includes("ai")) {
          mentionedUsers.push("ai");
        }
      }
    }

    // SIMPAN PESAN USER
    const messageId = await ctx.db.insert("messages", {
      roomId: args.roomId,
      content: args.content,
      senderId: user._id,
      senderName:  user.username,
      senderImage: user.imageUrl,
      type: "text",
      mentionedUsers: mentionedUsers,
      replyToId: args.replyToId,
    });

    if (hasAiMention) {
      await ctx.scheduler.runAfter(0, api.ai.chatWithAi, {
        roomId: args.roomId,
        message: args.content,
        replyToId: args.replyToId,
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
        const senderId = msg.senderId;
        const isUserSender =
          senderId !== null && senderId !== "ai" && senderId !== "system";
        const sender = isUserSender ? await ctx.db.get(senderId) : null;

        const resolvedSenderName =
          msg.senderName ||
          sender?.displayName ||
          sender?.username ||
          (msg.type === "system" ? "System" : "ThinkIT AI");
        const resolvedSenderUsername =
          sender?.username || (msg.type === "system" ? "system" : "ai");

        const repliedMessage = msg.replyToId
          ? await ctx.db.get(msg.replyToId)
          : null;
        let replyToSenderName: string | undefined;
        let replyToContent: string | undefined;

        if (repliedMessage) {
          const replySenderId = repliedMessage.senderId;
          const isReplyUserSender =
            replySenderId !== null &&
            replySenderId !== "ai" &&
            replySenderId !== "system";
          const replySender = isReplyUserSender
            ? await ctx.db.get(replySenderId)
            : null;

          replyToSenderName =
            repliedMessage.senderName ||
            replySender?.displayName ||
            replySender?.username ||
            (repliedMessage.type === "system" ? "System" : "ThinkIT AI");
          replyToContent = repliedMessage.content;
        }

        return {
          ...msg,
          senderName: resolvedSenderName,
          senderUsername: resolvedSenderUsername,
          senderImage: msg.senderImage || sender?.imageUrl,
          isMine: isUserSender && senderId === user._id,
          replyToSenderName,
          replyToContent,
        };
      }),
    );
  },
});

export const getRecentMessages = query({
  args: { roomId: v.id("rooms"), limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .order("desc") // Get newest N first, then reorder in ai.ts before prompting
      .take(args.limit);
  },
});

export const getById = query({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
