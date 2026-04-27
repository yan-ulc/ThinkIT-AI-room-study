"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Trophy,
  Sparkles,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";

type QuizQuestion = {
  question: string;
  options: string[];
  answer: string;
};

type QuizModalProps = {
  quizId: Id<"quizzes">;
  isOpen: boolean;
  onClose: () => void;
};

export function QuizModal({ quizId, isOpen, onClose }: QuizModalProps) {
  const quiz = useQuery(api.quiz.getById, { id: quizId });
  const submitScore = useMutation(api.quiz.submitAttempts);

  const [step, setStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setUserAnswers([]);
      setIsSubmitting(false);
      setAnimKey((k) => k + 1);
    }
  }, [isOpen]);

  // Trigger animation on step change
  const prevStep = useRef(step);
  useEffect(() => {
    if (step !== prevStep.current) {
      setAnimKey((k) => k + 1);
      prevStep.current = step;
    }
  }, [step]);

  const questions: QuizQuestion[] = quiz?.questions ?? [];
  const totalSteps = questions.length;

  const handleAnswer = (answer: string) => {
    const next = [...userAnswers];
    next[step - 1] = answer;
    setUserAnswers(next);
  };

  const score = () => {
    if (!totalSteps) return 0;
    return (
      (questions.filter((q, i) => q.answer === userAnswers[i]).length / totalSteps) * 100
    );
  };

  const handleFinish = async () => {
    const finalScore = score();
    if (!quiz) return;
    setIsSubmitting(true);
    try {
      await submitScore({ quizId: quiz._id, score: finalScore, answers: userAnswers });
      setStep(totalSteps + 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isResult = step > totalSteps && totalSteps > 0;
  const isQuestion = step > 0 && step <= totalSteps;
  const currentQ = questions[step - 1];
  const progressPct = totalSteps ? (step / totalSteps) * 100 : 0;
  const finalScore = Math.round(score());
  const correctCount = Math.round((finalScore / 100) * totalSteps);

  // Grade label
  const grade =
    finalScore >= 90 ? "Luar biasa! 🏆" :
    finalScore >= 70 ? "Bagus sekali! 🎉" :
    finalScore >= 50 ? "Lumayan, terus berlatih! 💪" :
    "Yuk belajar lagi! 📚";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px] border-white/[0.08] bg-[#0e0e12] p-0 shadow-[0_0_60px_rgba(0,0,0,0.8),0_0_120px_rgba(255,255,255,0.03)] overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{quiz?.title || "Quiz"}</DialogTitle>
        </DialogHeader>

        {quiz === undefined ? (
          <div className="flex justify-center p-12">
            <Loader2 size={20} className="animate-spin text-muted-foreground/40" />
          </div>
        ) : quiz === null ? (
          <div className="flex justify-center p-12 text-center">
            <p className="text-sm text-muted-foreground/60">Quiz tidak ditemukan.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Progress bar — top edge */}
            {isQuestion && (
              <div className="absolute top-0 inset-x-0 h-[2px] bg-white/[0.05]">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            )}

            {/* Content with fade+slide animation */}
            <div
              key={animKey}
              className="p-7 rounded-lg"
              style={{
                animation: "quizFadeIn 0.28s cubic-bezier(0.22,1,0.36,1) both",
              }}
            >
              {/* START */}
              {step === 0 && (
                <div className="flex flex-col items-center text-center gap-7 py-4">
                  {/* Icon */}
                  <div className="relative flex h-20 w-20 items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                      <Trophy size={28} className="text-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold tracking-tight text-foreground">{quiz.title}</h2>
                    <p className="text-[13px] text-muted-foreground/60">
                      {totalSteps} pertanyaan menanti kamu
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-[14px] font-semibold text-primary-foreground transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
                  >
                    Mulai Quiz <ArrowRight size={15} />
                  </button>
                </div>
              )}

              {/* QUESTION */}
              {isQuestion && currentQ && (
                <div className="space-y-7">
                  {/* Step counter */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                      Pertanyaan {step} / {totalSteps}
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground/40">
                      {Math.round(progressPct)}%
                    </span>
                  </div>

                  {/* Question */}
                  <h2 className="text-[16px] font-semibold leading-relaxed text-foreground/90">
                    {currentQ.question}
                  </h2>

                  {/* Options */}
                  <div className="flex flex-col gap-2.5">
                    {currentQ.options.map((opt, idx) => {
                      const selected = userAnswers[step - 1] === opt;
                      const letters = ["A", "B", "C", "D"];
                      return (
                        <button
                          key={opt}
                          onClick={() => handleAnswer(opt)}
                          style={{ animationDelay: `${idx * 50}ms`, animation: "quizFadeIn 0.3s ease both" }}
                          className={`group relative flex items-center gap-3.5 rounded-xl border px-4 py-3.5 text-left text-[14px] font-medium transition-all duration-200 active:scale-[0.99] ${
                            selected
                              ? "border-primary/50 bg-primary/10 text-primary shadow-[0_0_16px_rgba(var(--primary-rgb),0.12)]"
                              : "border-white/[0.06] bg-white/[0.03] text-foreground/80 hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-foreground"
                          }`}
                        >
                          {/* Letter badge */}
                          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold transition-colors duration-200 ${
                            selected
                              ? "bg-primary/20 text-primary"
                              : "bg-white/[0.06] text-muted-foreground/60 group-hover:bg-white/[0.1]"
                          }`}>
                            {letters[idx] ?? idx + 1}
                          </span>
                          {opt}
                          {selected && (
                            <CheckCircle2 size={14} className="ml-auto shrink-0 text-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Nav buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setStep(step - 1)}
                      disabled={step === 1}
                      className="flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2 text-[13px] font-medium text-foreground/60 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                    >
                      <ArrowLeft size={13} /> Back
                    </button>

                    {step === totalSteps ? (
                      <button
                        onClick={handleFinish}
                        disabled={!userAnswers[step - 1] || isSubmitting}
                        className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-[13px] font-semibold text-primary-foreground transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
                      >
                        {isSubmitting ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={13} />
                        )}
                        {isSubmitting ? "Menyimpan..." : "Selesai"}
                      </button>
                    ) : (
                      <button
                        onClick={() => setStep(step + 1)}
                        disabled={!userAnswers[step - 1]}
                        className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-[13px] font-semibold text-primary-foreground transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
                      >
                        Next <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* RESULT */}
              {isResult && (
                <div className="flex flex-col items-center text-center gap-6 py-4">
                  {/* Score ring */}
                  <div className="relative flex h-28 w-28 items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
                    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="5" className="text-white/[0.06]" />
                      <circle
                        cx="50" cy="50" r="44" fill="none"
                        stroke="currentColor" strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 44}`}
                        strokeDashoffset={`${2 * Math.PI * 44 * (1 - finalScore / 100)}`}
                        className="text-primary transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="relative text-center">
                      <p className="text-3xl font-bold text-foreground">{finalScore}</p>
                      <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Skor</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-xl font-bold text-foreground">{grade}</h2>
                    <p className="text-[13px] text-muted-foreground/60">
                      {correctCount} dari {totalSteps} jawaban benar
                    </p>
                  </div>

                  <div className="flex w-full gap-2.5 pt-2">
                    <button
                      onClick={() => { setStep(0); setUserAnswers([]); setAnimKey((k) => k + 1); }}
                      className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 text-[13px] font-semibold text-foreground/70 transition-all duration-200 hover:bg-white/[0.07] hover:text-foreground active:scale-[0.98]"
                    >
                      Ulangi
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 rounded-xl bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
                    >
                      Selesai
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <style>{`
          @keyframes quizFadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}