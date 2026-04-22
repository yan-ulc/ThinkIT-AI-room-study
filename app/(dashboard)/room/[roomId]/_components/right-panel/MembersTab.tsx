"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Check, Copy, LogOut, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { RoomMember } from "../../hooks/useRoomData";

type MembersTabProps = {
  roomId: Id<"rooms">;
  members: RoomMember[] | undefined;
};

export function MembersTab({ roomId, members }: MembersTabProps) {
  const leave = useMutation(api.rooms.leaveRoom);
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const myMembership = (members ?? []).find((m) => m.isMe);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(roomId));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = async () => {
    const confirmed = window.confirm("Leave this room? You can rejoin with the invite code.");
    if (!confirmed) return;
    try {
      await leave({ roomId });
      router.push("/dashboard");
    } catch (err) {
      alert("Failed to leave: " + err);
    }
  };

  return (
    <div className="p-4 space-y-5">
      {/* Invite code section */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-text-3">
          Invite Code
        </p>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface2 px-3 py-2">
          <code className="flex-1 truncate font-mono text-[11px] text-text-2">
            {roomId}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className={`flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all
              ${copied
                ? "bg-emerald-50 text-emerald-700"
                : "text-text-3 hover:bg-surface hover:text-text"
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
          Members · {members?.length ?? 0}
        </p>

        <div className="space-y-1">
          {(members ?? []).map((m) => (
            <div
              key={m._id}
              className={`flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface2 ${
                m.isMe ? "bg-primary/4" : ""
              }`}
            >
              {/* Avatar */}
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-[11px] font-bold text-text-2">
                {m.displayName?.[0]?.toUpperCase() ?? "U"}
                {/* Online dot for admins */}
                {m.role === "admin" && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-emerald-500" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[13px] font-medium text-text leading-tight">
                    {m.displayName}
                    {m.isMe && (
                      <span className="ml-1 text-[10px] font-normal text-text-3">(you)</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  {m.role === "admin" && (
                    <Shield size={9} className="text-primary/60" />
                  )}
                  <p className="text-[10px] capitalize text-text-3">{m.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leave room */}
      {myMembership && (
        <div className="pt-1">
          <button
            type="button"
            onClick={handleLeave}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-[12px] font-medium text-text-3 transition-all hover:border-destructive/30 hover:bg-destructive/8 hover:text-destructive"
          >
            <LogOut size={13} />
            Leave Room
          </button>
        </div>
      )}
    </div>
  );
}