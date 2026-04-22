"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { FileText, X } from "lucide-react";
import { useEffect, useState, type ChangeEvent, type RefObject } from "react";
import type { DocumentContext, RoomDocument } from "../../hooks/useRoomData";
import { DocumentPreview } from "../docs/DocumentPreview";
import { DocumentItem } from "./DocumentItem";
import { UploadButton } from "./UploadButton";

type DocumentsTabProps = {
  roomId: Id<"rooms">;
  docs: RoomDocument[] | undefined;
  fileInputRef: RefObject<HTMLInputElement | null>;
  deletingDocId: Id<"documents"> | null;
  onUpload: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onDelete: (
    id: Id<"documents">,
    storageId: Id<"_storage">,
    name: string,
  ) => Promise<void>;
  onUseDocumentContext: (context: NonNullable<DocumentContext>) => void;
};

export function DocumentsTab({
  roomId,
  docs,
  fileInputRef,
  deletingDocId,
  onUpload,
  onDelete,
  onUseDocumentContext,
}: DocumentsTabProps) {
  const [previewDoc, setPreviewDoc] = useState<RoomDocument | null>(null);
  const createSelection = useMutation(api.documents.createSelection);

  useEffect(() => {
    if (!previewDoc) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewDoc(null);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [previewDoc]);

  return (
    <>
      <div className="p-4 space-y-3">
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={onUpload}
          accept=".pdf,.txt,.doc,.docx"
        />

        <UploadButton onClick={() => fileInputRef.current?.click()} />

        <div className="space-y-1.5 pt-1">
          {docs === undefined ? (
            <div className="flex flex-col gap-1.5 pt-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-11 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : docs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface2">
                <FileText size={15} className="text-text-3" />
              </div>
              <p className="text-[12px] leading-snug text-text-3 max-w-[160px]">
                No documents yet. Upload one to reference it in chat.
              </p>
            </div>
          ) : (
            docs.map((doc) => (
              <DocumentItem
                key={doc._id}
                id={doc._id}
                name={doc.name}
                fileUrl={doc.fileUrl}
                storageId={doc.storageId}
                deletingDocId={deletingDocId}
                onPreview={() => setPreviewDoc(doc)}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/75 p-4 backdrop-blur-sm"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface2">
                  <FileText size={14} className="text-primary/70" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-text leading-tight">
                    {previewDoc.name}
                  </p>
                  <p className="text-[11px] text-text-3">
                    Select text, then click Ask AI
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewDoc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-text-2 transition-colors hover:bg-surface2"
                >
                  Open tab
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="rounded-lg p-1.5 text-text-3 transition-colors hover:bg-surface2 hover:text-text"
                  aria-label="Close preview"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="min-h-0 flex-1 overflow-hidden">
              <DocumentPreview
                doc={{
                  _id: previewDoc._id,
                  roomId,
                  name: previewDoc.name,
                  content: previewDoc.previewContent ?? "",
                  fileUrl: previewDoc.fileUrl,
                }}
                onAskAi={async (selectedText) => {
                  const selectionId = await createSelection({
                    roomId,
                    documentId: previewDoc._id,
                    selectedText,
                  });
                  onUseDocumentContext({
                    type: "document",
                    roomId,
                    docId: previewDoc._id,
                    docName: previewDoc.name,
                    selectionId,
                    selectedText,
                  });
                  setPreviewDoc(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}