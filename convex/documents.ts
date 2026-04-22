import { v } from "convex/values";
import { api } from "./_generated/api";
import { internalQuery, mutation, query } from "./_generated/server";

const MIN_SELECTION_LENGTH = 10;
const MAX_SELECTION_LENGTH = 900;

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
     * CRITICAL STEP: RAG TRIGGER
     * Supaya user gk tunggu proses ekstraksi teks .
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

    return await Promise.all(
      documents.map(async (doc) => {
        const chunks = await ctx.db
          .query("documentChunks")
          .withIndex("by_documentId", (q) => q.eq("documentId", doc._id))
          .take(24);

        const previewContent = chunks
          .map((chunk) => chunk.content)
          .join("\n\n");

        return {
          ...doc,
          previewContent,
        };
      }),
    );
  },
});

export const remove = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error("Document not found");

    const membership = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", doc.roomId).eq("userId", user._id),
      )
      .unique();
    if (!membership) throw new Error("Akses ditolak: bukan member room ini!");

    // (Optional) tighten further: only uploader or admin may delete
    // if (doc.uploadedBy !== user._id && membership.role !== "admin") {
    //   throw new Error("Hanya uploader atau admin yang boleh menghapus");
    // }

    // 1. Hapus chunks terkait dulu
    const chunks = await ctx.db
      .query("documentChunks")
      .withIndex("by_documentId", (q) => q.eq("documentId", args.id))
      .collect();

    for (const chunk of chunks) {
      await ctx.db.delete(chunk._id);
    }

    // 2. Hapus metadata
    await ctx.db.delete(args.id);
    // 3. Hapus file fisik — pakai storageId dari record, bukan dari client
    await ctx.storage.delete(doc.storageId);
  },
});

export const createSelection = mutation({
  args: {
    roomId: v.id("rooms"),
    documentId: v.id("documents"),
    selectedText: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const membership = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", args.roomId).eq("userId", user._id),
      )
      .unique();
    if (!membership) throw new Error("Forbidden: not a room member");

    const document = await ctx.db.get(args.documentId);
    if (!document || document.roomId !== args.roomId) {
      throw new Error("Document not found in this room");
    }

    const normalizedText = args.selectedText.replace(/\s+/g, " ").trim();
    if (normalizedText.length < MIN_SELECTION_LENGTH) {
      throw new Error(
        `Selection too short. Minimum ${MIN_SELECTION_LENGTH} characters required.`,
      );
    }
    if (normalizedText.length > MAX_SELECTION_LENGTH) {
      throw new Error(
        `Selection too long (≈${normalizedText.length}). Reduce selection.`,
      );
    }

    return await ctx.db.insert("documentSelections", {
      roomId: args.roomId,
      documentId: args.documentId,
      selectedBy: user._id,
      selectedText: normalizedText,
      status: "active",
    });
  },
});

export const cancelSelection = mutation({
  args: { selectionId: v.id("documentSelections") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const selection = await ctx.db.get(args.selectionId);
    if (!selection) return;
    if (selection.selectedBy !== user._id) {
      throw new Error("Forbidden: cannot cancel another user's selection");
    }

    await ctx.db.patch(args.selectionId, { status: "canceled" });
  },
});

export const getSelectionById = internalQuery({
  args: { selectionId: v.id("documentSelections") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.selectionId);
  },
});

export const getByIdInternal = internalQuery({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId);
  },
});
