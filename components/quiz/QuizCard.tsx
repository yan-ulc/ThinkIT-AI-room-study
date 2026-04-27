"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Trash2, Trophy } from "lucide-react";

type QuizCardProps = {
  title: string;
  questionCount: number;
  onStart: () => void;
  onDelete?: () => void;
};

export function QuizCard({ title, questionCount, onStart, onDelete }: QuizCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.05] hover:shadow-[0_0_24px_rgba(255,255,255,0.04)]">
      {/* Ambient glow accent top-left */}
      <div className="pointer-events-none absolute -top-10 -left-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5 min-w-0">
          {/* Meta */}
          <div className="flex items-center gap-1.5 text-muted-foreground/70">
            <FileText size={12} strokeWidth={2} />
            <span className="text-[10px] font-semibold uppercase tracking-widest">
              {questionCount} Questions
            </span>
          </div>
          {/* Title */}
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-foreground/90 transition-colors duration-200 group-hover:text-foreground">
            {title}
          </h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              title="Hapus quiz"
              className="rounded-lg p-1.5 text-muted-foreground/40 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 size={13} />
            </button>
          )}
          {/* Trophy badge */}
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Trophy size={16} className="text-amber-400" />
          </div>
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        className="relative mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-2.5 text-[13px] font-semibold text-foreground/80 transition-all duration-200 hover:border-primary/40 hover:bg-primary/10 hover:text-primary active:scale-[0.98]"
      >
        Mulai Latihan
        <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}