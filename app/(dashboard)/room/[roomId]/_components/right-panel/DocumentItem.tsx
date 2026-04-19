"use client";

import type { Id } from "@/convex/_generated/dataModel";
import { FileText, Trash2 } from "lucide-react";

type DocumentItemProps = {
  id: Id<"documents">;
  name: string;
  fileUrl: string;
  storageId: Id<"_storage">;
  deletingDocId: Id<"documents"> | null;
  onDelete: (
    id: Id<"documents">,
    storageId: Id<"_storage">,
    name: string,
  ) => Promise<void>;
};

export function DocumentItem({
  id,
  name,
  fileUrl,
  storageId,
  deletingDocId,
  onDelete,
}: DocumentItemProps) {
  return (
    <div className="flex items-center gap-2 p-2 border rounded-lg hover:bg-slate-50 transition-all">
      <a
        href={fileUrl}
        target="_blank"
        rel="noreferrer"
        className="flex min-w-0 flex-1 items-center gap-2 cursor-pointer"
      >
        <FileText size={16} className="text-primary shrink-0" />
        <span className="text-[12px] font-medium truncate">{name}</span>
      </a>
      <button
        type="button"
        onClick={() => onDelete(id, storageId, name)}
        disabled={deletingDocId === id}
        className="shrink-0 rounded p-1 text-text-3 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
        title="Delete document"
        aria-label={`Delete ${name}`}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
