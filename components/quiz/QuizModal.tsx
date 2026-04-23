"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import { ArrowLeft, ArrowRight, CheckCircle2, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

type QuizQuestion = { question: string; options: string[]; answer: string };
type QuizModalProps = { documentId: Id<"documents"> };

export function QuizModal({ documentId }: QuizModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const quiz = useQuery(api.quiz.getByDocId, { documentId });
  const generate = useAction(api.quiz.generate);
  const submitScore = useMutation(api.quiz.submitQuiz);

  const [step, setStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const questions: QuizQuestion[] = quiz?.questions ?? [];
  const totalSteps = questions.length;

  const handleAnswer = (answer: string) => {
    const next = [...userAnswers];
    next[step - 1] = answer;
    setUserAnswers(next);
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await generate({ documentId });
      setStep(1);
    } finally {
      setLoading(false);
    }
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
    await submitScore({
      documentId,
      quizId: quiz!._id,
      score: finalScore,
      answers: userAnswers,
    });
    setStep(totalSteps + 1);
  };

  if (!isMounted) return null;

  const isResult = step > totalSteps;
  const isQuestion = step > 0 && step <= totalSteps;
  const currentQ = questions[step - 1];
  const progress = Math.round(score());

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="group gap-2 rounded-xl border-border text-foreground transition-all duration-150
            hover:border-primary/40 hover:bg-primary/6 hover:text-primary"
        >
          <Trophy
            size={14}
            className="text-yellow-500 transition-transform duration-200 group-hover:scale-110"
          />
          Generate Quiz
        </Button>
      </DialogTrigger>

      <DialogContent className="flex min-h-105 flex-col justify-center gap-0 rounded-2xl border border-border bg-card p-8 shadow-2xl sm:max-w-120">
        <DialogHeader className="sr-only">
          <DialogTitle>Quiz Assessment</DialogTitle>
        </DialogHeader>

        {/* ── Start screen ── */}
        {step === 0 && (
          <div className="flex flex-col items-center gap-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-yellow-200/60 bg-yellow-50 shadow-inner dark:border-yellow-800/30 dark:bg-yellow-950/30">
              <Trophy size={36} className="text-yellow-500" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Siap Mulai Kuis?
              </h2>
              <p className="text-[13px] text-muted-foreground">
                Uji pemahamanmu terhadap dokumen ini.
              </p>
            </div>
            <Button
              onClick={() => (quiz ? setStep(1) : handleGenerate())}
              disabled={loading}
              className="min-w-35 rounded-xl bg-primary font-semibold text-primary-foreground
                transition-all duration-150 hover:scale-[1.03] hover:brightness-110 active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Generating…
                </span>
              ) : (
                "Mulai Kuis"
              )}
            </Button>
          </div>
        )}

        {/* ── Question screen ── */}
        {isQuestion && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-2 duration-250">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                <span>
                  Soal {step} dari {totalSteps}
                </span>
                <span>{Math.round((step / totalSteps) * 100)}%</span>
              </div>
              <Progress
                value={(step / totalSteps) * 100}
                className="h-1.5 rounded-full bg-muted"
              />
            </div>

            {/* Question */}
            <h2 className="text-[16px] font-semibold leading-snug text-foreground">
              {currentQ.question}
            </h2>

            {/* Options */}
            <div className="flex flex-col gap-2">
              {currentQ.options.map((opt) => {
                const selected = userAnswers[step - 1] === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleAnswer(opt)}
                    className={`group flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-[13.5px] font-medium
                      transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                      ${
                        selected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted/30 text-foreground hover:border-primary/40 hover:bg-primary/5"
                      }`}
                  >
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold
                        transition-colors duration-150
                        ${
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-muted-foreground"
                        }`}
                    >
                      {String.fromCharCode(65 + currentQ.options.indexOf(opt))}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className="gap-1.5 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft size={15} /> Back
              </Button>

              {step === totalSteps ? (
                <Button
                  size="sm"
                  onClick={handleFinish}
                  disabled={!userAnswers[step - 1]}
                  className="rounded-xl bg-primary font-semibold text-primary-foreground
                    transition-all duration-150 hover:scale-[1.03] hover:brightness-110 active:scale-[0.98]
                    disabled:opacity-40 disabled:hover:scale-100"
                >
                  Selesai & Lihat Nilai
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setStep(step + 1)}
                  disabled={!userAnswers[step - 1]}
                  className="gap-1.5 rounded-xl bg-primary font-semibold text-primary-foreground
                    transition-all duration-150 hover:scale-[1.03] hover:brightness-110 active:scale-[0.98]
                    disabled:opacity-40 disabled:hover:scale-100"
                >
                  Lanjut <ArrowRight size={15} />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ── Result screen ── */}
        {isResult && (
          <div className="flex flex-col items-center gap-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-200/60 bg-emerald-50 shadow-inner dark:border-emerald-800/30 dark:bg-emerald-950/30">
              <CheckCircle2 size={36} className="text-emerald-500" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Kuis Selesai!
              </h2>
              <p className="text-[13px] text-muted-foreground">Nilai kamu</p>
              <div className="mt-2 text-6xl font-black tabular-nums text-primary">
                {progress}
                <span className="text-2xl font-semibold text-muted-foreground">
                  %
                </span>
              </div>
            </div>

            {/* Score bar */}
            <div className="w-full space-y-1.5">
              <Progress
                value={progress}
                className="h-2 rounded-full bg-muted"
              />
              <p className="text-[11px] text-muted-foreground">
                {questions.filter((q, i) => q.answer === userAnswers[i]).length}{" "}
                dari {totalSteps} benar
              </p>
            </div>

            <Button
              onClick={() => {
                setStep(0);
                setUserAnswers([]);
              }}
              className="w-full rounded-xl bg-primary font-semibold text-primary-foreground
                transition-all duration-150 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
            >
              Coba Lagi
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
