"use client";

import { api } from "@/convex/_generated/api";
import { SignOutButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import {
  Award,
  BookOpen,
  BrainCircuit,
  LogOut,
  Settings,
  Sparkles,
  Trophy,
} from "lucide-react";

export default function ProfilePage() {
  const user = useQuery(api.users.currentUser);
  const stats = useQuery(api.users.getUserStats);

  if (user === undefined || stats === undefined) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="flex h-full w-full items-center justify-center text-text-3">
        User not found.
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-surface">
      {/* Hero Banner / Cover */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-r from-primary/20 via-purple-500/10 to-blue-500/20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30 mask-image:linear-gradient(to_bottom,white,transparent)" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
      </div>

      <div className="mx-auto max-w-4xl px-6 pb-20">
        {/* Profile Header (Avatar & Info) */}
        <div className="relative -mt-16 mb-10 flex flex-col items-center sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col items-center sm:flex-row sm:items-end gap-6">
            <div className="relative h-32 w-32 shrink-0 rounded-full border-4 border-surface bg-surface2 shadow-2xl">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.displayName}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/20 text-3xl font-bold text-primary">
                  {user.displayName[0].toUpperCase()}
                </div>
              )}
              {/* Online indicator / Badge */}
              <div className="absolute bottom-1 right-1 h-6 w-6 rounded-full border-4 border-surface bg-emerald-500" />
            </div>

            <div className="mt-4 text-center sm:mt-0 sm:text-left sm:pb-2">
              <h1 className="text-3xl font-bold tracking-tight text-text">
                {user.displayName}
              </h1>
              <p className="text-[15px] font-medium text-text-3">
                @{user.username}
              </p>
              <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  <Sparkles size={11} />
                  Pro Member
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-surface2 px-2.5 py-0.5 text-[11px] font-semibold text-text-2">
                  Student
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3 sm:mt-0 sm:pb-2">
            <button className="flex items-center gap-2 rounded-xl bg-surface2 px-4 py-2 text-[13px] font-medium text-text-2 transition-colors hover:bg-surface2/80 hover:text-text border border-border/50">
              <Settings size={16} />
              Edit Profile
            </button>
            <SignOutButton>
              <button className="flex items-center gap-2 rounded-xl bg-rose-500/10 px-4 py-2 text-[13px] font-medium text-rose-500 transition-colors hover:bg-rose-500/20 border border-rose-500/20">
                <LogOut size={16} />
                Sign Out
              </button>
            </SignOutButton>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="glass-panel flex items-center gap-4 rounded-2xl border border-border/60 bg-surface2/30 p-5 transition-transform hover:scale-[1.02]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-500">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-[13px] font-medium text-text-3">Rooms Joined</p>
              <p className="text-2xl font-bold text-text">
                {stats?.totalRooms || 0}
              </p>
            </div>
          </div>

          <div className="glass-panel flex items-center gap-4 rounded-2xl border border-border/60 bg-surface2/30 p-5 transition-transform hover:scale-[1.02]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <BrainCircuit size={24} />
            </div>
            <div>
              <p className="text-[13px] font-medium text-text-3">Quizzes Taken</p>
              <p className="text-2xl font-bold text-text">
                {stats?.totalQuizzesTaken || 0}
              </p>
            </div>
          </div>

          <div className="glass-panel flex items-center gap-4 rounded-2xl border border-border/60 bg-surface2/30 p-5 transition-transform hover:scale-[1.02]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-[13px] font-medium text-text-3">Average Score</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold text-text">
                  {stats?.averageScore || 0}
                </p>
                <span className="text-[12px] font-medium text-text-3">/ 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity or Badges (Placeholder for future) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text">Achievements</h2>
            <span className="text-[13px] text-primary hover:underline cursor-pointer">
              View All
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-card p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Award size={20} />
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-text">First Blood</h3>
                <p className="text-[12px] text-text-3">Completed your first quiz with a perfect score.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-card p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-500">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-text">Early Adopter</h3>
                <p className="text-[12px] text-text-3">Joined ThinkIT during the beta phase.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
