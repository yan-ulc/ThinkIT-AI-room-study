import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

// Mutation internal untuk simpan data (Step 6.4)
export const storeChunkInternal = internalMutation({
  args: {
    documentId: v.id("documents"),
    roomId: v.id("rooms"),
    content: v.string(),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    if (args.embedding.length !== 768) {
      throw new Error(
        `Invalid embedding dimension ${args.embedding.length}; expected 768 for text-embedding-004`,
      );
    }

    await ctx.db.insert("documentChunks", {
      documentId: args.documentId,
      roomId: args.roomId,
      content: args.content,
      embedding: args.embedding,
    });
  },
});

export const getChunkById = internalQuery({
  args: {
    id: v.id("documentChunks"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getRoomChunksDebug = internalQuery({
  args: {
    roomId: v.id("rooms"),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const chunks = await ctx.db
      .query("documentChunks")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .take(args.limit);

    return chunks.map((chunk) => ({
      id: chunk._id,
      documentId: chunk.documentId,
      contentPreview: chunk.content.slice(0, 120),
      embeddingDimension: chunk.embedding.length,
    }));
  },
});
