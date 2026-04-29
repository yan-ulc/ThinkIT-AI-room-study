"use client";

import { QuizList } from "@/components/quiz/QuizList";
import type { Id } from "@/convex/_generated/dataModel";
import { BrainCircuit, FileText, Users } from "lucide-react";
import type {
  DocumentContext,
  RoomDocument,
  RoomMember,
} from "../../hooks/useRoomData";
import { DocumentsTab } from "./DocumentsTab";
import { MembersTab } from "./MembersTab";

type RightPanelProps = {
  rightTab: "documents" | "members" | "quizzes";
  setRightTab: (tab: "documents" | "members" | "quizzes") => void;
  roomId: Id<"rooms">;
  room: any;
  memberStatus?: "active" | "removed";
  docs: RoomDocument[] | undefined;
  members: RoomMember[] | undefined;
  deletingDocId: Id<"documents"> | null;
  onUploadFiles: (files: FileList) => Promise<void>;
  onDelete: (
    id: Id<"documents">,
    storageId: Id<"_storage">,
    name: string,
  ) => Promise<void>;
  onUseDocumentContext: (context: NonNullable<DocumentContext>) => void;
  generatingQuizForDocId: Id<"documents"> | null;
  onGenerateQuiz: (
    docId: Id<"documents">,
    title?: string,
    questionCount?: number,
  ) => Promise<boolean>;
  isUploading: boolean;
};

export function RightPanel({
  rightTab,
  setRightTab,
  roomId,
  room,
  memberStatus,
  docs,
  members,
  deletingDocId,
  onUploadFiles,
  onDelete,
  onUseDocumentContext,
  generatingQuizForDocId,
  onGenerateQuiz,
  isUploading,
}: RightPanelProps) {
  const tabs = [
    {
      id: "documents" as const,
      label: "Documents",
      icon: FileText,
      count: docs?.length,
    },
    {
      id: "members" as const,
      label: "Members",
      icon: Users,
      count: members?.length,
    },
    {
      id: "quizzes" as const,
      label: "Quizzes",
      icon: BrainCircuit,
      count: undefined,
    },
  ];

  return (
    <div className="glass-panel w-80 shrink-0 flex flex-col border-l border-border/70">
      {/* Tab bar */}
      <div className="flex shrink-0 border-b border-border/80 bg-card/45">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = rightTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setRightTab(tab.id)}
              className={`relative flex flex-1 items-center justify-center gap-1.5 py-3 text-[12px] font-medium transition-colors
                ${
                  isActive
                    ? "text-primary"
                    : "text-text-3 hover:bg-muted/70 hover:text-text"
                }`}
            >
              <Icon size={13} />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-px text-[10px] font-semibold leading-none
                  ${isActive ? "bg-primary/12 text-primary" : "bg-muted text-text-3"}`}
                >
                  {tab.count}
                </span>
              )}
              {/* Active indicator */}
              {isActive && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-primary" />
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
            room={room}
            memberStatus={memberStatus}
            docs={docs}
            deletingDocId={deletingDocId}
            onUploadFiles={onUploadFiles}
            onDelete={onDelete}
            onUseDocumentContext={onUseDocumentContext}
            generatingQuizForDocId={generatingQuizForDocId}
            onGenerateQuiz={onGenerateQuiz}
            isUploading={isUploading}
          />
        ) : rightTab === "members" ? (
          <MembersTab roomId={roomId} room={room} members={members} />
        ) : (
          <QuizList
            roomId={roomId}
            room={room}
            memberStatus={memberStatus}
            generatingQuizForDocId={generatingQuizForDocId}
          />
        )}
      </div>
    </div>
  );
}
