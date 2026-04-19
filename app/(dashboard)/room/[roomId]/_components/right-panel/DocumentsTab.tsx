"use client";

import type { Doc, Id } from "@/convex/_generated/dataModel";
import { DocumentItem } from "./DocumentItem";
import { UploadButton } from "./UploadButton";

type DocumentsTabProps = {
  docs: Doc<"documents">[] | undefined;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  deletingDocId: Id<"documents"> | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onDelete: (
    id: Id<"documents">,
    storageId: Id<"_storage">,
    name: string,
  ) => Promise<void>;
};

export function DocumentsTab({
  docs,
  fileInputRef,
  deletingDocId,
  onUpload,
  onDelete,
}: DocumentsTabProps) {
  return (
    <div className="p-4 space-y-4">
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={onUpload}
        accept=".pdf,.txt,.doc,.docx"
      />

      <UploadButton onClick={() => fileInputRef.current?.click()} />

      <div className="space-y-2 mt-4">
        {docs === undefined ? (
          <p className="text-[12px] text-text-3">Loading documents...</p>
        ) : docs.length === 0 ? (
          <p className="text-[12px] text-text-3">
            No documents yet. Upload one to see it here.
          </p>
        ) : (
          docs.map((doc) => (
            <DocumentItem
              key={doc._id}
              id={doc._id}
              name={doc.name}
              fileUrl={doc.fileUrl}
              storageId={doc.storageId}
              deletingDocId={deletingDocId}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
