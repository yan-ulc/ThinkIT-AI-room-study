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
    <div className="mx-auto flex w-full max-w-4xl items-center justify-between overflow-hidden rounded-t-lg border-l-4 border-primary bg-slate-100 px-4 py-2 animate-in slide-in-from-bottom-2">
      {/* 1. Tambahin 'min-w-0' dan 'flex-1' di sini biar dia mau ngalah sama tombol 'X' */}
      <div className="flex items-center gap-2 overflow-hidden min-w-0 flex-1">
        <CornerDownRight size={14} className="text-primary shrink-0" />

        {/* 2. 'min-w-0' di sini wajib banget supaya 'truncate' di bawahnya jalan */}
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[11px] font-bold text-primary truncate block w-full">
            Replying to {senderLabel}
          </span>

          {/* 3. Tambahin 'block w-full' supaya truncate-nya tahu batas maksimalnya */}
          <span className="text-[12px] text-slate-500 truncate italic block w-full leading-tight">
            {previewText}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="ml-4 p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}
