import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { Id } from "./_generated/dataModel";
import {
  internalMutation,
  MutationCtx,
  query,
  QueryCtx,
} from "./_generated/server";

// --------------- CONSTANTS ---------------
export const BURST_LIMIT = 10;            // max AI calls per user per window
export const BURST_WINDOW_MS = 10 * 60 * 1000;  // 10 minutes

export const ROOM_LIMIT = 50;             // max AI calls per room per window
export const ROOM_WINDOW_MS = 3 * 60 * 60 * 1000; // 3 hours

export const DAILY_RESET_MS = 24 * 60 * 60 * 1000; // 24 hours
export const DAILY_UPLOAD_LIMIT = 10;
export const DAILY_QUIZ_LIMIT = 20;

// --------------- SHARED HELPERS ---------------

async function countUserLogs(
  ctx: QueryCtx | MutationCtx,
  userId: string,
  windowMs: number
): Promise<number> {
  const since = Date.now() - windowMs;
  const logs = await ctx.db
    .query("usageLogs")
    .withIndex("by_userId_and_timestamp", (q) =>
      q.eq("userId", userId).gte("timestamp", since)
    )
    .take(BURST_LIMIT + 1);
  return logs.length;
}

async function countRoomLogs(
  ctx: QueryCtx | MutationCtx,
  roomId: Id<"rooms">,
  windowMs: number
): Promise<number> {
  const since = Date.now() - windowMs;
  const logs = await ctx.db
    .query("usageLogs")
    .withIndex("by_roomId_and_timestamp", (q) =>
      q.eq("roomId", roomId).gte("timestamp", since)
    )
    .take(ROOM_LIMIT + 1);
  return logs.length;
}

// --------------- ASSERT RATE LIMITS (called from mutations) ---------------

/**
 * Validate all rate limits for an AI call.
 * Throws a ConvexError with a friendly message if any limit is exceeded.
 * Designed to be called directly from a mutation handler.
 */
export async function assertRateLimits(
  ctx: MutationCtx,
  roomId: Id<"rooms">
): Promise<void> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError("Unauthorized");

  const userId = identity.tokenIdentifier;

  // 1. ── USER BURST LIMIT ── 10 calls / 10 minutes
  const burstCount = await countUserLogs(ctx, userId, BURST_WINDOW_MS);
  if (burstCount >= BURST_LIMIT) {
    throw new ConvexError(
      "Eits, AI-nya lagi istirahat sebentar! Kamu sudah kirim 10 pertanyaan dalam 10 menit. Coba lagi sebentar ya ✨"
    );
  }

  // 2. ── ROOM SHARED LIMIT ── 50 calls / 3 hours
  const roomCount = await countRoomLogs(ctx, roomId, ROOM_WINDOW_MS);
  if (roomCount >= ROOM_LIMIT) {
    throw new ConvexError(
      "Eits, AI-nya lagi istirahat sebentar di room ini. Coba lagi dalam beberapa menit ya! 🕐"
    );
  }
}

// --------------- INTERNAL MUTATION: logUsage ---------------

export const logUsage = internalMutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.string(), // tokenIdentifier — passed explicitly because scheduled jobs have no auth
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("usageLogs", {
      userId: args.userId,
      roomId: args.roomId,
      type: "ai_call",
      timestamp: Date.now(),
    });
  },
});

// --------------- INTERNAL MUTATIONS: daily counters ---------------

export const incrementUploadCount = internalMutation({
  args: { userId: v.string() }, // clerkId (subject)
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .unique();
    if (!user) return;

    const now = Date.now();
    const lastReset = user.lastResetTimestamp ?? 0;
    const shouldReset = now - lastReset > DAILY_RESET_MS;

    await ctx.db.patch(user._id, {
      uploadCount: shouldReset ? 1 : (user.uploadCount ?? 0) + 1,
      quizCount: shouldReset ? 0 : user.quizCount,
      lastResetTimestamp: shouldReset ? now : lastReset,
    });
  },
});

export const incrementQuizCount = internalMutation({
  args: { userId: v.string() }, // clerkId (subject)
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .unique();
    if (!user) return;

    const now = Date.now();
    const lastReset = user.lastResetTimestamp ?? 0;
    const shouldReset = now - lastReset > DAILY_RESET_MS;

    await ctx.db.patch(user._id, {
      quizCount: shouldReset ? 1 : (user.quizCount ?? 0) + 1,
      uploadCount: shouldReset ? 0 : user.uploadCount,
      lastResetTimestamp: shouldReset ? now : lastReset,
    });
  },
});

// --------------- PUBLIC QUERY: getUsageStats (for UI) ---------------

export const getUsageStats = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const userId = identity.tokenIdentifier;
    const now = Date.now();

    const burstCount = await countUserLogs(ctx, userId, BURST_WINDOW_MS);
    const roomCount = await countRoomLogs(ctx, args.roomId, ROOM_WINDOW_MS);

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const lastReset = user?.lastResetTimestamp ?? 0;
    const isNewDay = now - lastReset > DAILY_RESET_MS;

    return {
      burst: { used: burstCount, limit: BURST_LIMIT },
      room: { used: roomCount, limit: ROOM_LIMIT },
      daily: {
        uploads: {
          used: isNewDay ? 0 : (user?.uploadCount ?? 0),
          limit: DAILY_UPLOAD_LIMIT,
        },
        quizzes: {
          used: isNewDay ? 0 : (user?.quizCount ?? 0),
          limit: DAILY_QUIZ_LIMIT,
        },
      },
    };
  },
});
