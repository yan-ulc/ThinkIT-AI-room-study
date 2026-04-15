"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

function formatRelativeTime(timestamp: number) {
  const diffMs = Date.now() - timestamp;
  const diffMin = Math.floor(diffMs / (1000 * 60));

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;

  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
}

export default function DashboardPage() {
  const router = useRouter();
  const rooms = useQuery(api.rooms.getDashboardRooms);
  const createRoom = useMutation(api.rooms.create);
  const joinRoom = useMutation(api.rooms.join);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateRoom = async () => {
    const name = prompt("Room Name?");
    if (!name) return;

    try {
      await createRoom({
        name,
        description: "New room",
      });
    } catch (error) {
      console.error(error);
      alert("Please sign in before creating a room.");
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

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-text">
          Good afternoon, Alex
        </h2>
        <p className="mt-1 text-sm text-text-2">
          You are in {(rooms ?? []).length} room(s).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(rooms ?? []).map((room) => (
          <article
            key={room._id}
            className="group relative rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="absolute left-0 top-0 h-1 w-full bg-linear-to-r from-primary to-accent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="mb-4 flex min-h-6 items-start justify-between">
              {room.active ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  Live
                </span>
              ) : null}
            </div>

            <h3 className="mb-1 text-[15px] font-medium text-text">
              {room.name}
            </h3>
            <p className="mb-4 text-[12.5px] leading-relaxed text-text-2">
              {room.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex -space-x-1.5">
                {Array.from({ length: Math.min(room.memberCount, 3) }).map(
                  (_, index) => (
                    <span
                      key={`${room._id}-${index}`}
                      className="flex h-5.5 w-5.5 items-center justify-center rounded-full border-2 border-surface bg-primary-muted text-[9px] font-semibold text-primary"
                    >
                      {index + 1}
                    </span>
                  ),
                )}
                {room.memberCount > 3 ? (
                  <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full border-2 border-surface bg-surface2 text-[9px] font-semibold text-text-2">
                    +
                  </span>
                ) : null}
              </div>
              <span className="text-[11.5px] text-text-3">
                {formatRelativeTime(room.lastActivity)}
              </span>
            </div>
          </article>
        ))}

        <button
          onClick={handleCreateRoom}
          className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border-strong bg-surface p-5 text-center transition-all hover:border-primary hover:bg-primary-muted"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-surface2 text-xl text-text-2">
            +
          </span>
          <span className="block text-[13.5px] font-medium text-text-2">
            Create a new room
          </span>
          <span className="text-xs text-text-3">
            Invite people, upload docs
          </span>
        </button>

        <button
          onClick={() => setIsJoinOpen(true)}
          className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-surface p-5 text-center transition-all hover:border-accent hover:bg-accent-muted"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-surface2 text-xl text-text-2">
            #
          </span>
          <span className="block text-[13.5px] font-medium text-text-2">
            Join a room
          </span>
          <span className="text-xs text-text-3">Enter invitation code</span>
        </button>
      </div>

      {isJoinOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-xl">
            <h3 className="text-base font-semibold text-text">Join Room</h3>
            <p className="mt-1 text-sm text-text-2">
              Paste the invitation code from a room admin.
            </p>

            <form onSubmit={handleJoinRoom} className="mt-4 space-y-3">
              <input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Room invitation code"
                className="w-full rounded-lg border border-border-strong bg-surface2 px-3 py-2 text-sm text-text outline-none"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsJoinOpen(false);
                    setInviteCode("");
                  }}
                  className="rounded-lg border border-border px-3 py-2 text-sm text-text-2 hover:bg-surface2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isJoining || !inviteCode.trim()}
                  className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isJoining ? "Joining..." : "Join room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
