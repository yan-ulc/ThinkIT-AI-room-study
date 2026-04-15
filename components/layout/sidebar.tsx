"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const { user } = useUser();
  const pathname = usePathname();

  const rooms = useQuery(api.rooms.getMyRooms);
  const createRoom = useMutation(api.rooms.create);

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

  return (
    <aside className="flex h-full w-55 shrink-0 flex-col border-r border-border bg-surface transition-colors duration-300">
      <div className="px-4 pb-3 pt-4">
        <div className="flex items-center gap-2 text-base font-semibold tracking-tight text-text">
          <span className="h-2 w-2 rounded-full bg-primary" />
          ThinkIT
        </div>
      </div>

      <div className="px-3 pb-1">
        <p className="px-2 text-[11px] font-medium uppercase tracking-wider text-text-3">
          Rooms
        </p>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 pb-2">
          {(rooms ?? []).map((room) => (
            <Link
              key={room._id}
              href={`/room/${room._id}`}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-[13px] transition-colors",
                pathname === `/room/${room._id}`
                  ? "bg-primary-muted font-medium text-primary"
                  : "text-text-2 hover:bg-surface2 hover:text-text",
              )}
            >
              <div
                className={cn(
                  "flex h-5.5 w-5.5 items-center justify-center rounded-md text-[11px]",
                  pathname === `/room/${room._id}`
                    ? "bg-primary text-white"
                    : "bg-surface2",
                )}
              >
                {room.name[0]}
              </div>
              <span className="truncate">{room.name}</span>
            </Link>
          ))}
        </div>
      </ScrollArea>

      <div className="p-3">
        <button
          onClick={handleCreate}
          className="flex w-full items-center gap-2 rounded-md border border-dashed border-primary-light bg-primary-muted px-3 py-2 text-[13px] font-medium text-primary transition-colors hover:bg-primary hover:text-white"
        >
          <Plus size={14} strokeWidth={2.5} />
          New room
        </button>
      </div>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-surface2 border border-border">
          <div className="flex h-7.5 w-7.5 items-center justify-center rounded-full border border-primary-light bg-primary-muted text-[10px] font-semibold text-primary">
            {(user?.firstName?.[0] || "A") + (user?.lastName?.[0] || "K")}
          </div>
          <div className="flex flex-col min-width-0 overflow-hidden">
            <span className="text-[13px] font-medium text-text truncate">
              {user?.fullName || "Loading..."}
            </span>
            <span className="text-[11px] text-text-3 font-medium">Student</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
