"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import type { RoomMember } from "../../hooks/useRoomData";

type MembersTabProps = {
  roomId: Id<"rooms">;
  members: RoomMember[] | undefined;
};

export function MembersTab({ roomId, members }: MembersTabProps) {
  const leave = useMutation(api.rooms.leaveRoom);
  const router = useRouter();
  const myMembership = (members ?? []).find((member) => member.isMe);

  const handleLeave = async () => {
    const konfirmasi = window.confirm("Yakin mau cabut dari room ini, Ngab?");
    if (!konfirmasi) return;

    try {
      await leave({ roomId });
      router.push("/dashboard"); // Balikin ke dashboard setelah leave
    } catch (err) {
      alert("Gagal kabur: " + err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border-strong bg-surface2 p-3">
        <p className="mb-2 text-[10px] font-bold uppercase text-text-3">
          Invite Code
        </p>
        <div className="flex gap-2">
          <code className="flex-1 truncate rounded border bg-white p-1.5 text-[11px]">
            {roomId}
          </code>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[10px]"
            onClick={() => {
              navigator.clipboard.writeText(String(roomId));
              alert("ID Copied!");
            }}
          >
            Copy
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-text-3">
          Members - {members?.length ?? 0}
        </p>

        {(members ?? []).map((m) => (
          <div key={m._id} className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary-light bg-primary-muted text-[10px] font-bold text-primary">
              {m.displayName?.[0] ?? "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium">
                {m.displayName}
              </p>
              <p className="text-[10px] capitalize text-text-3">{m.role}</p>
            </div>
            {m.role === "admin" ? (
              <div
                className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500"
                title="Online"
              />
            ) : null}
          </div>
        ))}

        {myMembership ? (
          <div className="pt-3">
            <Button
              onClick={handleLeave}
              className="w-full justify-center gap-2 rounded-md border border-red-200 bg-red-100 text-red-700 transition-all hover:bg-red-200 hover:text-red-800"
              title="Leave Room"
            >
              Leave Room
              <LogOut size={14} />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
