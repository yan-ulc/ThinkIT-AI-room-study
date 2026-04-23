import { v } from "convex/values";
import { api } from "./_generated/api";
import { action, mutation, query } from "./_generated/server";
import { callAI } from "./utils";

type SummaryPayload = {
  summaryText: string;
  keyPoints: string[];
};

function isSummaryPayload(value: unknown): value is SummaryPayload {
  if (!value || typeof value !== "object") return false;
  const data = value as { summaryText?: unknown; keyPoints?: unknown };
  return (
    typeof data.summaryText === "string" &&
    Array.isArray(data.keyPoints) &&
    data.keyPoints.every((item) => typeof item === "string")
  );
}

// --- QUERIES ---
export const getByDocId = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("summaries")
      .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
      .first();
  },
});

// --- MUTATIONS ---
export const save = mutation({
  args: {
    documentId: v.id("documents"),
    summaryText: v.string(),
    keyPoints: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("Unauthorized");

    return await ctx.db.insert("summaries", {
      ...args,
      userId,
    });
  },
});

// --- ACTIONS (AI Logic) ---
export const generate = action({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args): Promise<SummaryPayload> => {
    // 1. Cek Cache via Query
    const cache: (SummaryPayload & { _id: unknown }) | null =
      await ctx.runQuery(api.summarize.getByDocId, {
        documentId: args.documentId,
      });
    if (cache) {
      return {
        summaryText: cache.summaryText,
        keyPoints: cache.keyPoints,
      };
    }

    // 2. Ambil Chunks
    const chunks: Array<{ text: string }> = await ctx.runQuery(
      api.documents.getChunks,
      { documentId: args.documentId },
    );
    if (chunks.length === 0) throw new Error("Document has no content.");

    // 3. Summarize all document chunks in one structured AI call.
    const combinedContent = chunks
      .map((chunk) => chunk.text.trim())
      .filter((text) => text.length > 0)
      .join("\n\n");

    const aiResponse = await callAI({
      mode: "summarize",
      content: combinedContent,
    });
    const parsedUnknown: unknown = JSON.parse(aiResponse);
    if (!isSummaryPayload(parsedUnknown)) {
      throw new Error("Invalid summarize payload from AI");
    }
    const parsed = parsedUnknown;

    // 5. Save & Return
    await ctx.runMutation(api.summarize.save, {
      documentId: args.documentId,
      summaryText: parsed.summaryText,
      keyPoints: parsed.keyPoints,
    });

    return parsed;
  },
});
