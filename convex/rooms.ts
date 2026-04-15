import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// STEP 2.1 & 2.2 — Create Room + Auto Join Creator
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    let user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      const userId = await ctx.db.insert("users", {
        clerkId: identity.subject,
        username:
          identity.nickname ??
          identity.email?.split("@")[0] ??
          `user_${identity.subject.slice(-4)}`,
        displayName: identity.name ?? "Anonymous",
        imageUrl: identity.pictureUrl,
      });

      user = await ctx.db.get(userId);
      if (!user) throw new Error("User initialization failed");
    }

    // Simpan ke rooms (Step 2.1)
    const roomId = await ctx.db.insert("rooms", {
      name: args.name,
      description: args.description,
      isPrivate: false, // Default untuk MVP
      createdBy: user._id,
    });

    // Auto Join Creator sebagai Admin (Step 2.2)
    await ctx.db.insert("roomMembers", {
      roomId,
      userId: user._id,
      role: "admin",
    });

    return roomId;
  },
});

// STEP 2.3 — Join Room
export const join = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Cek apakah sudah jadi member
    const existing = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", args.roomId).eq("userId", user._id),
      )
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("roomMembers", {
      roomId: args.roomId,
      userId: user._id,
      role: "member",
    });
  },
});

// STEP 2.4 & 2.5 — Get User Rooms + Access Control
export const getMyRooms = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    // Ambil semua keanggotaan user (Step 2.4)
    const memberships = await ctx.db
      .query("roomMembers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    // Join ke tabel rooms untuk ambil data lengkap
    const rooms = await Promise.all(
      memberships.map(async (m) => {
        return await ctx.db.get(m.roomId);
      }),
    );

    // Filter null jika ada room yang terhapus
    return rooms.filter((r) => r !== null);
  },
});

export const getDashboardRooms = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const memberships = await ctx.db
      .query("roomMembers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);

    const rooms = await Promise.all(
      memberships.map(async (membership) => {
        const room = await ctx.db.get(membership.roomId);
        if (!room) return null;

        const memberCount = (
          await ctx.db
            .query("roomMembers")
            .withIndex("by_roomId", (q) => q.eq("roomId", room._id))
            .take(100)
        ).length;

        const latestMessage = (
          await ctx.db
            .query("messages")
            .withIndex("by_roomId", (q) => q.eq("roomId", room._id))
            .order("desc")
            .take(1)
        )[0];

        const lastActivity = latestMessage?._creationTime ?? room._creationTime;

        return {
          _id: room._id,
          name: room.name,
          description: room.description ?? "No description yet.",
          memberCount,
          lastActivity,
          active: Date.now() - lastActivity < 1000 * 60 * 15,
        };
      }),
    );

    return rooms.filter((room) => room !== null);
  },
});

// Helper untuk validasi akses di halaman chat (Step 2.5)
export const getById = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    // Cek apakah user adalah member room ini
    const membership = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", args.roomId).eq("userId", user._id),
      )
      .unique();

    if (!membership) return null; // Access Denied

    return await ctx.db.get(args.roomId);
  },
});

// Fungsi untuk join room pake ID (Step 2.3 - Logic join diperkuat)
export const joinById = mutation({
  args: { roomId: v.string() }, // Kita terima string dulu buat divalidasi
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    // Validasi apakah string ID valid sebagai format ID Convex
    const normalizedId = ctx.db.normalizeId("rooms", args.roomId);
    if (!normalizedId) throw new Error("ID Room kagak valid, Ngab!");

    const room = await ctx.db.get(normalizedId);
    if (!room) throw new Error("Room-nya udah gak ada/dihapus!");

    // Cek apakah sudah join
    const existing = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", normalizedId).eq("userId", user._id),
      )
      .unique();

    if (existing) return normalizedId;

    // Insert member baru (Step 2.3)
    await ctx.db.insert("roomMembers", {
      roomId: normalizedId,
      userId: user._id,
      role: "member",
    });

    return normalizedId;
  },
});

// Query untuk dapet daftar member di satu room (buat Right Panel)
export const getMembers = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("roomMembers")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();

    const hydratedMembers = await Promise.all(
      members.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        if (!user) return null;

        return {
          _id: user._id,
          displayName: user.displayName,
          role: m.role,
        };
      }),
    );

    return hydratedMembers.filter((member) => member !== null);
  },
});
