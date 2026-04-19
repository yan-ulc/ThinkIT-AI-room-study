import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 1. USERS - Mirror data dari Clerk
  users: defineTable({
    clerkId: v.string(),
    username: v.string(),
    displayName: v.string(),
    imageUrl: v.optional(v.string()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_username", ["username"]),

  // 2. ROOMS
  rooms: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    isPrivate: v.boolean(),
    createdBy: v.id("users"),
  }),

  // 3. ROOM MEMBERS - Many-to-Many Bridge
  roomMembers: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("member")),
  })
    .index("by_roomId", ["roomId"])
    .index("by_userId", ["userId"])
    .index("by_room_and_user", ["roomId", "userId"]),

  // 4. MESSAGES
  messages: defineTable({
    roomId: v.id("rooms"),
    // Keep null temporarily for backward compatibility with existing AI records.
    senderId: v.union(
      v.id("users"),
      v.literal("ai"),
      v.literal("system"),
      v.null(),
    ),
    senderName: v.optional(v.string()),
    senderImage: v.optional(v.string()),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("ai"), v.literal("system")),
    replyToId: v.optional(v.id("messages")),
    mentionedUsers: v.array(v.string()), // Simpan username atau ID untuk mention
    metadata: v.optional(
      v.object({
        model: v.optional(v.string()),
        tokens: v.optional(v.number()),
        sources: v.optional(v.array(v.string())),
      }),
    ),
  })
    .index("by_roomId", ["roomId"])
    .index("by_replyTo", ["replyToId"]),

  // 5. DOCUMENTS
  documents: defineTable({
    roomId: v.id("rooms"),
    name: v.string(),
    fileUrl: v.string(),
    storageId: v.id("_storage"), // Id internal Convex storage
    uploadedBy: v.id("users"),
  }).index("by_roomId", ["roomId"]),

  // 6. DOCUMENT CHUNKS - Persiapan RAG
  documentChunks: defineTable({
    documentId: v.id("documents"),
    roomId: v.id("rooms"),
    content: v.string(),
    embedding: v.array(v.float64()), // Vector untuk similarity search
  })
    .index("by_documentId", ["documentId"])
    .index("by_roomId", ["roomId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 768, // text-embedding-004 output dimension
      filterFields: ["roomId"],
    }),
});
