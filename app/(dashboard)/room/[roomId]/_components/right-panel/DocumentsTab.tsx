"use client";

import { DocumentSummary } from "@/components/document/DocumentSummary";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { FileText, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { DocumentContext, RoomDocument } from "../../hooks/useRoomData";
import { DocumentPreview } from "../docs/DocumentPreview";
import { DocumentItem } from "./DocumentItem";
import { UploadButton } from "./UploadButton";

type DocumentsTabProps = {
  roomId: Id<"rooms">;
  docs: RoomDocument[] | undefined;
  deletingDocId: Id<"documents"> | null;
  onUploadFiles: (files: FileList) => Promise<void>;
  onDelete: (
    id: Id<"documents">,
    storageId: Id<"_storage">,
    name: string,
  ) => Promise<void>;
  onUseDocumentContext: (context: NonNullable<DocumentContext>) => void;
  generatingQuizForDocId: Id<"documents"> | null;
  onGenerateQuiz: (
    docId: Id<"documents">,
    title?: string,
    questionCount?: number,
  ) => Promise<boolean>;
  isUploading: boolean;
};

export function DocumentsTab({
  roomId,
  docs,
  deletingDocId,
  onUploadFiles,
  onDelete,
  onUseDocumentContext,
  generatingQuizForDocId,
  onGenerateQuiz,
  isUploading,
}: DocumentsTabProps) {
  const [previewDoc, setPreviewDoc] = useState<RoomDocument | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const createSelection = useMutation(api.documents.createSelection);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

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
      <div className="space-y-3 p-4">
        <UploadButton onFiles={onUploadFiles} isUploading={isUploading} />

        <div className="space-y-2 pt-1">
          {docs === undefined ? (
            <div className="flex flex-col gap-1.5 pt-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-11 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          ) : docs.length === 0 ? (
            <div className="glass-panel flex flex-col items-center gap-2 rounded-xl py-8 text-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-card/70">
                <FileText size={15} className="text-text-3" />
              </div>
              <p className="text-[12px] leading-snug text-text-3 max-w-40">
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
      {isMounted &&
        previewDoc &&
        createPortal(
          <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-background/72 p-4 backdrop-blur-sm"
            onClick={() => setPreviewDoc(null)}
          >
            <div
              className="glass-panel flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex shrink-0 items-center justify-between border-b border-border/80 bg-card/55 px-5 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/80 bg-card/70">
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
                    className="rounded-md border border-border/80 px-3 py-1.5 text-[12px] font-medium text-text-2 transition-colors hover:bg-muted"
                  >
                    Open tab
                  </a>
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(null)}
                    className="rounded-md p-1.5 text-text-3 transition-colors hover:bg-muted hover:text-text"
                    aria-label="Close preview"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Modal body */}
              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="h-[56vh] min-h-95 overflow-hidden">
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
                    isGeneratingQuiz={generatingQuizForDocId === previewDoc._id}
                    isAnyQuizGenerating={!!generatingQuizForDocId}
                    onGenerateQuiz={(title, questionCount) =>
                      onGenerateQuiz(previewDoc._id, title, questionCount)
                    }
                  />
                </div>

                <div className="mt-4 border-t border-border">
                  <DocumentSummary documentId={previewDoc._id} />
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
