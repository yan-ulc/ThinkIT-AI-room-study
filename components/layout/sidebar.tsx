"use client";

import { ThemeSwitcher } from "@/components/theme-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { Plus, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function Sidebar({ 
  isOpen, 
  onClose 
}: { 
  isOpen?: boolean; 
  onClose?: () => void;
}) {
  const { user } = useUser();
  const pathname = usePathname();

  const rooms = useQuery(api.rooms.getMyRooms);
  const createRoom = useMutation(api.rooms.create);

  const [isMinimized, setIsMinimized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("sidebar-minimized");
    if (saved === "true") {
      setIsMinimized(true);
    }
  }, []);

  const toggleMinimize = () => {
    const next = !isMinimized;
    setIsMinimized(next);
    localStorage.setItem("sidebar-minimized", String(next));
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
  
  const min = isMounted && isMinimized;

  return (
    <>
      {/* Overlay for mobile (Step 5 & 7) */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-140 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar container (Step 1, 2, 3, 4, 8) */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-150 flex flex-col border-r border-border/60 bg-surface transition-[width,transform] duration-300 ease-in-out lg:static lg:flex lg:translate-x-0 lg:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          min ? "w-[280px] lg:w-[68px]" : "w-[280px] lg:w-55"
        )}
      >
      {/* Header: Logo + theme toggle */}
      <div className={cn("px-4 pt-4 pb-4 flex items-center justify-between", min && "lg:px-2 lg:flex-col lg:gap-4")}>
        <div className={cn("flex items-center gap-2 text-[14px] font-semibold tracking-tight text-text", min && "lg:hidden")}>
          <span className="h-1.5 w-1.5 rounded-full bg-primary opacity-90" />
          <span className="tracking-[-0.01em]">ThinkIT</span>
        </div>
        <div className={cn("hidden lg:flex items-center justify-center", !min && "lg:hidden")}>
          <span className="h-2.5 w-2.5 rounded-full bg-primary opacity-90" />
        </div>
        <div className={cn("flex items-center gap-1", min && "lg:flex-col")}>
          <ThemeToggle className="relative flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground" />
          <ThemeSwitcher className="relative flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground" />
          <button 
            onClick={toggleMinimize} 
            className="hidden lg:flex relative h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
            title={min ? "Expand Sidebar" : "Minimize Sidebar"}
          >
            {min ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>
      </div>

      {/* Rooms section label */}
      <div className={cn("px-4 pb-2", min && "lg:hidden")}>
        <span className="text-[10.5px] font-semibold uppercase tracking-widest text-text-3/70 select-none">
          Rooms
        </span>
      </div>

      {/* Room list */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-0.5 pb-3">
          {(rooms ?? []).length === 0 && (
            <p className={cn("px-3 py-2 text-[12px] text-text-3 italic", min && "lg:hidden")}>
              No rooms yet.
            </p>
          )}

          {(rooms ?? []).map((room) => {
            const isActive = pathname === `/room/${room._id}`;
            const unreadCount = room.unreadCount ?? 0;
            const mentionCount = room.mentionCount ?? 0;
            const hasNotification = unreadCount > 0 || mentionCount > 0;
            
            return (
              <Link
                key={room._id}
                href={`/room/${room._id}`}
                className={cn(
                  "group flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-[13px] transition-colors duration-150 relative",
                  min ? "lg:justify-center lg:px-0" : "w-full",
                  isActive
                    ? "bg-primary-muted text-primary font-medium border-primary/20 dark:border-primary/30 dark:bg-primary/14 dark:text-primary"
                    : "border-transparent text-text-2 hover:bg-surface2 hover:text-text dark:hover:border-white/15 dark:hover:bg-white/6",
                )}
                title={min ? room.name : undefined}
              >
                {/* Room initial badge */}
                <div
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-md text-[10px] font-semibold transition-colors relative",
                    min ? "lg:h-8 lg:w-8 lg:text-[14px] h-5 w-5" : "h-5 w-5",
                    isActive
                      ? "bg-primary text-white dark:bg-primary/80 dark:text-primary-foreground"
                      : "bg-surface2 text-text-3 group-hover:bg-border dark:bg-white/8 dark:group-hover:bg-white/14",
                  )}
                >
                  {room.name[0].toUpperCase()}
                  
                  {/* Minimized Notifications as dots */}
                  {min && hasNotification && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border border-surface bg-rose-500 hidden lg:block" />
                  )}
                </div>
                <span className={cn("truncate leading-snug", min && "lg:hidden")}>{room.name}</span>

                <div className={cn("ml-auto flex items-center gap-1", min && "lg:hidden")}>
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
      <div className={cn("px-3 pb-3", min && "lg:px-2")}>
        <button
          onClick={handleCreate}
          className={cn(
            "flex items-center rounded-lg py-2 transition-colors duration-150",
            "text-[12.5px] font-medium text-text-3 border border-dashed border-border hover:border-primary/40 hover:bg-primary-muted hover:text-primary dark:border-white/20 dark:hover:border-primary/45 dark:hover:bg-primary/12",
            min ? "lg:justify-center lg:p-2 w-full lg:w-auto lg:aspect-square px-3" : "w-full gap-2 px-3"
          )}
          title={min ? "New room" : undefined}
        >
          <Plus size={13} strokeWidth={2.5} />
          <span className={cn(min && "lg:hidden")}>New room</span>
        </button>
      </div>

      {/* Divider */}
      <div className="mx-3 border-t border-border/60 dark:border-white/15" />

      {/* User card */}
      <div className={cn("p-3", min && "lg:p-2")}>
        <Link
          href="/profile"
          className={cn(
            "flex cursor-pointer items-center rounded-lg border border-transparent py-2 transition-colors duration-150 hover:bg-surface2 dark:hover:border-white/12 dark:hover:bg-white/6",
            min ? "lg:justify-center px-2.5 lg:px-0" : "gap-2.5 px-2.5"
          )}
          title={min ? "Profile" : undefined}
        >
          {/* Avatar */}
          <div className={cn(
            "flex shrink-0 select-none items-center justify-center rounded-full border border-primary/20 bg-primary-muted font-semibold text-primary dark:border-primary/35 dark:bg-primary/15",
            min ? "lg:h-9 lg:w-9 lg:text-[12px] h-7 w-7 text-[10px]" : "h-7 w-7 text-[10px]"
          )}>
            {initials}
          </div>

          {/* Name + role */}
          <div className={cn("flex min-w-0 flex-col", min && "lg:hidden")}>
            <span className="truncate text-[12.5px] font-medium text-text leading-snug">
              {user?.fullName || "Loading…"}
            </span>
            <span className="text-[10.5px] text-text-3 leading-snug">
              Student / Profile
            </span>
          </div>
        </Link>
      </div>
    </aside>
    </>
  );
}

