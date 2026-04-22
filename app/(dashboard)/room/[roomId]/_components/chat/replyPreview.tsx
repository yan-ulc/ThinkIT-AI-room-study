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
    <div className="mx-auto flex w-full max-w-4xl animate-in items-center justify-between overflow-hidden rounded-t-lg border-l-4 border-primary bg-surface2 px-4 py-2 slide-in-from-bottom-2">
      {/* 1. Tambahin 'min-w-0' dan 'flex-1' di sini biar dia mau ngalah sama tombol 'X' */}
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
        <CornerDownRight size={14} className="shrink-0 text-primary" />

        {/* 2. 'min-w-0' di sini wajib banget supaya 'truncate' di bawahnya jalan */}
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="block w-full truncate text-[11px] font-bold text-primary">
            Replying to {senderLabel}
          </span>

          {/* 3. Tambahin 'block w-full' supaya truncate-nya tahu batas maksimalnya */}
          <span className="block w-full truncate text-[12px] italic leading-tight text-text-2">
            {previewText}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="ml-4 shrink-0 rounded-full p-1 text-text-3 transition-colors hover:bg-surface hover:text-text"
      >
        <X size={14} />
      </button>
    </div>
  );
}
