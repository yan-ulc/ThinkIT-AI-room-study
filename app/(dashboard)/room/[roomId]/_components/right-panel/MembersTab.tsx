"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Check, Copy, LogOut, Shield, Lock, Trash2, UserMinus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { RoomMember } from "../../hooks/useRoomData";

type MembersTabProps = {
  roomId: Id<"rooms">;
  room: any;
  members: RoomMember[] | undefined;
};

export function MembersTab({ roomId, room, members }: MembersTabProps) {
  const leave = useMutation(api.rooms.leaveRoom);
  const closeRoom = useMutation(api.rooms.closeRoom);
  const hideRoom = useMutation(api.rooms.hideRoom);
  const removeMember = useMutation(api.rooms.removeMember);

  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const myMembership = (members ?? []).find((m) => m.isMe);
  const isOwner = myMembership?.role === "owner";

  const displayMembers = (members ?? []).filter(
    (m) => m.status !== "removed" || m.isMe
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(String(roomId));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = async () => {
    const confirmed = window.confirm(
      "Leave this room? You can rejoin with the invite code.",
    );
    if (!confirmed) return;
    try {
      await leave({ roomId });
      router.push("/dashboard");
    } catch (err) {
      alert("Failed to leave: " + err);
    }
  };

  const handleCloseRoom = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to close this room? No one will be able to send messages, upload documents, or generate quizzes.",
    );
    if (!confirmed) return;
    try {
      await closeRoom({ roomId });
    } catch (err) {
      alert("Failed to close room: " + err);
    }
  };

  const handleDeleteRoom = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete (hide) this room? You will no longer see it, but other members will retain their access.",
    );
    if (!confirmed) return;
    try {
      await hideRoom({ roomId });
      router.push("/dashboard");
    } catch (err) {
      alert("Failed to delete room: " + err);
    }
  };

  const handleRemoveMember = async (memberId: Id<"users">) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this member?",
    );
    if (!confirmed) return;
    try {
      await removeMember({ roomId, memberId });
    } catch (err) {
      alert("Failed to remove member: " + err);
    }
  };

  return (
    <div className="space-y-5 p-4">
      {/* Settings Section (Owner Only) */}
      {isOwner && (
        <>
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-3">
              Room Settings
            </p>
            {room?.status !== "closed" && (
              <button
                type="button"
                onClick={handleCloseRoom}
                className="flex w-full items-center gap-2 rounded-lg border border-border/80 px-3 py-2 text-[12px] font-medium text-text-2 transition-colors hover:border-amber-500/35 hover:bg-amber-500/10 hover:text-amber-500"
              >
                <Lock size={13} />
                Close Room
              </button>
            )}
            <button
              type="button"
              onClick={handleDeleteRoom}
              className="flex w-full items-center gap-2 rounded-lg border border-border/80 px-3 py-2 text-[12px] font-medium text-text-2 transition-colors hover:border-destructive/35 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 size={13} />
              Delete Room
            </button>
          </div>
          <div className="h-px bg-border" />
        </>
      )}

      {/* Invite code section */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-text-3">
          Invite Code
        </p>
        <div className="glass-panel flex items-center gap-2 rounded-lg px-3 py-2">
          <code className="flex-1 truncate font-mono text-[11px] text-text-2">
            {roomId}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className={`flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors
              ${
                copied
                  ? "bg-primary/12 text-primary"
                  : "text-text-3 hover:bg-muted hover:text-text"
              }`}
            title="Copy invite code"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Members list */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-text-3">
          Members · {displayMembers.length}
        </p>

        <div className="space-y-2">
          {displayMembers.map((m) => (
            <div
              key={m._id}
              className={`glass-panel flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors ${
                m.status === "removed" ? "opacity-50 grayscale" : "hover:border-primary/30"
              } ${
                m.isMe ? "border-primary/35" : ""
              }`}
            >
              {/* Avatar */}
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/80 bg-muted text-[11px] font-bold text-text-2">
                {m.displayName?.[0]?.toUpperCase() ?? "U"}
                {/* Online dot for owner/admins */}
                {(m.role === "admin" || m.role === "owner") && m.status !== "removed" && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-primary" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[13px] font-medium text-text leading-tight">
                    {m.displayName}
                    {m.isMe && (
                      <span className="ml-1 text-[10px] font-normal text-text-3">
                        (you)
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  {(m.role === "admin" || m.role === "owner") && (
                    <Shield size={9} className="text-primary/60" />
                  )}
                  <p className="text-[10px] capitalize text-text-3">
                    {m.status === "removed" ? "Removed" : m.role}
                  </p>
                </div>
              </div>

              {/* Remove member button for owner */}
              {isOwner && !m.isMe && m.status !== "removed" && (
                <button
                  type="button"
                  onClick={() => handleRemoveMember(m._id)}
                  className="flex shrink-0 items-center justify-center p-1.5 text-text-3 transition-colors hover:bg-destructive/10 hover:text-destructive rounded-md"
                  title="Remove member"
                >
                  <UserMinus size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Leave room - Owner cannot leave, removed user cannot leave again */}
      {myMembership && !isOwner && myMembership.status !== "removed" && (
        <div className="pt-1">
          <button
            type="button"
            onClick={handleLeave}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border/80 px-3 py-2 text-[12px] font-medium text-text-3 transition-colors hover:border-destructive/35 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut size={13} />
            Leave Room
          </button>
        </div>
      )}
    </div>
  );
}
