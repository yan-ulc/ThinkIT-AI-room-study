import { v } from "convex/values";
import { api } from "./_generated/api";
import { mutation, query } from "./_generated/server";

// STEP 5.1 — Generate Upload URL (Built-in Convex Storage)
// Digunakan frontend untuk mendapatkan "pintu" upload
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// STEP 5.2 — Save Metadata ke DB + Trigger RAG
export const create = mutation({
  args: {
    roomId: v.id("rooms"),
    storageId: v.id("_storage"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Auth Check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found di database ThinkIT");

    // STEP 5.3 — Access Control: Cek apakah user memang member room tersebut
    const membership = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", args.roomId).eq("userId", user._id),
      )
      .unique();

    if (!membership)
      throw new Error("Akses ditolak: Kamu bukan member room ini!");

    // Ambil URL publik dari storageId untuk referensi download/view
    const fileUrl = (await ctx.storage.getUrl(args.storageId)) as string;

    // Simpan record dokumen
    const docId = await ctx.db.insert("documents", {
      roomId: args.roomId,
      name: args.name,
      fileUrl,
      storageId: args.storageId,
      uploadedBy: user._id,
    });

    /**
     * 🔥 CRITICAL STEP: RAG TRIGGER
     * Kita jadwalkan Action 'ingestDocument' untuk jalan di background.
     * Supaya user nggak nungguin proses ekstraksi teks yang lama.
     */
    await ctx.scheduler.runAfter(0, api.rag_node.ingestDocument, {
      documentId: docId,
      fileUrl: fileUrl,
      roomId: args.roomId,
    });

    return docId;
  },
});

// STEP 5.4 — List Documents by Room
// Menampilkan semua file yang ada di panel kanan (Right Panel)
export const list = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Validasi member sebelum kasih list file (Security)
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const membership = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", args.roomId).eq("userId", user._id),
      )
      .unique();

    if (!membership) return [];

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();

    return documents;
  },
});

export const remove = mutation({
  args: { id: v.id("documents"), storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    // 1. Hapus metadata dari tabel documents
    await ctx.db.delete(args.id);
    // 2. Hapus file fisik dari Convex Storage
    await ctx.storage.delete(args.storageId);
    
    // 3. (Optional) Hapus chunks terkait biar gak nyampah di vector search
    const chunks = await ctx.db
      .query("documentChunks")
      .withIndex("by_documentId", (q) => q.eq("documentId", args.id))
      .collect();
    
    for (const chunk of chunks) {
      await ctx.db.delete(chunk._id);
    }
  },
});