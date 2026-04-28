"use client";
import { ArrowRight, FileText, Trash2, Trophy } from "lucide-react";

type QuizCardProps = {
  title: string;
  questionCount: number;
  bestScore?: number; // undefined = belum pernah attempt
  onStart: () => void;
  onDelete?: () => void;
};

export function QuizCard({
  title,
  questionCount,
  bestScore,
  onStart,
  onDelete,
}: QuizCardProps) {
  const hasBest = bestScore !== undefined;

  // Trophy badge color tier
  const trophyClass = !hasBest
    ? "bg-muted border-border text-muted-foreground/40"
    : bestScore >= 80
      ? "text-amber-500 bg-amber-500/10 border-amber-500/25"   // gold
      : bestScore >= 50
        ? "text-slate-400 bg-slate-400/10 border-slate-400/25"  // silver
        : "text-orange-400 bg-orange-500/10 border-orange-500/25"; // bronze

  const scoreTextClass = !hasBest
    ? ""
    : bestScore >= 80
      ? "text-amber-500"
      : bestScore >= 50
        ? "text-slate-400"
        : "text-orange-400";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-muted/30 p-5 transition-all duration-300 hover:bg-muted/50 hover:shadow-md">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-10 -left-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex items-start justify-between gap-3">
        {/* Left: meta + title */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-1.5 text-muted-foreground/70">
            <FileText size={12} strokeWidth={2} />
            <span className="text-[10px] font-semibold uppercase tracking-widest">
              {questionCount} Questions
            </span>
          </div>
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-foreground/90 transition-colors duration-200 group-hover:text-foreground">
            {title}
          </h3>
        </div>

        {/* Right: delete (admin/hover) + trophy badge + score */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          {/* Delete — only for admins, visible on group hover */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Hapus quiz"
              className="rounded-lg p-1.5 text-muted-foreground/40 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 size={13} />
            </button>
          )}

          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${trophyClass}`}
          >
            <Trophy size={16} />
          </div>
          {hasBest ? (
            <span className={`text-[11px] font-bold tabular-nums leading-none ${scoreTextClass}`}>
              {bestScore}
            </span>
          ) : (
            <span className="text-[9px] text-muted-foreground/35 leading-none">—</span>
          )}
        </div>
      </div>

      {/* Start / retry button */}
      <button
        onClick={onStart}
        className="relative mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-[13px] font-semibold text-foreground/80 transition-all duration-200 hover:border-primary/40 hover:bg-primary/10 hover:text-primary active:scale-[0.98]"
      >
        {hasBest ? "Latihan Lagi" : "Mulai Latihan"}
        <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
      </button>

    </div>
  );
}