"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Id } from "@/convex/_generated/dataModel";
import { PlayCircle, X, CheckCircle2 } from "lucide-react";
import { QuizModal } from "./QuizModal";
import { useState } from "react";

type QuizReadyDialogProps = {
  quizId: Id<"quizzes">;
  title: string;
  isOpen: boolean;
  onClose: () => void;
};

export function QuizReadyDialog({ quizId, title, isOpen, onClose }: QuizReadyDialogProps) {
  const [showQuizPlayer, setShowQuizPlayer] = useState(false);

  const handleStartQuiz = () => {
    onClose();
    setShowQuizPlayer(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-sm border-white/[0.08] bg-[#0e0e12] p-0 shadow-[0_0_60px_rgba(0,0,0,0.8),0_0_100px_rgba(255,255,255,0.02)] overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Quiz Ready</DialogTitle>
          </DialogHeader>

          {/* Top glow strip */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-400/40 to-transparent" />

          <div className="flex flex-col items-center text-center gap-6 p-7 pt-8">
            {/* Success icon with glow */}
            <div className="relative flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-green-500/20 blur-2xl" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-green-500/20 bg-green-500/10">
                <CheckCircle2 size={28} className="text-green-400" />
              </div>
            </div>

            {/* Text */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Quiz Siap! 🎉</h2>
              <p className="text-[13px] leading-relaxed text-muted-foreground/70">
                <span className="font-semibold text-foreground/80">"{title}"</span> berhasil digenerate.{" "}
                Mau langsung dikerjain sekarang?
              </p>
            </div>

            {/* Actions */}
            <div className="flex w-full flex-col gap-2.5">
              <button
                onClick={handleStartQuiz}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-[14px] font-semibold text-primary-foreground transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
              >
                <PlayCircle size={16} />
                Kerjain Quiz Sekarang
              </button>
              <button
                onClick={onClose}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.07] py-2.5 text-[13px] font-medium text-muted-foreground/60 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-foreground/80 active:scale-[0.98]"
              >
                <X size={13} />
                Nanti Aja
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showQuizPlayer && (
        <QuizModal
          quizId={quizId}
          isOpen={showQuizPlayer}
          onClose={() => setShowQuizPlayer(false)}
        />
      )}
    </>
  );
}