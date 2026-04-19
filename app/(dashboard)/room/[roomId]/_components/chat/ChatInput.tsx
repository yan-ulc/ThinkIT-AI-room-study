"use client";

import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import type { RoomMessage } from "../../hooks/useRoomData";
import { ReplyPreview } from "./replyPreview";

type ChatInputProps = {
  content: string;
  setContent: (value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  roomName: string;
  replyingTo: RoomMessage | null;
  setReplyingTo: (value: RoomMessage | null) => void;
};

export function ChatInput({
  content,
  setContent,
  onSubmit,
  roomName,
  replyingTo,
  setReplyingTo,
}: ChatInputProps) {
  const handleCancelReply = () => setReplyingTo(null);
  const replyingToLabel =
    replyingTo?.senderName ||
    (replyingTo?.type === "ai" ? "ThinkIT AI" : "User");

  return (
    <div className="shrink-0 border-t border-border bg-white p-4">
      {/* ✅ Bar Preview muncul di sini kalau ada pesan yang mau di-reply */}
      <ReplyPreview replyingTo={replyingTo} onCancel={handleCancelReply} />

      <form
        onSubmit={onSubmit}
        className={`flex gap-2 max-w-4xl mx-auto w-full bg-surface2 border border-border-strong p-2 focus-within:border-primary transition-all shadow-sm
          ${replyingTo ? "rounded-b-xl border-t-0" : "rounded-xl"}`}
      >
        {/* ^ Logic class di atas biar visualnya nyambung sama ReplyPreview */}

        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            replyingTo
              ? `Reply to ${replyingToLabel}...`
              : `Message #${roomName}...`
          }
          className="flex-1 bg-transparent border-none outline-none px-2 text-base text-text md:text-sm"
        />

        <Button
          type="submit"
          size="icon"
          disabled={!content.trim()}
          className="bg-primary hover:bg-primary-light h-8 w-8 rounded-lg shrink-0 disabled:opacity-50"
        >
          <Send size={14} />
        </Button>
      </form>
    </div>
  );
}
