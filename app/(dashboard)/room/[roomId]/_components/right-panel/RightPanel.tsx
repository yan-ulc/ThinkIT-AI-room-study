"use client";

import type { Id } from "@/convex/_generated/dataModel";
import { FileText, Users } from "lucide-react";
import type {
  DocumentContext,
  RoomDocument,
  RoomMember,
} from "../../hooks/useRoomData";
import { DocumentsTab } from "./DocumentsTab";
import { MembersTab } from "./MembersTab";

type RightPanelProps = {
  rightTab: "documents" | "members";
  setRightTab: (tab: "documents" | "members") => void;
  roomId: Id<"rooms">;
  docs: RoomDocument[] | undefined;
  members: RoomMember[] | undefined;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  deletingDocId: Id<"documents"> | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onDelete: (
    id: Id<"documents">,
    storageId: Id<"_storage">,
    name: string,
  ) => Promise<void>;
  onUseDocumentContext: (context: NonNullable<DocumentContext>) => void;
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
  onUseDocumentContext,
}: RightPanelProps) {
  const tabs = [
    { id: "documents" as const, label: "Documents", icon: FileText, count: docs?.length },
    { id: "members" as const, label: "Members", icon: Users, count: members?.length },
  ];

  return (
    <div className="w-72 shrink-0 flex flex-col bg-surface border-l border-border">
      {/* Tab bar */}
      <div className="flex shrink-0 border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = rightTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setRightTab(tab.id)}
              className={`relative flex flex-1 items-center justify-center gap-1.5 py-3 text-[12px] font-medium transition-colors
                ${isActive
                  ? "text-primary"
                  : "text-text-3 hover:text-text hover:bg-surface2"
                }`}
            >
              <Icon size={13} />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`rounded-full px-1.5 py-px text-[10px] font-semibold leading-none
                  ${isActive ? "bg-primary/10 text-primary" : "bg-muted text-text-3"}`}>
                  {tab.count}
                </span>
              )}
              {/* Active indicator */}
              {isActive && (
                <span className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {rightTab === "documents" ? (
          <DocumentsTab
            roomId={roomId}
            docs={docs}
            fileInputRef={fileInputRef}
            deletingDocId={deletingDocId}
            onUpload={onUpload}
            onDelete={onDelete}
            onUseDocumentContext={onUseDocumentContext}
          />
        ) : (
          <MembersTab roomId={roomId} members={members} />
        )}
      </div>
    </div>
  );
}