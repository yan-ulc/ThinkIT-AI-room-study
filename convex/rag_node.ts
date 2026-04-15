"use node";

import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { action } from "./_generated/server";

export const ingestDocument = action({
  args: {
    documentId: v.id("documents"),
    fileUrl: v.string(),
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const response = await fetch(args.fileUrl);
    const buffer = await response.arrayBuffer();
    const fullText = new TextDecoder("utf-8").decode(buffer);

    const chunkSize = 1000;
    const chunks: string[] = [];
    for (let i = 0; i < fullText.length; i += chunkSize) {
      chunks.push(fullText.substring(i, i + chunkSize));
    }

    for (const chunk of chunks) {
      const dummyEmbedding = new Array(1536).fill(0).map(() => Math.random());

      await ctx.runMutation((internal as any).rag.storeChunkInternal, {
        documentId: args.documentId,
        roomId: args.roomId,
        content: chunk,
        embedding: dummyEmbedding,
      });
    }

    console.log(
      `Ingested ${chunks.length} chunks for document ${args.documentId}`,
    );
  },
});

export const searchRelevance = action({
  args: {
    roomId: v.id("rooms"),
    query: v.string(),
  },
  handler: async (ctx, args): Promise<string[]> => {
    const queryEmbedding = new Array(1536).fill(0).map(() => Math.random());

    const results = await ctx.vectorSearch("documentChunks", "by_embedding", {
      vector: queryEmbedding,
      filter: (q) => q.eq("roomId", args.roomId),
      limit: 3,
    });

    const chunks: Array<string | null> = await Promise.all(
      results.map(async (res) => {
        const chunk: Doc<"documentChunks"> | null = await ctx.runQuery(
          (internal as any).rag.getChunkById,
          {
            id: res._id,
          },
        );
        return chunk?.content ?? null;
      }),
    );

    return chunks.filter((value): value is string => value !== null);
  },
});
