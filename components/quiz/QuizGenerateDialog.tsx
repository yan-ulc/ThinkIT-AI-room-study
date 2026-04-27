"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BrainCircuit, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

type QuizGenerateDialogProps = {
  isOpen: boolean;
  defaultTitle: string;
  onClose: () => void;
  onConfirm: (title: string, questionCount: number) => void;
  isGenerating: boolean;
};

const QUESTION_PRESETS = [5, 8, 10, 15];

export function QuizGenerateDialog({
  isOpen,
  defaultTitle,
  onClose,
  onConfirm,
  isGenerating,
}: QuizGenerateDialogProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [questionCount, setQuestionCount] = useState(5);

  useEffect(() => {
    if (isOpen) {
      setTitle(defaultTitle);
      setQuestionCount(5);
    }
  }, [isOpen, defaultTitle]);

  const handleConfirm = () => {
    onConfirm(title.trim() || defaultTitle, questionCount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm border-white/[0.08] bg-[#0e0e12] p-0 shadow-[0_0_60px_rgba(0,0,0,0.8),0_0_100px_rgba(255,255,255,0.02)] overflow-hidden">
        {/* Top glow strip */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <div className="p-7 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
              <BrainCircuit size={18} className="text-primary" />
            </div>
            <div>
              <DialogTitle className="text-[16px] font-bold text-foreground">Generate Quiz</DialogTitle>
              <p className="text-[11px] text-muted-foreground/50">Dari dokumen yang dipilih</p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/[0.05]" />

          {/* Quiz Name */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">
              Nama Quiz
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={defaultTitle}
              maxLength={80}
              className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/30 outline-none transition-all duration-200 focus:border-primary/40 focus:bg-primary/[0.04] focus:ring-1 focus:ring-primary/20"
            />
            <p className="text-[11px] text-muted-foreground/40">Default: nama dokumen</p>
          </div>

          {/* Question Count */}
          <div className="space-y-3">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">
              Jumlah Soal
            </label>

            {/* Preset chips */}
            <div className="flex gap-2">
              {QUESTION_PRESETS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setQuestionCount(n)}
                  className={`flex-1 rounded-xl border py-2 text-[13px] font-bold transition-all duration-200 active:scale-[0.97] ${
                    questionCount === n
                      ? "border-primary/50 bg-primary/15 text-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.1)]"
                      : "border-white/[0.07] bg-white/[0.03] text-foreground/50 hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-foreground/80"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            {/* Slider */}
            <div className="space-y-2 pt-1">
              <input
                type="range"
                min={3}
                max={20}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground/40">
                <span>3 soal</span>
                <span className="font-bold text-primary/80">{questionCount} soal dipilih</span>
                <span>20 soal</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleConfirm}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-[14px] font-semibold text-primary-foreground transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-r-transparent" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Generate {questionCount} Soal
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}