"use client";

import type { Doc, Id } from "@/convex/_generated/dataModel";
import type { RoomMember } from "../../hooks/useRoomData";
import { DocumentsTab } from "./DocumentsTab";
import { MembersTab } from "./MembersTab";

type RightPanelProps = {
  rightTab: "documents" | "members";
  setRightTab: (tab: "documents" | "members") => void;
  roomId: Id<"rooms">;
  docs: Doc<"documents">[] | undefined;
  members: RoomMember[] | undefined;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  deletingDocId: Id<"documents"> | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onDelete: (
    id: Id<"documents">,
    storageId: Id<"_storage">,
    name: string,
  ) => Promise<void>;
};

export function RightPanel({
  rightTab,
  setRightTab,
  roomId,
  docs,
  members,
  fileInputRef,
  deletingDocId,
  onUpload,
  onDelete,
}: RightPanelProps) {
  return (
    <div className="w-70 shrink-0 bg-white flex flex-col lg:flex">
      <div className="flex border-b border-border">
        <button
          onClick={() => setRightTab("documents")}
          className={`flex-1 py-3 text-[13px] font-medium ${
            rightTab === "documents"
              ? "border-b-2 border-primary text-primary"
              : "text-text-2 hover:bg-slate-50"
          }`}
        >
          Documents
        </button>
        <button
          onClick={() => setRightTab("members")}
          className={`flex-1 py-3 text-[13px] font-medium ${
            rightTab === "members"
              ? "border-b-2 border-primary text-primary"
              : "text-text-2 hover:bg-slate-50"
          }`}
        >
          Members
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {rightTab === "documents" ? (
          <DocumentsTab
            docs={docs}
            fileInputRef={fileInputRef}
            deletingDocId={deletingDocId}
            onUpload={onUpload}
            onDelete={onDelete}
          />
        ) : (
          <MembersTab roomId={roomId} members={members} />
        )}
      </div>
    </div>
  );
}
