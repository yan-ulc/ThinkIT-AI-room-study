import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { internalAction, internalMutation } from "./_generated/server";
import { Interactions } from "@google/genai";
type PrimaryChoiceMessage = {
  message?: { content?: unknown };
  text?: unknown;
};

type PrimaryResponse = {
  choices?: PrimaryChoiceMessage[];
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: unknown }>;
    };
  }>;
};

function extractPrimaryText(data: unknown): string | null {
  const typed = data as PrimaryResponse;
  // Support common OpenAI-compatible shapes.
  if (typeof typed?.choices?.[0]?.message?.content === "string") {
    return typed.choices[0].message.content;
  }
  if (typeof typed?.choices?.[0]?.text === "string") {
    return typed.choices[0].text;
  }
  return null;
}

function extractGeminiText(data: unknown): string | null {
  const typed = data as GeminiResponse;
  if (typeof typed?.candidates?.[0]?.content?.parts?.[0]?.text === "string") {
    return typed.candidates[0].content.parts[0].text;
  }
  return null;
}

function extractDocumentSelection(message: string): {
  docName: string;
  selectedText: string;
  userMessage: string;
} | null {
  const match = message.match(
    /^📄\s*(.+?)\n\n"([\s\S]*?)"\n\n@ai\s*([\s\S]*)$/,
  );
  if (!match) return null;

  return {
    docName: match[1].trim(),
    selectedText: match[2].trim(),
    userMessage: match[3].trim(),
  };
}

export const chatWithAi = internalAction({
  args: {
    roomId: v.id("rooms"),
    message: v.string(),
    replyToId: v.optional(v.id("messages")), // Optional ID pesan yang di-reply
    selectionId: v.optional(v.id("documentSelections")),
  },
  handler: async (ctx, args) => {
    const extractedContext = extractDocumentSelection(args.message);
    const explicitUserMessage = extractedContext?.userMessage ?? args.message;
    const cleanedUserMessage = explicitUserMessage
      .replace(/@ai\b/gi, "")
      .trim();

    let selectedText = extractedContext?.selectedText ?? "";
    let selectedDocName = extractedContext?.docName ?? "";
    if (args.selectionId) {
      const selection = await ctx.runQuery(
        internal.documents.getSelectionById,
        {
          selectionId: args.selectionId,
        },
      );

      if (selection && selection.roomId === args.roomId) {
        selectedText = selection.selectedText;

        const doc = await ctx.runQuery(internal.documents.getByIdInternal, {
          documentId: selection.documentId,
        });
        selectedDocName = doc?.name ?? selectedDocName;
      }
    }

    let replyContext = "";
    if (args.replyToId) {
      const repliedMsg = await ctx.runQuery(internal.messages.getById, {
        id: args.replyToId,
      });
      if (repliedMsg) {
        const sender = repliedMsg.senderName || "previous message";
        const normalized = repliedMsg.content.replace(/\s+/g, " ").trim();
        const snippet =
          normalized.length > 180
            ? `${normalized.slice(0, 180).trim()}...`
            : normalized;
        replyContext = `\nThe user is replying to ${sender}: "${snippet}".`;
      }
    }

    // --- 1. AMBIL CONTEXT DARI PDF (RAG) ---
    let chunks: string[] = [];
    try {
      // searchRelevance uses Gemini v1beta + text-embedding-004 (768 dims)
      chunks = await ctx.runAction(api.rag_node.searchRelevance, {
        roomId: args.roomId,
        query: `${cleanedUserMessage} ${selectedText}`.trim(),
      });
    } catch (error) {
      console.error("RAG searchRelevance failed", error);
    }
    const context = chunks
      .slice(0, 3)
      .map((chunk) => chunk.trim())
      .filter((chunk) => chunk.length > 0)
      .join("\n\n");

    // --- 2. AMBIL 10 CHAT TERAKHIR (BIAR GAK PIKUN) ---
    // Kita panggil query buat ambil sejarah chat
    const lastMessages: Array<{
      type: "text" | "ai" | "system";
      content: string;
    }> = await ctx.runQuery(internal.messages.getRecentMessages, {
      roomId: args.roomId,
      limit: 12,
    });

    // Query returns newest-first; prompt should be oldest-first.
    const orderedHistory = [...lastMessages].reverse();

    // Kita ubah formatnya jadi format yang AI ngerti (role: user/assistant)
    const history = orderedHistory
      .filter((m) => m.content.trim().length > 0)
      .map((m) => ({
        role: m.type === "ai" ? "assistant" : "user",
        content: m.content,
      }));

    // --- 3. GABUNGIN SEMUANYA BUAT DIKIRIM KE AI ---
    const aiMessages = [
      {
        role: "system",
        content: `You are ThinkIT AI, a smart study assistant.
Focus on selected text first, then retrieval context, then recent history.
Explain clearly and simply.
Do not go out of context unless truly necessary.

PRIMARY SELECTED CONTEXT (highest priority):
Document: ${selectedDocName || "N/A"}
${selectedText || "No selected text provided."}

RETRIEVAL CONTEXT (secondary):
${context || "No retrieval context."}${replyContext}`,
      },
      ...history, // Ini sejarah chat tadi
      {
        role: "user",
        content: cleanedUserMessage || explicitUserMessage,
      }, // Ini pertanyaan terakhir user
    ];

    let responseText = "";

    // --- 4. KIRIM KE AI (GROQ / GEMINI) ---
    try {
      const response = await fetch(
        process.env.GROQ_API_URL ??
          "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: aiMessages, // <--- Sekarang kirim aiMessages (pake history)
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        const parsed = extractPrimaryText(data);
        if (!parsed) {
          throw new Error("Primary response schema unsupported");
        }
        responseText = parsed;
      } else {
        throw new Error("Groq Fail");
      }
    } catch {
      // FALLBACK KE GEMINI JIKA DO GAGAL
      const geminiResp = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: aiMessages.map((m) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }],
            })),
          }),
        },
      );
      const data = await geminiResp.json();
      const parsed = extractGeminiText(data);
      if (!parsed) {
        console.error("Gemini unexpected response:", JSON.stringify(data));
        responseText =
          "AI lagi gangguan sementara. Coba kirim ulang sebentar lagi.";
      } else {
        responseText = parsed;
      }
    }

    // --- 5. SIMPAN JAWABAN AI ---
    await ctx.runMutation(internal.ai.storeAiMessage, {
      roomId: args.roomId,
      content: responseText,
    });
  },
});

export const storeAiMessage = internalMutation({
  args: { roomId: v.id("rooms"), content: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      roomId: args.roomId,
      senderId: "ai",
      senderName: "ThinkIT AI",
      content: args.content,
      type: "ai",
      mentionedUsers: [],
      metadata: {
        model: "llama-3.3-70b-versatile",
      },
    });

    const memberships = await ctx.db
      .query("roomMembers")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();

    for (const member of memberships) {
      await ctx.db.patch(member._id, {
        unreadCount: (member.unreadCount ?? 0) + 1,
      });
    }
  },
});

export const updateAiMessage = internalMutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
    isDone: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      content: args.content,
      // Kita bisa tambah field isTyping di schema buat handle UI
    });
  },
});
