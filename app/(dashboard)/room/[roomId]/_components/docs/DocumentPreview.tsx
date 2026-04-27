"use client";
import { QuizGenerateDialog } from "@/components/quiz/QuizGenerateDialog";
import type { Id } from "@/convex/_generated/dataModel";
import { AlertCircle, Brain, MousePointer2, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const MIN_SELECTION_LENGTH = 10;
const MAX_SELECTION_LENGTH = 900;

const PDFDocument = dynamic(() => import("react-pdf").then((m) => m.Document), {
  ssr: false,
});
const PDFPage = dynamic(() => import("react-pdf").then((m) => m.Page), {
  ssr: false,
});

type SelectionState = { text: string; rect: DOMRect };
type DocumentPreviewProps = {
  doc: {
    _id: Id<"documents">;
    roomId: Id<"rooms">;
    name: string;
    content: string;
    fileUrl?: string;
  };
  onAskAi: (selectedText: string) => Promise<void>;
  isGeneratingQuiz: boolean; // is THIS doc generating?
  isAnyQuizGenerating: boolean; // is any doc generating (block all buttons)?
  onGenerateQuiz: (title?: string, questionCount?: number) => Promise<boolean>; // trigger from parent
};

export function DocumentPreview({
  doc,
  onAskAi,
  isGeneratingQuiz,
  isAnyQuizGenerating,
  onGenerateQuiz,
}: DocumentPreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [contextAdded, setContextAdded] = useState(false);
  const [numPages, setNumPages] = useState(0);
  const [pageWidth, setPageWidth] = useState(900);
  const [isPdfReady, setIsPdfReady] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);

  const isPdfFile =
    doc.name.toLowerCase().endsWith(".pdf") && Boolean(doc.fileUrl);

  /* ── Responsive PDF width ── */
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;
    const update = () =>
      setPageWidth(Math.min(Math.max(container.clientWidth - 48, 320), 980));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  /* ── PDF worker ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { pdfjs } = await import("react-pdf");
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;
        if (!cancelled) setIsPdfReady(true);
      } catch {
        if (!cancelled) setIsPdfReady(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Text selection ── */
  const handleMouseUp = () => {
    const sel = window.getSelection();
    const text = sel?.toString().trim() ?? "";
    if (!sel || !text || sel.rangeCount === 0) {
      setSelection(null);
      return;
    }
    const range = sel.getRangeAt(0);
    const root = contentRef.current;
    if (!root || !root.contains(range.commonAncestorContainer)) {
      setSelection(null);
      return;
    }
    const rect = range.getBoundingClientRect();
    if (!rect.width && !rect.height) {
      setSelection(null);
      return;
    }
    setSelection({ text, rect });
    setContextAdded(false);
  };

  const len = selection?.text.length ?? 0;
  const isTooShort = len > 0 && len < MIN_SELECTION_LENGTH;
  const isTooLong = len > MAX_SELECTION_LENGTH;
  const canAsk = Boolean(selection) && !isTooShort && !isTooLong;

  const handleAskAi = () => {
    if (!selection || !canAsk) return;
    setContextAdded(true);
    const normalized = selection.text
      .replace(/\s+/g, " ")
      .trim()
      .replace(/"/g, "'");
    setTimeout(() => {
      onAskAi(normalized);
      setSelection(null);
    }, 120);
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-background">
      {/* ── Toolbar ── */}
      <header className="z-10 flex shrink-0 items-center justify-between gap-4 border-b border-border bg-card/80 px-5 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MousePointer2 size={13} className="shrink-0" />
          <p className="text-[12px] leading-none">
            Highlight text, then click{" "}
            <span className="font-semibold text-foreground">Ask AI</span> to
            reference it in chat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Context-added badge */}
          {contextAdded && (
            <span
              className="flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 shadow-sm
              animate-in fade-in slide-in-from-right-2 duration-300 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-400"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Context added
            </span>
          )}
          <button
            onClick={() => setShowGenerateDialog(true)}
            disabled={isAnyQuizGenerating}
            title={
              isAnyQuizGenerating && !isGeneratingQuiz
                ? "Quiz sedang digenerate untuk dokumen lain"
                : "Generate Quiz"
            }
            className="flex items-center gap-2 rounded-xl bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingQuiz ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-r-transparent" />
            ) : (
              <Brain size={13} />
            )}
            {isGeneratingQuiz
              ? "Generating..."
              : isAnyQuizGenerating
                ? "Quiz in progress..."
                : "Generate Quiz"}
          </button>

          {/* Dialog hanya dirender saat dibutuhkan */}
          <QuizGenerateDialog
            isOpen={showGenerateDialog}
            defaultTitle={doc.name.replace(/\.[^.]+$/, "")}
            onClose={() => setShowGenerateDialog(false)}
            isGenerating={isGeneratingQuiz}
            onConfirm={async (title, questionCount) => {
              const success = await onGenerateQuiz(title, questionCount);
              if (success) {
                setShowGenerateDialog(false);
              }
            }}
          />
        </div>
      </header>

      {/* ── Scrollable document body ── */}
      <main
        ref={contentRef}
        className="min-h-0 flex-1 overflow-y-auto p-6 selection:bg-primary/15"
        onMouseUp={handleMouseUp}
        aria-label="Document content"
      >
        {isPdfFile ? (
          <div className="mx-auto w-full max-w-4xl rounded-2xl border border-border bg-card p-4 shadow-sm">
            {isPdfReady ? (
              <PDFDocument
                file={doc.fileUrl}
                onLoadSuccess={({ numPages: n }) => setNumPages(n)}
                loading={<PdfStateMessage>Loading PDF…</PdfStateMessage>}
                error={
                  <PdfStateMessage variant="error">
                    Failed to load PDF preview.
                  </PdfStateMessage>
                }
                noData={
                  <PdfStateMessage>No PDF data to display.</PdfStateMessage>
                }
              >
                <div className="space-y-4">
                  {Array.from({ length: numPages }, (_, i) => (
                    <div
                      key={`page-${i + 1}`}
                      className="mx-auto w-fit overflow-hidden rounded-xl border border-border shadow-sm"
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
              <PdfStateMessage>Initializing PDF preview…</PdfStateMessage>
            )}
          </div>
        ) : (
          <article className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-card px-8 py-8 font-serif text-[15px] leading-[1.85] text-foreground shadow-sm">
            {doc.content || (
              <span className="italic text-muted-foreground">
                No preview text available for this document.
              </span>
            )}
          </article>
        )}
      </main>

      {/* ── Floating Ask AI panel (bottom-right, never overlaps doc) ── */}
      {selection && (
        <aside
          role="complementary"
          aria-label="Ask AI about selection"
          className="fixed bottom-6 right-6 z-50 flex w-76 flex-col gap-2
            animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {/* Validation warnings */}
          {isTooLong && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-[12px] text-destructive shadow-sm backdrop-blur-sm">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>Selection too long (~{len} chars). Select less text.</span>
            </div>
          )}

          {/* Card */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card/95 shadow-xl shadow-black/10 backdrop-blur-md ring-1 ring-black/5">
            {/* Preview strip */}
            <div className="flex items-start justify-between gap-2 border-b border-border bg-muted/50 px-4 py-3">
              <p className="line-clamp-2 text-[11px] italic leading-relaxed text-muted-foreground">
                &quot;{selection.text.slice(0, 120)}
                {selection.text.length > 120 ? "…" : ""}&quot;
              </p>
              <button
                type="button"
                onClick={() => setSelection(null)}
                className="shrink-0 rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Dismiss"
              >
                <X size={13} />
              </button>
            </div>

            <div className="p-3">
              <button
                type="button"
                onClick={handleAskAi}
                disabled={!canAsk}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5
                  text-[13px] font-semibold text-primary-foreground
                  transition-colors duration-150
                  hover:bg-primary/90
                  disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Brain
                  size={15}
                  className="transition-opacity duration-150 group-hover:opacity-90"
                />
                Ask AI about this
              </button>

              {isTooShort && (
                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <AlertCircle size={11} />
                  Select at least {MIN_SELECTION_LENGTH} characters.
                </p>
              )}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

/* ── Small helper ── */
function PdfStateMessage({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant?: "error";
}) {
  return (
    <div
      className={`rounded-xl px-4 py-3 text-[13px] ${
        variant === "error"
          ? "border border-destructive/20 bg-destructive/8 text-destructive"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {children}
    </div>
  );
}
