"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { Moon, Plus, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Sidebar() {
  const { user } = useUser();
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark"),
  );

  const rooms = useQuery(api.rooms.getMyRooms);
  const createRoom = useMutation(api.rooms.create);

  const toggleTheme = () => {
    const root = document.documentElement;
    const nextDark = !isDark;
    root.classList.toggle("dark", nextDark);
    setIsDark(nextDark);
  };

  const handleCreate = async () => {
    const name = prompt("Room Name?");
    if (!name) return;

    try {
      await createRoom({ name, description: "Classroom baru" });
    } catch (error) {
      console.error(error);
      alert("Please sign in before creating a room.");
    }
  };

  const initials = (user?.firstName?.[0] || "A") + (user?.lastName?.[0] || "K");

  return (
    <aside className="flex h-full w-55 shrink-0 flex-col border-r border-border/60 bg-surface transition-colors duration-300 dark:border-white/15 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.045)_0%,rgba(255,255,255,0.02)_100%)]">
      {/* Header: Logo + theme toggle */}
      <div className="px-4 pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[14px] font-semibold tracking-tight text-text">
            <span className="h-1.5 w-1.5 rounded-full bg-primary opacity-90" />
            <span className="tracking-[-0.01em]">ThinkIT</span>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-7 w-7 items-center justify-center rounded-md text-text-3 transition-colors duration-150 hover:text-text-2 dark:hover:bg-white/8"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={13} /> : <Moon size={13} />}
          </button>
        </div>
      </div>

      {/* Rooms section label */}
      <div className="px-4 pb-2">
        <span className="text-[10.5px] font-semibold uppercase tracking-widest text-text-3/70 select-none">
          Rooms
        </span>
      </div>

      {/* Room list */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-0.5 pb-3">
          {(rooms ?? []).length === 0 && (
            <p className="px-3 py-2 text-[12px] text-text-3 italic">
              No rooms yet.
            </p>
          )}

          {(rooms ?? []).map((room) => {
            const isActive = pathname === `/room/${room._id}`;
            const unreadCount = room.unreadCount ?? 0;
            const mentionCount = room.mentionCount ?? 0;
            return (
              <Link
                key={room._id}
                href={`/room/${room._id}`}
                className={cn(
                  "group flex w-full items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 text-[13px] transition-colors duration-150",
                  isActive
                    ? "bg-primary-muted text-primary font-medium dark:border-primary/30 dark:bg-primary/14 dark:text-primary"
                    : "text-text-2 hover:bg-surface2 hover:text-text dark:hover:border-white/15 dark:hover:bg-white/6",
                )}
              >
                {/* Room initial badge */}
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold transition-colors",
                    isActive
                      ? "bg-primary text-white dark:bg-primary/80 dark:text-primary-foreground"
                      : "bg-surface2 text-text-3 group-hover:bg-border dark:bg-white/8 dark:group-hover:bg-white/14",
                  )}
                >
                  {room.name[0].toUpperCase()}
                </div>
                <span className="truncate leading-snug">{room.name}</span>

                <div className="ml-auto flex items-center gap-1">
                  {mentionCount > 0 && (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full border border-rose-300/50 bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white dark:border-rose-300/35 dark:bg-rose-500/90">
                      @{mentionCount > 9 ? "9+" : mentionCount}
                    </span>
                  )}
                  {unreadCount > 0 && (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full border border-emerald-300/50 bg-emerald-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white dark:border-emerald-300/35 dark:bg-emerald-500/90">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      {/* New room button */}
      <div className="px-3 pb-3">
        <button
          onClick={handleCreate}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-3 py-2",
            "text-[12.5px] font-medium text-text-3",
            "border border-dashed border-border hover:border-primary/40",
            "hover:bg-primary-muted hover:text-primary",
            "dark:border-white/20 dark:hover:border-primary/45 dark:hover:bg-primary/12",
            "transition-all duration-150",
          )}
        >
          <Plus size={13} strokeWidth={2.5} />
          New room
        </button>
      </div>

      {/* Divider */}
      <div className="mx-3 border-t border-border/60 dark:border-white/15" />

      {/* User card */}
      <div className="p-3">
        <div className="flex cursor-default items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 transition-colors duration-150 hover:bg-surface2 dark:hover:border-white/12 dark:hover:bg-white/6">
          {/* Avatar */}
          <div className="flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-full border border-primary/20 bg-primary-muted text-[10px] font-semibold text-primary dark:border-primary/35 dark:bg-primary/15">
            {initials}
          </div>

          {/* Name + role */}
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[12.5px] font-medium text-text leading-snug">
              {user?.fullName || "Loading…"}
            </span>
            <span className="text-[10.5px] text-text-3 leading-snug">
              Student
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
