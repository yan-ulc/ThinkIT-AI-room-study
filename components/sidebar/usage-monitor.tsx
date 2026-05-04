"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { usePathname } from "next/navigation";
import { Zap, Users, Upload, BookOpen } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ── Mini progress bar used internally ──────────────────────────
function UsageBar({
  label,
  icon: Icon,
  used,
  limit,
  color,
  tooltip,
}: {
  label: string;
  icon: React.ElementType;
  used: number;
  limit: number;
  color: string;
  tooltip: string;
}) {
  const pct = Math.min((used / limit) * 100, 100);
  const isWarn = pct >= 70;
  const isCrit = pct >= 90;

  const barColor = isCrit
    ? "bg-rose-500"
    : isWarn
      ? "bg-amber-400"
      : color;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="group cursor-default">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Icon
                  size={11}
                  className={
                    isCrit
                      ? "text-rose-500"
                      : isWarn
                        ? "text-amber-400"
                        : "text-text-3"
                  }
                />
                <span className="text-[10.5px] font-medium text-text-2 leading-none">
                  {label}
                </span>
              </div>
              <span
                className={`text-[10px] font-semibold tabular-nums leading-none ${
                  isCrit
                    ? "text-rose-500"
                    : isWarn
                      ? "text-amber-400"
                      : "text-text-3"
                }`}
              >
                {used}/{limit}
              </span>
            </div>

            {/* Track */}
            <div className="h-1 w-full rounded-full bg-border/60 dark:bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="text-[11px] max-w-[200px] leading-snug"
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ── Main Component ──────────────────────────────────────────────
interface UsageMonitorProps {
  /** Hide the component when sidebar is minimized (icon-only mode). */
  minimized?: boolean;
}

export function UsageMonitor({ minimized }: UsageMonitorProps) {
  // Derive roomId from path — only show room-level stat when inside a room
  const pathname = usePathname();
  const roomMatch = pathname?.match(/^\/room\/([^/]+)/);
  const roomId = roomMatch?.[1] as Id<"rooms"> | undefined;

  // We always pass a roomId to the query; fall back to a sentinel that returns null
  const stats = useQuery(
    api.rateLimit.getUsageStats,
    roomId ? { roomId } : "skip"
  );

  // Don't render anything while loading or when not in a room
  if (!stats || minimized) return null;

  const burstLabel =
    stats.burst.used >= stats.burst.limit
      ? "AI sedang cooldown ✋"
      : `AI Energy`;

  const roomLabel =
    stats.room.used >= stats.room.limit
      ? "Room cap tercapai 🚫"
      : `Room Capacity`;

  return (
    <div className="mx-3 mb-3 rounded-xl border border-border/60 bg-surface2/60 p-3 dark:border-white/10 dark:bg-white/4">
      {/* Header */}
      <div className="mb-2.5 flex items-center gap-1.5">
        <Zap size={11} className="text-primary" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-text-3/80 select-none">
          AI Usage
        </span>
      </div>

      <div className="space-y-2.5">
        {/* Burst */}
        <UsageBar
          label={burstLabel}
          icon={Zap}
          used={stats.burst.used}
          limit={stats.burst.limit}
          color="bg-primary"
          tooltip={`${stats.burst.used} dari ${stats.burst.limit} pertanyaan dalam 10 menit terakhir.`}
        />

        {/* Room */}
        <UsageBar
          label={roomLabel}
          icon={Users}
          used={stats.room.used}
          limit={stats.room.limit}
          color="bg-violet-500"
          tooltip={`Room ini sudah pakai ${stats.room.used} dari ${stats.room.limit} AI calls dalam 3 jam terakhir.`}
        />

        {/* Divider */}
        <div className="border-t border-border/40 dark:border-white/8 pt-1.5">
          <p className="text-[9.5px] font-semibold uppercase tracking-widest text-text-3/60 mb-2 select-none">
            Daily Quota
          </p>
          <div className="space-y-2">
            {/* Uploads */}
            <UsageBar
              label="Files Uploaded"
              icon={Upload}
              used={stats.daily.uploads.used}
              limit={stats.daily.uploads.limit}
              color="bg-cyan-500"
              tooltip={`${stats.daily.uploads.used} dari ${stats.daily.uploads.limit} file upload hari ini. Reset tiap 24 jam.`}
            />

            {/* Quizzes */}
            <UsageBar
              label="Quizzes Generated"
              icon={BookOpen}
              used={stats.daily.quizzes.used}
              limit={stats.daily.quizzes.limit}
              color="bg-emerald-500"
              tooltip={`${stats.daily.quizzes.used} dari ${stats.daily.quizzes.limit} quiz dibuat hari ini. Reset tiap 24 jam.`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
