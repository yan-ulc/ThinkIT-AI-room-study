import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";

export function useChatLogic(roomId: Id<"rooms">) {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Doc<"messages"> | null>(null); // ✅ State untuk Reply

  const sendMessage = useMutation(api.messages.send);

  // app/(dashboard)/room/[roomId]/_hooks/useChatLogic.ts

const handleSend = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!content.trim() || !user) return;

  // 1. Logika Sakti: Cek apakah kita lagi nge-reply AI
  const isReplyingToAi = replyingTo?.type === "ai";
  
  // 2. Tambahin @ai secara paksa kalau belum ada di konten
  let finalContent = content;
  if (isReplyingToAi && !content.toLowerCase().includes("@ai")) {
    finalContent = `@ai ${content}`;
  }

  // 3. Sisanya sama, kirim ke mutation
  try {
    await sendMessage({
      roomId,
      content: finalContent, // Pakai finalContent yang udah ada @ai-nya
      replyToId: replyingTo?._id,
    });
    
    setContent("");
    setReplyingTo(null);
  } catch (err) {
    console.error(err);
  }
}
}