"use client";

import type { Id } from "@/convex/_generated/dataModel";
import { ExternalLink, FileText, Trash2 } from "lucide-react";

type DocumentItemProps = {
  id: Id<"documents">;
  name: string;
  fileUrl: string;
  storageId: Id<"_storage">;
  deletingDocId: Id<"documents"> | null;
  onPreview: () => void;
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
  onPreview,
  onDelete,
}: DocumentItemProps) {
  const isDeleting = deletingDocId === id;
  const isPdf = name.toLowerCase().endsWith(".pdf");

  return (
    <div
      className={`group flex items-center gap-2 rounded-lg border border-border  px-2.5 py-2 transition-all bg-primary hover:border-border-strong hover:shadow-sm ${
        isDeleting ? "opacity-50" : ""
      }`}
    >
      {/* Preview button — takes up most of the row */}
      <button
        type="button"
        onClick={onPreview}
        className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
        title={`Preview ${name}`}
        disabled={isDeleting}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-accent border-border bg-surface2">
          <FileText size={13} className="text-primary/70" />
        </div>
        <div className="min-w-0">
          <span className="block truncate text-[12px] font-medium text-background leading-snug">
            {name}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-background  -3">
            {isPdf ? "PDF" : name.split(".").pop()?.toUpperCase() ?? "File"}
          </span>
        </div>
      </button>

      {/* Actions — visible on hover */}
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity  group-hover:opacity-100">
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-md p-1 text-text-3 transition-colors hover:bg-muted hover:text-foreground text-background"
          title="Open in new tab"
          aria-label={`Open ${name} in new tab`}
        >
          <ExternalLink size={13} />
        </a>

        <button
          type="button"
          onClick={() => onDelete(id, storageId, name)}
          disabled={isDeleting}
          className="rounded-md p-1 text-text-3 transition-colors text-background hover:bg-muted hover:text-destructive disabled:opacity-40"
          title="Delete document"
          aria-label={`Delete ${name}`}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}