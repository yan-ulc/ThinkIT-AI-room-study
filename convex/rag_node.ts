"use node";

import { GoogleGenAI } from "@google/genai";
import { v } from "convex/values";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { action } from "./_generated/server";

type ChunkDebugSample = {
  id: Id<"documentChunks">;
  documentId: Id<"documents">;
  contentPreview: string;
  embeddingDimension: number;
};

type RagDebugHit = {
  id: Id<"documentChunks">;
  score: number;
  contentPreview: string;
  embeddingDimension: number | null;
};

type RagDebugResult = {
  queryEmbeddingDimension: number;
  storedSampleCount: number;
  storedSamples: ChunkDebugSample[];
  vectorHitCount: number;
  topHits: RagDebugHit[];
};

// Generate real embeddings using Google embedding-001 via AI SDK.
async function generateEmbedding(text: string): Promise<number[]> {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY)
    throw new Error("GEMINI_API_KEY is missing in Env Variables");

  try {
    const googleGenAI = new GoogleGenAI({ apiKey: GEMINI_KEY });

    const response = await googleGenAI.models.embedContent({
      model: "gemini-embedding-001",
      contents: [text],
      config: {
        outputDimensionality: 768,
        taskType: "SEMANTIC_SIMILARITY",
      },
    });

    const embedding = response.embeddings?.[0]?.values;

    if (!Array.isArray(embedding) || embedding.length === 0) {
      throw new Error("Embedding response is empty or not an array");
    }

    if (embedding.length !== 768) {
      throw new Error(
        `Unexpected embedding dimension: ${embedding.length} (expected 768)`,
      );
    }

    return embedding;
  } catch (error) {
    console.error("GoogleGenAI embedding error:", error);
    throw error;
  }
}

export const ingestDocument = action({
  args: {
    documentId: v.id("documents"),
    fileUrl: v.string(),
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const response = await fetch(args.fileUrl);
    if (!response.ok) {
      throw new Error(
        `[RAG][ingest] Failed to fetch file: ${response.status} ${response.statusText}`,
      );
    }

    const fileBuffer = await response.arrayBuffer();

    // Parse PDF binary into plain text suitable for chunking + embedding.
    const parsed = await pdfParse(Buffer.from(fileBuffer));

    const fullText = (parsed?.text ?? "").trim();

    if (fullText.length === 0) {
      throw new Error(
        "[RAG][ingest] Extracted text is empty. File may be scanned/image-only PDF.",
      );
    }

    const chunkSize = 1000;
    const chunks: string[] = [];
    for (let i = 0; i < fullText.length; i += chunkSize) {
      const chunk = fullText.substring(i, i + chunkSize).trim();
      if (chunk.length > 0) {
        chunks.push(chunk);
      }
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      // Generate real embedding for this chunk
      const embedding = await generateEmbedding(chunk);

      await ctx.runMutation((internal as any).rag.storeChunkInternal, {
        documentId: args.documentId,
        roomId: args.roomId,
        content: chunk,
        embedding: embedding,
      });
    }
  },
});

export const searchRelevance = action({
  args: {
    roomId: v.id("rooms"),
    query: v.string(),
  },
  handler: async (ctx, args): Promise<string[]> => {
    // Generate real embedding for the query
    const queryEmbedding = await generateEmbedding(args.query);

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

export const debugRagPipeline = action({
  args: {
    roomId: v.id("rooms"),
    query: v.string(),
  },
  handler: async (ctx, args): Promise<RagDebugResult> => {
    const storedChunks: ChunkDebugSample[] = await ctx.runQuery(
      (internal as any).rag.getRoomChunksDebug,
      {
        roomId: args.roomId,
        limit: 5,
      },
    );

    const queryEmbedding = await generateEmbedding(args.query);
    const vectorResults = await ctx.vectorSearch(
      "documentChunks",
      "by_embedding",
      {
        vector: queryEmbedding,
        filter: (q) => q.eq("roomId", args.roomId),
        limit: 3,
      },
    );

    const topHits: RagDebugHit[] = await Promise.all(
      vectorResults.map(async (res) => {
        const chunk: Doc<"documentChunks"> | null = await ctx.runQuery(
          (internal as any).rag.getChunkById,
          { id: res._id },
        );
        return {
          id: res._id,
          score: res._score,
          contentPreview: chunk?.content.slice(0, 120) ?? "",
          embeddingDimension: chunk?.embedding.length ?? null,
        };
      }),
    );

    const result: RagDebugResult = {
      queryEmbeddingDimension: queryEmbedding.length,
      storedSampleCount: storedChunks.length,
      storedSamples: storedChunks,
      vectorHitCount: vectorResults.length,
      topHits,
    };
    return result;
  },
});
