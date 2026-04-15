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
