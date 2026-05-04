import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { action, mutation, query } from "./_generated/server";
import { callAI } from "./utils";

type QuizQuestion = {
  question: string;
  options: string[];
  answer: string;
};

function parseQuizQuestions(raw: string): QuizQuestion[] {
  const parsed: unknown = JSON.parse(raw);

  const candidate = Array.isArray(parsed)
    ? parsed
    : parsed &&
        typeof parsed === "object" &&
        "questions" in parsed &&
        Array.isArray((parsed as { questions?: unknown }).questions)
      ? (parsed as { questions: unknown[] }).questions
      : null;

  if (!candidate) {
    throw new Error("AI returned an invalid quiz payload shape.");
  }

  const questions: QuizQuestion[] = candidate
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const row = item as {
        question?: unknown;
        options?: unknown;
        answer?: unknown;
      };

      if (typeof row.question !== "string") return null;
      if (!Array.isArray(row.options)) return null;

      const options = row.options
        .filter((opt): opt is string => typeof opt === "string")
        .map((opt) => opt.trim())
        .filter((opt) => opt.length > 0)
        .slice(0, 4);

      if (options.length !== 4) return null;

      const answerRaw =
        typeof row.answer === "string" ? row.answer.trim() : options[0];
      const answer = options.includes(answerRaw) ? answerRaw : options[0];

      return {
        question: row.question.trim(),
        options,
        answer,
      };
    })
    .filter((q): q is QuizQuestion => q !== null);

  if (questions.length === 0) {
    throw new Error("AI returned no valid quiz questions.");
  }

  return questions;
}

// --- QUERIES ---
export const getByRoomId = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quizzes")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("quizzes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getRecentByRoomId = query({
  args: {
    roomId: v.id("rooms"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const take = Math.min(Math.max(args.limit ?? 8, 1), 20);
    return await ctx.db
      .query("quizzes")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .order("desc")
      .take(take);
  },
});

// --- MUTATIONS ---
export const save = mutation({
  args: {
    documentId: v.id("documents"),
    roomId: v.id("rooms"),
    title: v.string(),
    questions: v.array(
      v.object({
        question: v.string(),
        options: v.array(v.string()),
        answer: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("Unauthorized");

    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (room.status === "closed") {
      throw new Error("This room is closed. You can only view content.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .unique();
    if (!user) throw new Error("User not found");

    const membership = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", args.roomId).eq("userId", user._id),
      )
      .unique();

    if (!membership) throw new Error("Forbidden: not a room member");
    if (membership.status === "removed") {
      throw new Error("User is no longer an active member of this room");
    }

    return await ctx.db.insert("quizzes", {
      documentId: args.documentId,
      roomId: args.roomId,
      title: args.title,
      questions: args.questions,
      userId,
      createdAt: Date.now(),
    });
  },
});

export const deleteQuiz = mutation({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) throw new Error("Quiz tidak ditemukan");

    // Cek apakah user adalah admin di room ini
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const membership = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", quiz.roomId).eq("userId", user._id),
      )
      .unique();

    if (!membership) throw new Error("Kamu bukan member room ini");
    if (membership.role !== "admin" && membership.role !== "owner")
      throw new Error("Hanya admin atau owner yang bisa menghapus quiz");

    // Hapus semua attempts terkait quiz ini
    const attempts = await ctx.db
      .query("attempts")
      .withIndex("by_quizId", (q) => q.eq("quizId", args.quizId))
      .collect();
    for (const attempt of attempts) {
      await ctx.db.delete(attempt._id);
    }

    // Hapus quiz
    await ctx.db.delete(args.quizId);
  },
});

// --- ACTIONS ---
export const generate = action({
  args: {
    documentId: v.id("documents"),
    title: v.optional(v.string()),
    questionCount: v.optional(v.number()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ quizId: Id<"quizzes">; title: string }> => {
    // 1. Ambil atau auto-generate summary
    const existingSummary = await ctx.runQuery(api.summarize.getByDocId, {
      documentId: args.documentId,
    });

    // Jika belum ada, generate otomatis dulu & simpan ke DB
    let summaryText: string;
    if (existingSummary) {
      summaryText = existingSummary.summaryText;
    } else {
      const generated = await ctx.runAction(api.summarize.generate, {
        documentId: args.documentId,
      });
      summaryText = generated.summaryText;
    }

    // 2. Ambil document (buat dapet roomId & title)
    const document: { roomId: Id<"rooms">; title: string } | null =
      await ctx.runQuery(api.documents.getById, {
        documentId: args.documentId,
      });
    if (!document) throw new Error("Document not found");

    const room = await ctx.runQuery(api.rooms.getById, { roomId: document.roomId });
    if (!room) throw new Error("Room not found");
    if (room.status === "closed") {
      throw new Error("This room is closed. You can only view content.");
    }

    const isActiveMember = await ctx.runQuery(api.rooms.checkActiveMembership, { roomId: document.roomId });
    if (!isActiveMember) {
      throw new Error("User is no longer an active member of this room");
    }

    // 3. Ambil quiz sebelumnya (optional - anti duplicate)
    const previousQuizzes: Doc<"quizzes">[] = await ctx.runQuery(
      api.quiz.getRecentByRoomId,
      {
        roomId: document.roomId,
        limit: 8,
      },
    );

    // ambil semua pertanyaan lama (biar AI avoid)
    const previousQuestions = previousQuizzes
      .slice(0, 5) // ambil max 5 quiz terakhir
      .flatMap((q) =>
        q.questions
          .slice(0, 3) // max 3 pertanyaan per quiz
          .map((qq) => {
            return qq.question
              .toLowerCase()
              .replace(/[^a-z0-9\s]/g, "") // hapus simbol
              .split(" ")
              .filter((w) => w.length > 4) // ambil kata penting aja
              .slice(0, 5) // max 5 keyword
              .join(" ");
          }),
      )
      .slice(0, 15); // final limit

    const quizTitle = args.title ?? document.title ?? "Untitled Quiz";

    // 4. Inject context ke AI
    const requestedCount = args.questionCount ?? 5;
    let questions: QuizQuestion[] = [];

    for (let attempt = 0; attempt < 2; attempt++) {
      const aiResponse = await callAI({
        mode: "quiz",
        content: summaryText,
        context: {
          previousQuestions,
          title: quizTitle,
          questionCount: requestedCount,
        },
      });

      try {
        questions = parseQuizQuestions(aiResponse).slice(0, requestedCount);
        if (questions.length > 0) break;
      } catch (err) {
        if (attempt === 1) {
          throw err;
        }
      }
    }

    if (questions.length === 0) {
      throw new Error("Failed to generate a valid quiz. Please try again.");
    }

    // 5. Save dengan metadata lengkap
    const quizId: Id<"quizzes"> = await ctx.runMutation(api.quiz.save, {
      documentId: args.documentId,
      roomId: document.roomId,
      title: quizTitle,
      questions,
    });

    // 6. Broadcast ke chat room
    await ctx.runMutation(api.messages.sendQuizBroadcast, {
      roomId: document.roomId,
      quizId: quizId,
      title: quizTitle,
    });

    // 7. ── Increment daily quiz counter ──
    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
      await ctx.runMutation(internal.rateLimit.incrementQuizCount, {
        userId: identity.subject,
      });
    }

    return { quizId, title: quizTitle };
  },
});

export const submitAttempts = mutation({
  args: {
    quizId: v.id("quizzes"),
    score: v.number(),
    answers: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("Unauthorized");
    return await ctx.db.insert("attempts", {
      ...args,
      userId,
      createdAt: Date.now(),
    });
  },
});

export const getLatestByRoomId = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quizzes")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .order("desc")
      .first(); //
  },
});

/**
 * Returns { [quizId]: bestScore } for the current user.
 * Used to show "Nilai Tertinggi" on each QuizCard.
 */
export const getBestScores = query({
  args: {},
  handler: async (ctx): Promise<Record<string, number>> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return {};

    const attempts = await ctx.db
      .query("attempts")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    const best: Record<string, number> = {};
    for (const attempt of attempts) {
      const key = attempt.quizId as string;
      if (best[key] === undefined || attempt.score > best[key]) {
        best[key] = Math.round(attempt.score);
      }
    }
    return best;
  },
});
