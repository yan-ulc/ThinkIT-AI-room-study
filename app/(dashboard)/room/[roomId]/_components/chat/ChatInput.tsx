"use client";

import { Button } from "@/components/ui/button";
import type { Id } from "@/convex/_generated/dataModel";
import { FileText, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { RoomMessage } from "../../hooks/useRoomData";
import { ReplyPreview } from "./replyPreview";

type SelectionContext = {
  type: "document";
  roomId: Id<"rooms">;
  docId: Id<"documents">;
  selectionId: Id<"documentSelections">;
  docName: string;
  selectedText: string;
} | null;

type ChatInputProps = {
  onSubmitText: (text: string) => Promise<void>;
  roomName: string;
  roomStatus?: "active" | "closed";
  memberStatus?: "active" | "removed";
  replyingTo: RoomMessage | null;
  setReplyingTo: (value: RoomMessage | null) => void;
  selectionContext: SelectionContext;
  onClearContext: () => void;
};

export function ChatInput({
  onSubmitText,
  roomName,
  roomStatus,
  memberStatus,
  replyingTo,
  setReplyingTo,
  selectionContext,
  onClearContext,
}: ChatInputProps) {
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const handleCancelReply = () => setReplyingTo(null);
  const replyingToLabel =
    replyingTo?.senderName ||
    (replyingTo?.type === "ai" ? "ThinkIT AI" : "User");
  const hasTopPreview = Boolean(replyingTo || selectionContext);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectionContext && roomStatus !== "closed" && memberStatus !== "removed") {
      inputRef.current?.focus();
    }
  }, [selectionContext, roomStatus, memberStatus]);

  const isSubmitDisabled = !draft.trim() || isSending || roomStatus === "closed" || memberStatus === "removed";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    try {
      setIsSending(true);
      await onSubmitText(draft);
      setDraft("");
    } catch {
      // Keep draft so user can retry if send fails.
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative z-10 shrink-0 bg-transparent px-4 pb-5 pt-2">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mx-auto w-full max-w-2xl">
          {/* Document context strip */}
          {selectionContext && (
            <div className="glass-panel mb-1 flex items-start gap-3 rounded-xl px-4 py-2.5">
              <FileText size={13} className="mt-0.5 shrink-0 text-primary/70" />
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-primary/80 mb-0.5">
                  {selectionContext.docName}
                </span>
                <p className="truncate text-[12px] italic leading-snug text-text-3">
                  &quot;{selectionContext.selectedText}&quot;
                </p>
              </div>
              <button
                type="button"
                onClick={onClearContext}
                className="rounded-md p-0.5 text-text-3 transition-colors hover:bg-border hover:text-text"
                title="Clear document context"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Reply preview */}
          <ReplyPreview replyingTo={replyingTo} onCancel={handleCancelReply} />

          {/* Input form */}
          <form
            onSubmit={handleSubmit}
            className={`glass-panel flex items-center gap-2 px-3 py-2 shadow-xl transition-colors focus-within:border-primary/70 focus-within:shadow-2xl
            ${hasTopPreview ? "rounded-xl" : "rounded-full"}`}
            style={{
              boxShadow:
                "0 18px 40px color-mix(in oklab, var(--foreground) 12%, transparent), 0 0 0 1px color-mix(in oklab, var(--border) 70%, transparent)",
            }}
          >
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={roomStatus === "closed" || memberStatus === "removed"}
              placeholder={
                memberStatus === "removed"
                  ? "You are no longer a member of this room."
                  : roomStatus === "closed"
                  ? "This room is closed. You can only view content."
                  : replyingTo
                    ? `Reply to ${replyingToLabel}…`
                    : `Ask something in #${roomName}…`
              }
              className="flex-1 border-none bg-transparent px-2 text-[14px] text-text outline-none placeholder:text-text-3 disabled:opacity-50"
            />

            <Button
              type="submit"
              size="icon"
              disabled={isSubmitDisabled}
              className={`h-8 w-8 shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 transition-colors ${isSending ? "send-burst" : ""}`}
              title={
                isSubmitDisabled ? "Write a question first" : "Send (Enter)"
              }
            >
              <Send size={13} />
            </Button>
          </form>

          {/* Subtle hint */}
          <p className="mt-2 px-2 text-[11px] text-text-3">
            {memberStatus === "removed"
              ? "You can still view previous content, but cannot interact."
              : roomStatus === "closed"
              ? "This room has been closed by the owner."
              : isSubmitDisabled
                ? "Type a question or thought to continue the discussion."
                : "Press Enter to send."}
          </p>
        </div>
      </div>
    </div>
  );
}
