"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  ClipboardList,
  Loader2,
  Trophy,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setUserAnswers([]);
      setIsSubmitting(false);
      setAnimKey((k) => k + 1);
      setIsReviewing(false);
    }
  }, [isOpen]);

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
      (questions.filter((q, i) => q.answer === userAnswers[i]).length /
        totalSteps) *
      100
    );
  };

  const handleFinish = async () => {
    const finalScore = score();
    if (!quiz) return;
    setIsSubmitting(true);
    try {
      await submitScore({
        quizId: quiz._id,
        score: finalScore,
        answers: userAnswers,
      });
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

  const grade =
    finalScore >= 90
      ? "Luar biasa! 🏆"
      : finalScore >= 70
        ? "Bagus sekali! 🎉"
        : finalScore >= 50
          ? "Lumayan, terus berlatih! 💪"
          : "Yuk belajar lagi! 📚";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* bg-card + border-border: theme-aware. rounded-2xl overrides shadcn default rounded-lg */}
      <DialogContent className="sm:max-w-[440px] rounded-2xl border-border bg-card p-0 shadow-2xl overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{quiz?.title || "Quiz"}</DialogTitle>
          <DialogDescription>
            Answer multiple-choice questions and submit your score.
          </DialogDescription>
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
              <div className="absolute top-0 inset-x-0 h-[2px] bg-border">
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
              style={{ animation: "quizFadeIn 0.28s cubic-bezier(0.22,1,0.36,1) both" }}
            >
              {/* ── START ── */}
              {step === 0 && (
                <div className="flex flex-col items-center text-center gap-7 py-4">
                  <div className="relative flex h-20 w-20 items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                      <Trophy size={28} className="text-primary" />
                    </div>
                  </div>
                  <div className="w-full space-y-2">
                    {/* line-clamp-2 prevents long titles from exploding the layout */}
                    <h2 className="text-xl font-bold tracking-tight text-foreground line-clamp-2 break-words px-2">
                      {quiz.title}
                    </h2>
                    <p className="text-[13px] text-muted-foreground/70">
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

              {/* ── QUESTION ── */}
              {isQuestion && currentQ && (
                <div className="space-y-7">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                      Pertanyaan {step} / {totalSteps}
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground/50">
                      {Math.round(progressPct)}%
                    </span>
                  </div>

                  <h2 className="text-[16px] font-semibold leading-relaxed text-foreground/90">
                    {currentQ.question}
                  </h2>

                  <div className="flex flex-col gap-2.5">
                    {currentQ.options.map((opt, idx) => {
                      const selected = userAnswers[step - 1] === opt;
                      const letters = ["A", "B", "C", "D"];
                      return (
                        <button
                          key={opt}
                          onClick={() => handleAnswer(opt)}
                          style={{
                            animationDelay: `${idx * 50}ms`,
                            animation: "quizFadeIn 0.3s ease both",
                          }}
                          className={`group relative flex items-center gap-3.5 rounded-xl border px-4 py-3.5 text-left text-[14px] font-medium transition-all duration-200 active:scale-[0.99] ${
                            selected
                              ? "border-primary/50 bg-primary/10 text-primary"
                              : "border-border bg-muted/40 text-foreground/80 hover:bg-muted/70 hover:text-foreground"
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold transition-colors duration-200 ${
                              selected
                                ? "bg-primary/20 text-primary"
                                : "bg-muted text-muted-foreground group-hover:bg-accent"
                            }`}
                          >
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

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setStep(step - 1)}
                      disabled={step === 1}
                      className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 px-4 py-2 text-[13px] font-medium text-foreground/60 transition-all duration-200 hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
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

              {/* ── RESULT ── */}
              {isResult && !isReviewing && (
                <div className="flex flex-col items-center text-center gap-6 py-4">
                  <div className="relative flex h-28 w-28 items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
                    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50" cy="50" r="44"
                        fill="none" stroke="currentColor" strokeWidth="5"
                        className="text-border"
                      />
                      <circle
                        cx="50" cy="50" r="44"
                        fill="none" stroke="currentColor" strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 44}`}
                        strokeDashoffset={`${2 * Math.PI * 44 * (1 - finalScore / 100)}`}
                        className="text-primary transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="relative text-center">
                      <p className="text-3xl font-bold text-foreground">{finalScore}</p>
                      <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">
                        Skor
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-xl font-bold text-foreground">{grade}</h2>
                    <p className="text-[13px] text-muted-foreground/70">
                      {correctCount} dari {totalSteps} jawaban benar
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex w-full flex-col gap-2">
                    {/* Review answers button */}
                    <button
                      onClick={() => setIsReviewing(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted/40 py-2.5 text-[13px] font-semibold text-foreground/80 transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-[0.98]"
                    >
                      <ClipboardList size={14} />
                      Lihat Jawabanku
                    </button>
                    <div className="flex gap-2.5">
                      <button
                        onClick={() => {
                          setStep(0);
                          setUserAnswers([]);
                          setAnimKey((k) => k + 1);
                        }}
                        className="flex-1 rounded-xl border border-border bg-muted/40 py-2.5 text-[13px] font-semibold text-foreground/70 transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-[0.98]"
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
                </div>
              )}

              {/* ── REVIEW ── */}
              {isResult && isReviewing && (
                <div className="flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">
                        Review Jawaban
                      </p>
                      <p className="text-[11px] text-muted-foreground/60">
                        {correctCount} benar · {totalSteps - correctCount} salah
                      </p>
                    </div>
                    <button
                      onClick={() => setIsReviewing(false)}
                      className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-[12px] font-medium text-foreground/60 transition-all hover:bg-muted hover:text-foreground"
                    >
                      ← Kembali
                    </button>
                  </div>

                  {/* Question list — scrollable */}
                  <div className="flex flex-col gap-3 max-h-[340px] overflow-y-auto pr-1">
                    {questions.map((q, qi) => {
                      const userPick = userAnswers[qi];
                      const isCorrect = userPick === q.answer;
                      const letters = ["A", "B", "C", "D"];
                      return (
                        <div
                          key={qi}
                          style={{
                            animation: `quizFadeIn 0.25s cubic-bezier(0.22,1,0.36,1) ${qi * 40}ms both`,
                          }}
                          className="rounded-xl border border-border bg-muted/30 p-4"
                        >
                          {/* Question row */}
                          <div className="flex items-start gap-2.5 mb-3">
                            <span
                              className={`mt-0.5 shrink-0 rounded-full p-0.5 ${
                                isCorrect ? "text-emerald-500" : "text-rose-500"
                              }`}
                            >
                              {isCorrect ? (
                                <CheckCircle2 size={15} />
                              ) : (
                                <XCircle size={15} />
                              )}
                            </span>
                            <p className="text-[13px] font-medium leading-snug text-foreground">
                              {qi + 1}. {q.question}
                            </p>
                          </div>

                          {/* Options — only highlight user's pick */}
                          <div className="flex flex-col gap-1.5 pl-6">
                            {q.options.map((opt, oi) => {
                              const isPicked = opt === userPick;
                              return (
                                <div
                                  key={oi}
                                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium transition-colors ${
                                    isPicked
                                      ? isCorrect
                                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                                        : "bg-rose-500/10 text-rose-600 border border-rose-500/30"
                                      : "text-muted-foreground/60"
                                  }`}
                                >
                                  <span
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${
                                      isPicked
                                        ? isCorrect
                                          ? "bg-emerald-500/20 text-emerald-600"
                                          : "bg-rose-500/20 text-rose-600"
                                        : "bg-muted text-muted-foreground/50"
                                    }`}
                                  >
                                    {letters[oi] ?? oi + 1}
                                  </span>
                                  {opt}
                                  {isPicked && (
                                    <span className="ml-auto shrink-0 text-[10px] font-semibold uppercase tracking-wide">
                                      {isCorrect ? "✓ Benar" : "✗ Salah"}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom actions */}
                  <div className="flex gap-2.5 pt-1">
                    <button
                      onClick={() => {
                        setStep(0);
                        setUserAnswers([]);
                        setIsReviewing(false);
                        setAnimKey((k) => k + 1);
                      }}
                      className="flex-1 rounded-xl border border-border bg-muted/40 py-2.5 text-[13px] font-semibold text-foreground/70 transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-[0.98]"
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
