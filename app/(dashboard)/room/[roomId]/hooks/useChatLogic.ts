"use client";

import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useState } from "react";

export type DocContext = {
  docId: string;
  docName: string;
  selectedText: string;
} | null;

export function useChatLogic(roomId: Id<"rooms">) {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Doc<"messages"> | null>(null);

  // ✅ STEP 1 & 6: State untuk Context Dokumen
  const [docContext, setDocContext] = useState<DocContext>(null);

  const sendMessage = useMutation(api.messages.send);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ STEP 8: Input Rules (Strict) - User harus menulis pesan
    if (!content.trim()) {
      console.warn("Tulis pertanyaan dulu");
      return;
    }

    if (!user) return;

    try {
      let finalContent = content;

      // ✅ STEP 9: Format Message (The Formatter)
      if (docContext) {
        // Format: 📄 DocName \n\n "SelectedText" \n\n @ai Pertanyaan
        finalContent = `📄 ${docContext.docName}\n\n"${docContext.selectedText}"\n\n@ai ${content}`;
      } else if (replyingTo) {
        // Handle reply biasa agar tetep ngetag AI kalau balas pesan AI
        const isReplyingToAi = replyingTo.type === "ai";
        if (isReplyingToAi && !content.toLowerCase().includes("@ai")) {
          finalContent = `@ai ${content}`;
        }
      } else {
        // Chat biasa (bukan reply/context) - pastikan ada @ai jika ingin AI jawab
        // Lu bisa atur di sini mau auto-tag @ai atau manual
      }

      // Cek apakah AI akan ter-trigger (Step 10)
      const isAiTriggered = finalContent.toLowerCase().includes("@ai");
      if (isAiTriggered) setIsAiThinking(true);

      await sendMessage({
        roomId,
        content: finalContent,
        replyToId: replyingTo?._id,
      });

      // ✅ STEP 9.4: Clear Context & State
      setContent("");
      setReplyingTo(null);
      setDocContext(null); // Clear context box
    } catch (err) {
      console.error("Failed to send message:", err);
      setIsAiThinking(false);
      console.error("Gagal mengirim pesan");
    }
  };

  // Fungsi pembantu untuk membatalkan context (Step 12.4)
  const clearDocContext = () => setDocContext(null);

  return {
    content,
    setContent,
    isAiThinking,
    setIsAiThinking,
    replyingTo,
    setReplyingTo,
    docContext, // ✅ Lempar ke UI ChatInput
    setDocContext, // ✅ Lempar ke UI DocumentPreview
    clearDocContext,
    handleSend,
  };
}
