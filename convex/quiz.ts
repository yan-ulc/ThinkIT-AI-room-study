import { v } from "convex/values";
import { api } from "./_generated/api";
import { action, mutation, query } from "./_generated/server";
import { callAI } from "./utils";

// --- QUERIES ---
export const getByDocId = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quizzes")
      .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
      .first();
  },
});

// --- MUTATIONS ---
export const save = mutation({
  args: {
    documentId: v.id("documents"),
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
      ...args,
      userId,
    });
  },
});

// --- ACTIONS ---
export const generate = action({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    // 1. Ambil Summary (Wajib ada)
    const summary = await ctx.runQuery(api.summarize.getByDocId, {
      documentId: args.documentId,
    });
    if (!summary) throw new Error("Generate summary first!");

    // 2. Generate quiz items from summary with structured mode.
    const aiResponse = await callAI({
      mode: "quiz",
      content: summary.summaryText,
    });
    const questions = JSON.parse(aiResponse);

    // 3. Save
    await ctx.runMutation(api.quiz.save, {
      documentId: args.documentId,
      questions,
    });

    return questions;
  },
});

export const submitQuiz = mutation({
  args: {
    documentId: v.id("documents"),
    quizId: v.id("quizzes"),
    score: v.number(),
    answers: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("Unauthorized");
    return await ctx.db.insert("quizSubmissions", { ...args, userId, createdAt: Date.now() });
  },
});