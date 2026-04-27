import { CornerDownRight, X } from "lucide-react";
import type { RoomMessage } from "../../hooks/useRoomData";

interface ReplyPreviewProps {
  replyingTo: RoomMessage | null;
  onCancel: () => void;
}

export function ReplyPreview({ replyingTo, onCancel }: ReplyPreviewProps) {
  if (!replyingTo) return null;

  const senderLabel =
    replyingTo.senderName || (replyingTo.type === "ai" ? "ThinkIT AI" : "User");
  const previewText = replyingTo.content.replace(/\s+/g, " ").trim();

  return (
    <div
      className="
        reply-enter mb-1 flex items-center justify-between overflow-hidden
        rounded-t-xl border-l-2 border-primary
        bg-primary/6 px-3.5 py-2.5
        backdrop-blur-sm
      "
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden">
        <CornerDownRight size={12} className="shrink-0 text-primary" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="block text-[10.5px] font-semibold uppercase tracking-wide text-primary leading-none">
            Replying to {senderLabel}
          </span>
          <span className="block w-full truncate text-[12px] italic leading-snug text-text-2">
            {previewText}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="
          ml-3 shrink-0 flex h-5 w-5 items-center justify-center
          rounded-full text-text-3
          transition-colors duration-150
          hover:bg-border hover:text-text-1
        "
      >
        <X size={12} />
      </button>
    </div>
  );
}
