"use client";
import type { Id } from "@/convex/_generated/dataModel";
import { AlertCircle, Brain, MousePointer2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const MIN_SELECTION_LENGTH = 10;
const MAX_SELECTION_LENGTH = 900;

const PDFDocument = dynamic(
  () => import("react-pdf").then((module) => module.Document),
  { ssr: false },
);

const PDFPage = dynamic(
  () => import("react-pdf").then((module) => module.Page),
  { ssr: false },
);

type SelectionState = {
  text: string;
  rect: DOMRect;
};

type DocumentPreviewProps = {
  doc: {
    _id: Id<"documents">;
    roomId: Id<"rooms">;
    name: string;
    content: string;
    fileUrl?: string;
  };
  onAskAi: (selectedText: string) => Promise<void>;
};

export function DocumentPreview({ doc, onAskAi }: DocumentPreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [activeHighlight, setActiveHighlight] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageWidth, setPageWidth] = useState<number>(900);
  const [isPdfReady, setIsPdfReady] = useState(false);

  const isPdfFile =
    doc.name.toLowerCase().endsWith(".pdf") && Boolean(doc.fileUrl);

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;
    const updateWidth = () => {
      const width = Math.max(container.clientWidth - 48, 320);
      setPageWidth(Math.min(width, 980));
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const setupPdfWorker = async () => {
      try {
        const { pdfjs } = await import("react-pdf");
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;
        if (!cancelled) setIsPdfReady(true);
      } catch {
        if (!cancelled) setIsPdfReady(false);
      }
    };
    void setupPdfWorker();
    return () => { cancelled = true; };
  }, []);

  const handleMouseUp = () => {
    const currentSelection = window.getSelection();
    const text = currentSelection?.toString().trim() ?? "";

    if (!currentSelection || !text) { setSelection(null); return; }
    if (currentSelection.rangeCount === 0) { setSelection(null); return; }

    const range = currentSelection.getRangeAt(0);
    const root = contentRef.current;
    if (!root || !root.contains(range.commonAncestorContainer)) {
      setSelection(null); return;
    }

    const rect = range.getBoundingClientRect();
    if (!rect.width && !rect.height) { setSelection(null); return; }

    setSelection({ text, rect });
    setActiveHighlight(false);
  };

  const selectionLength = selection?.text.length ?? 0;
  const isTooShort = selectionLength > 0 && selectionLength < MIN_SELECTION_LENGTH;
  const isTooLong = selectionLength > MAX_SELECTION_LENGTH;
  const isAskAiEnabled = Boolean(selection) && !isTooShort && !isTooLong;

  const handleAskAi = () => {
    if (!selection || !isAskAiEnabled) return;
    setActiveHighlight(true);
    const normalized = selection.text.replace(/\s+/g, " ").trim();
    const safeText = normalized.replace(/"/g, "'");
    setTimeout(() => { onAskAi(safeText); }, 120);
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      {/* Instruction bar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-surface px-5 py-2.5">
        <MousePointer2 size={13} className="shrink-0 text-text-3" />
        <p className="text-[12px] text-text-3">
          Highlight any text, then click <span className="font-semibold text-text-2">Ask AI</span> to reference it in the chat.
        </p>
      </div>

      {/* Document body */}
      <div
        className="min-h-0 flex-1 overflow-y-auto bg-surface2 p-6 text-sm leading-[1.75] text-text selection:bg-primary/15"
        onMouseUp={handleMouseUp}
        ref={contentRef}
      >
        {isPdfFile ? (
          <div className="mx-auto w-full max-w-4xl rounded-xl bg-surface shadow-sm ring-1 ring-border p-4">
            {isPdfReady ? (
              <PDFDocument
                file={doc.fileUrl}
                onLoadSuccess={({ numPages: totalPages }) => setNumPages(totalPages)}
                loading={
                  <div className="rounded-lg bg-surface2 px-4 py-3 text-[13px] text-text-3">
                    Loading PDF…
                  </div>
                }
                error={
                  <div className="rounded-lg border border-destructive/20 bg-destructive/8 px-4 py-3 text-[13px] text-destructive">
                    Failed to load PDF preview.
                  </div>
                }
                noData={
                  <div className="rounded-lg bg-surface2 px-4 py-3 text-[13px] text-text-3">
                    No PDF data to display.
                  </div>
                }
              >
                <div className="space-y-4">
                  {Array.from(new Array(numPages), (_, i) => (
                    <div
                      key={`pdf-page-${i + 1}`}
                      className="mx-auto w-fit overflow-hidden rounded-lg border border-border shadow-sm"
                    >
                      <PDFPage
                        pageNumber={i + 1}
                        width={pageWidth}
                        renderAnnotationLayer
                        renderTextLayer
                      />
                    </div>
                  ))}
                </div>
              </PDFDocument>
            ) : (
              <div className="rounded-lg bg-surface2 px-4 py-3 text-[13px] text-text-3">
                Initializing PDF preview…
              </div>
            )}
          </div>
        ) : (
          <div className="mx-auto w-full max-w-3xl whitespace-pre-wrap rounded-xl bg-surface px-8 py-6 font-serif text-[15px] leading-[1.8] text-slate-800 shadow-sm ring-1 ring-border">
            {doc.content || (
              <span className="italic text-text-3">No preview text available for this document.</span>
            )}
          </div>
        )}
      </div>

      {/* Context-set confirmation badge */}
      {activeHighlight && (
        <div className="pointer-events-none absolute right-5 top-14 z-40 flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[12px] font-medium text-emerald-700 shadow-sm">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Context added to chat
        </div>
      )}

      {/* Floating Ask AI panel */}
      {selection && (
        <div className="absolute bottom-5 right-5 z-40 flex w-72 flex-col gap-2">
          {isTooLong && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2 text-[12px] text-destructive shadow-sm">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>Selection too long (~{selectionLength} chars). Select less text.</span>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
            {/* Selection preview */}
            <div className="border-b border-border bg-surface2 px-3 py-2">
              <p className="line-clamp-2 text-[11px] italic leading-relaxed text-text-3">
                "{selection.text.slice(0, 120)}{selection.text.length > 120 ? "…" : ""}"
              </p>
            </div>

            <div className="p-2">
              <button
                type="button"
                onClick={handleAskAi}
                disabled={!isAskAiEnabled}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Brain size={15} />
                Ask AI about this
              </button>
            </div>

            {isTooShort && (
              <div className="flex items-center gap-1.5 border-t border-border px-3 py-2 text-[11px] text-text-3">
                <AlertCircle size={12} />
                Select at least {MIN_SELECTION_LENGTH} characters.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}