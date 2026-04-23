"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAction, useQuery } from "convex/react";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

export function DocumentSummary({ documentId }: { documentId: Id<"documents"> }) {
  const summary = useQuery(api.summarize.getByDocId, { documentId });
  const generate = useAction(api.summarize.generate);
  const [loading, setLoading] = useState(false);

  /* ── Empty state ── */
  if (!summary) {
    return (
      <div className="border-t border-border bg-muted/30 px-6 py-5">
        <Button
          onClick={async () => {
            setLoading(true);
            try { await generate({ documentId }); }
            finally { setLoading(false); }
          }}
          disabled={loading}
          size="sm"
          className="gap-2 rounded-xl bg-primary text-primary-foreground font-semibold
            transition-all duration-150 hover:scale-[1.03] hover:brightness-110 active:scale-[0.98]
            disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Sparkles size={14} />
          )}
          {loading ? "Generating…" : "Generate Summary"}
        </Button>
      </div>
    );
  }

  /* ── Summary card ── */
  return (
    <section
      aria-label="Document summary"
      className="border-t border-border bg-card px-6 py-5 space-y-4
        animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      <header className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-50 dark:bg-yellow-950/30">
          <Sparkles size={14} className="text-yellow-500" />
        </div>
        <h3 className="text-[14px] font-bold tracking-tight text-foreground">
          Ringkasan Dokumen
        </h3>
      </header>

      <p className="text-[13.5px] leading-relaxed text-muted-foreground">
        {summary.summaryText}
      </p>

      {summary.keyPoints.length > 0 && (
        <div className="flex flex-wrap gap-1.5" role="list" aria-label="Key points">
          {summary.keyPoints.map((point: string, i: number) => (
            <span
              key={i}
              role="listitem"
              className="rounded-lg border border-primary/20 bg-primary/8 px-2.5 py-1
                text-[11.5px] font-medium text-primary transition-colors duration-150
                hover:border-primary/40 hover:bg-primary/15"
            >
              {point}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}