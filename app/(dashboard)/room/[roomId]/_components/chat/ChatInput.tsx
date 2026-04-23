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
  replyingTo: RoomMessage | null;
  setReplyingTo: (value: RoomMessage | null) => void;
  selectionContext: SelectionContext;
  onClearContext: () => void;
};

export function ChatInput({
  onSubmitText,
  roomName,
  replyingTo,
  setReplyingTo,
  selectionContext,
  onClearContext,
}: ChatInputProps) {
  const [draft, setDraft] = useState("");
  const handleCancelReply = () => setReplyingTo(null);
  const replyingToLabel =
    replyingTo?.senderName ||
    (replyingTo?.type === "ai" ? "ThinkIT AI" : "User");
  const hasTopPreview = Boolean(replyingTo || selectionContext);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectionContext) {
      inputRef.current?.focus();
    }
  }, [selectionContext]);

  const isSubmitDisabled = !draft.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    try {
      await onSubmitText(draft);
      setDraft("");
    } catch {
      // Keep draft so user can retry if send fails.
    }
  };

  return (
    <div className="shrink-0 border-t border-border bg-surface px-4 pt-3 pb-4">
      <div className="mx-auto w-full max-w-3xl">
        {/* Document context strip */}
        {selectionContext && (
          <div className="mb-0 flex items-start gap-3 rounded-t-xl border border-b-0 border-border bg-muted/60 px-4 py-2.5">
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
          className={`flex items-center gap-2 border border-border-strong bg-surface2 px-3 py-2 shadow-sm transition-all focus-within:border-primary focus-within:shadow-md
            ${hasTopPreview ? "rounded-b-xl border-t-0" : "rounded-xl"}`}
        >
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={
              replyingTo
                ? `Reply to ${replyingToLabel}…`
                : `Ask something in #${roomName}…`
            }
            className="flex-1 bg-transparent border-none outline-none px-1 text-[14px] text-text placeholder:text-text-3"
          />

          <Button
            type="submit"
            size="icon"
            disabled={isSubmitDisabled}
            className="h-7 w-7 shrink-0 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-30 transition-all"
            title={isSubmitDisabled ? "Write a question first" : "Send (Enter)"}
          >
            <Send size={13} />
          </Button>
        </form>

        {/* Subtle hint */}
        <p className="mt-1.5 text-[11px] text-text-3 px-1">
          {isSubmitDisabled
            ? "Type a question or thought to continue the discussion."
            : "Press Enter to send."}
        </p>
      </div>
    </div>
  );
}
