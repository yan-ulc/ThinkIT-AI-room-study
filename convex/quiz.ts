import { v } from "convex/values";
import { api } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { action, mutation, query } from "./_generated/server";
import { callAI } from "./utils";

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
    if (membership.role !== "admin")
      throw new Error("Hanya admin yang bisa menghapus quiz");

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

    // 3. Ambil quiz sebelumnya (optional - anti duplicate)
    const previousQuizzes: Doc<"quizzes">[] = await ctx.runQuery(
      api.quiz.getByRoomId,
      {
        roomId: document.roomId,
      },
    );

    // ambil semua pertanyaan lama (biar AI avoid)
    const previousQuestions = previousQuizzes
      .sort((a, b) => b.createdAt - a.createdAt) // terbaru dulu
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
    const aiResponse = await callAI({
      mode: "quiz",
      content: summaryText,
      context: {
        previousQuestions,
        title: quizTitle,
        questionCount: args.questionCount ?? 5,
      },
    });

    const questions: Array<{
      question: string;
      options: string[];
      answer: string;
    }> = JSON.parse(aiResponse);

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
