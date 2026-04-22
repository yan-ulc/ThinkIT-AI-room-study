"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
  BookOpen,
  Clock,
  Hash,
  MessageSquare,
  Plus,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

function formatRelativeTime(timestamp: number) {
  const diffMs = Date.now() - timestamp;
  const diffMin = Math.floor(diffMs / (1000 * 60));
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// Soft deterministic color per room name
const ROOM_ACCENTS = [
  "bg-sky-50 border-sky-200 text-sky-700",
  "bg-violet-50 border-violet-200 text-violet-700",
  "bg-amber-50 border-amber-200 text-amber-700",
  "bg-emerald-50 border-emerald-200 text-emerald-700",
  "bg-rose-50 border-rose-200 text-rose-700",
  "bg-teal-50 border-teal-200 text-teal-700",
];

function getRoomAccent(id: string) {
  let n = 0;
  for (let i = 0; i < id.length; i++)
    n = (n + id.charCodeAt(i)) % ROOM_ACCENTS.length;
  return ROOM_ACCENTS[n];
}

export default function DashboardPage() {
  const router = useRouter();
  const rooms = useQuery(api.rooms.getDashboardRooms);
  const createRoom = useMutation(api.rooms.create);
  const joinRoom = useMutation(api.rooms.join);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateRoom = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = roomName.trim();
    if (!name) return;
    setIsCreating(true);
    try {
      await createRoom({ name, description: "New room" });
      setIsCreateOpen(false);
      setRoomName("");
    } catch (error) {
      console.error(error);
      alert("Please sign in before creating a room.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = inviteCode.trim();
    if (!code) return;
    setIsJoining(true);
    try {
      await joinRoom({ roomId: code as Id<"rooms"> });
      setIsJoinOpen(false);
      setInviteCode("");
      router.push(`/room/${code}`);
    } catch (error) {
      console.error(error);
      alert("Invalid invitation code or you are not authorized.");
    } finally {
      setIsJoining(false);
    }
  };

  const roomList = rooms ?? [];
  const liveRooms = roomList.filter((r) => r.active).length;
  const isLoading = rooms === undefined;

  return (
    <div className="h-full w-full flex-1 min-w-0 overflow-y-auto bg-surface2/40 dark:bg-[radial-gradient(1200px_520px_at_16%_-8%,rgba(250,204,21,0.14),transparent_60%),radial-gradient(1000px_520px_at_88%_0%,rgba(56,189,248,0.12),transparent_58%)]">
      {/* ── Page header ── */}
      <div className="border-b border-border bg-surface/95 px-6 py-6 backdrop-blur-sm dark:border-white/15 dark:bg-surface/75 md:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-[12px] font-medium uppercase tracking-widest text-text-3">
                thinkIT dashboard
              </p>
              <h1 className="text-[22px] font-semibold tracking-tight text-text">
                {getGreeting()} 👋
              </h1>
              <p className="mt-1 text-[13px] text-text-3">
                {isLoading
                  ? "Loading your rooms…"
                  : roomList.length === 0
                    ? "You haven't joined any rooms yet."
                    : `You're in ${roomList.length} room${roomList.length !== 1 ? "s" : ""}${liveRooms > 0 ? ` · ${liveRooms} live` : ""}.`}
              </p>
            </div>

            {/* Quick stat pills */}
            {!isLoading && roomList.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface2 px-3 py-1.5">
                  <BookOpen size={12} className="text-text-3" />
                  <span className="text-[12px] font-medium text-text-2">
                    {roomList.length} rooms
                  </span>
                </div>
                {liveRooms > 0 && (
                  <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[12px] font-medium text-emerald-700">
                      {liveRooms} live
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="mx-auto max-w-5xl px-6 py-8 md:px-10">
        {/* Empty state */}
        {!isLoading && roomList.length === 0 && (
          <div className="mb-10 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-surface px-8 py-16 text-center dark:border-white/20 dark:bg-white/3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface2">
              <Sparkles size={22} className="text-text-3" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-text">
                Start your first room
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-text-3 max-w-xs">
                Create a room to start a focused discussion, invite others, and
                explore ideas with AI.
              </p>
            </div>
          </div>
        )}

        {/* Section label */}
        {roomList.length > 0 && (
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-text-3">
            Your Rooms
          </p>
        )}

        {/* Room grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {/* Skeleton loading */}
          {isLoading &&
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-2xl bg-muted"
              />
            ))}

          {/* Room cards */}
          {roomList.map((room) => {
            const accent = getRoomAccent(String(room._id));
            const initial = room.name?.[0]?.toUpperCase() ?? "R";
            return (
              <article
                key={room._id}
                onClick={() => router.push(`/room/${room._id}`)}
                className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/15 dark:bg-white/[0.035] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.025),0_10px_28px_rgba(0,0,0,0.33)] dark:hover:border-primary/35"
              >
                {/* Live badge */}
                {room.active && (
                  <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:border-emerald-300/30 dark:bg-emerald-400/15 dark:text-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </div>
                )}

                {/* Room identity */}
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-[13px] font-bold ${accent}`}
                  >
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-[14px] font-semibold text-text leading-tight">
                      {room.name}
                    </h3>
                    {room.description && (
                      <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-text-3">
                        {room.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer meta */}
                <div className="flex items-center justify-between border-t border-border pt-3 dark:border-white/15">
                  {/* Member avatars */}
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      {Array.from({
                        length: Math.min(room.memberCount, 4),
                      }).map((_, i) => (
                        <div
                          key={`${room._id}-${i}`}
                          className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-surface bg-muted text-[8px] font-bold text-text-3"
                        >
                          {i + 1}
                        </div>
                      ))}
                      {room.memberCount > 4 && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-surface bg-surface2 text-[8px] font-semibold text-text-3">
                          +{room.memberCount - 4}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-text-3">
                      {room.memberCount}{" "}
                      {room.memberCount === 1 ? "member" : "members"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-text-3">
                    <Clock size={10} />
                    {formatRelativeTime(room.lastActivity)}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* ── Action cards ── */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="group flex items-center gap-4 rounded-2xl border-2 border-dashed border-border bg-surface px-5 py-4 text-left transition-all hover:border-primary/50 hover:bg-primary/4 dark:border-white/20 dark:bg-white/[0.035] dark:hover:border-primary/45 dark:hover:bg-primary/10"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface2 transition-colors group-hover:border-primary/30 group-hover:bg-primary/8">
              <Plus
                size={18}
                className="text-text-3 transition-colors group-hover:text-primary"
              />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-text-2 group-hover:text-text">
                Create a new room
              </p>
              <p className="text-[11px] text-text-3">
                Invite people, upload docs, ask AI
              </p>
            </div>
          </button>

          <button
            onClick={() => setIsJoinOpen(true)}
            className="group flex items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-4 text-left transition-all hover:border-border-strong hover:shadow-sm dark:border-white/15 dark:bg-white/[0.035] dark:hover:border-white/30"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface2">
              <Hash size={18} className="text-text-3" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-text-2 group-hover:text-text">
                Join a room
              </p>
              <p className="text-[11px] text-text-3">
                Enter an invitation code
              </p>
            </div>
          </button>
        </div>

        {/* ── Tip strip ── */}
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3 dark:border-primary/25 dark:bg-primary/10">
          <MessageSquare size={14} className="mt-0.5 shrink-0 text-text-3" />
          <p className="text-[12px] leading-relaxed text-text-3">
            <span className="font-semibold text-text-2">Tip:</span> Highlight
            text in any document and click{" "}
            <span className="font-medium text-text-2">Ask AI</span> to bring it
            directly into the discussion.
          </p>
        </div>
      </div>

      {/* ── Create Room Modal ── */}
      {isCreateOpen && (
        <Modal
          onClose={() => {
            setIsCreateOpen(false);
            setRoomName("");
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface2">
              <Plus size={16} className="text-text-2" />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-text">
                Create a room
              </h3>
              <p className="text-[12px] text-text-3">
                Give your discussion space a name.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateRoom} className="space-y-4">
            <input
              autoFocus
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g. Biology Chapter 4, Design Review…"
              className="w-full rounded-lg border border-border-strong bg-surface2 px-3 py-2.5 text-[13px] text-text outline-none placeholder:text-text-3 focus:border-primary dark:border-white/25 dark:bg-white/4"
            />
            <div className="flex justify-end gap-2">
              <ModalCancelButton
                onClick={() => {
                  setIsCreateOpen(false);
                  setRoomName("");
                }}
              />
              <button
                type="submit"
                disabled={isCreating || !roomName.trim()}
                className="rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCreating ? "Creating…" : "Create room"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Join Room Modal ── */}
      {isJoinOpen && (
        <Modal
          onClose={() => {
            setIsJoinOpen(false);
            setInviteCode("");
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface2">
              <Users size={16} className="text-text-2" />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-text">
                Join a room
              </h3>
              <p className="text-[12px] text-text-3">
                Paste the invitation code from a room admin.
              </p>
            </div>
          </div>

          <form onSubmit={handleJoinRoom} className="space-y-4">
            <input
              autoFocus
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Room invitation code"
              className="w-full rounded-lg border border-border-strong bg-surface2 px-3 py-2.5 font-mono text-[13px] text-text outline-none placeholder:font-sans placeholder:text-text-3 focus:border-primary dark:border-white/25 dark:bg-white/4"
            />
            <div className="flex justify-end gap-2">
              <ModalCancelButton
                onClick={() => {
                  setIsJoinOpen(false);
                  setInviteCode("");
                }}
              />
              <button
                type="submit"
                disabled={isJoining || !inviteCode.trim()}
                className="rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isJoining ? "Joining…" : "Join room"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ── Shared modal shell ──
function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl dark:border-white/20 dark:bg-[#11131a]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-text-3 transition-colors hover:bg-surface2 hover:text-text"
        >
          <X size={15} />
        </button>
        {children}
      </div>
    </div>
  );
}

function ModalCancelButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-border px-4 py-2 text-[13px] text-text-2 transition-colors hover:bg-surface2 dark:border-white/20 dark:hover:bg-white/6"
    >
      Cancel
    </button>
  );
}
