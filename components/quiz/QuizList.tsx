"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { QuizCard } from "./QuizCard";
import { QuizModal } from "./QuizModal";
import { useState } from "react";
import { Loader2, BrainCircuit, Sparkles } from "lucide-react";

export function QuizList({
  roomId,
  generatingQuizForDocId,
}: {
  roomId: Id<"rooms">;
  generatingQuizForDocId: Id<"documents"> | null;
}) {
  const quizzes = useQuery(api.quiz.getByRoomId, { roomId });
  const members = useQuery(api.rooms.getMembers, { roomId });
  const deleteQuiz = useMutation(api.quiz.deleteQuiz);
  const bestScores = useQuery(api.quiz.getBestScores) ?? {};

  const [selectedQuizId, setSelectedQuizId] = useState<Id<"quizzes"> | null>(null);
  const [deletingId, setDeletingId] = useState<Id<"quizzes"> | null>(null);

  const isAdmin = members?.some((m) => m.isMe && m.role === "admin") ?? false;

  const handleDelete = async (quizId: Id<"quizzes">, title: string) => {
    const confirmed = window.confirm(`Hapus quiz "${title}"? Semua attempt juga akan dihapus.`);
    if (!confirmed) return;
    setDeletingId(quizId);
    try {
      await deleteQuiz({ quizId });
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus quiz.");
    } finally {
      setDeletingId(null);
    }
  };

  if (quizzes === undefined || members === undefined) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 size={18} className="animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-4">
      {/* Generating banner */}
      {generatingQuizForDocId && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-amber-400 border-r-transparent shrink-0" />
          <div>
            <p className="text-[12px] font-semibold text-amber-400">Generating quiz...</p>
            <p className="text-[11px] text-amber-400/60">Quiz akan muncul di sini setelah selesai.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between pt-1">
        <div className="space-y-0.5">
          <h2 className="text-[15px] font-bold tracking-tight text-foreground">Quiz Center</h2>
          <p className="text-[11px] text-muted-foreground/60">Uji pemahaman tim di room ini.</p>
        </div>
        {isAdmin && (
          <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary/80">
            Admin
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-white/[0.05]" />

      {/* Quiz list */}
      {quizzes.length > 0 ? (
        <div className="flex flex-col gap-3">
          {quizzes.map((quiz, i) => (
            <div
              key={quiz._id}
              className={`transition-opacity duration-200 ${deletingId === quiz._id ? "opacity-30 pointer-events-none" : "opacity-100"}`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <QuizCard
                title={quiz.title}
                questionCount={quiz.questions.length}
                bestScore={bestScores[quiz._id]}
                onStart={() => setSelectedQuizId(quiz._id)}
                onDelete={isAdmin ? () => handleDelete(quiz._id, quiz.title) : undefined}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/[0.07] py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
            <BrainCircuit size={26} className="text-muted-foreground/40" />
          </div>
          <div className="space-y-1">
            <p className="text-[13px] font-semibold text-foreground/70">Belum ada quiz</p>
            <p className="text-[11px] text-muted-foreground/50">Pilih dokumen dan generate quiz pertama lo.</p>
          </div>
        </div>
      )}

      {selectedQuizId && (
        <QuizModal
          quizId={selectedQuizId}
          isOpen={!!selectedQuizId}
          onClose={() => setSelectedQuizId(null)}
        />
      )}
    </div>
  );
}