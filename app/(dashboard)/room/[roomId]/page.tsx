"use client";

import { QuizReadyDialog } from "@/components/quiz/QuizReadyDialog";
import { ChatRoomSkeleton } from "./_components/chat/ChatRoomSkeleton";
import { ChatSection } from "./_components/chat/ChatSection";
import { RightPanel } from "./_components/right-panel/RightPanel";
import { useRoomData } from "./hooks/useRoomData";
import { useState } from "react";

export default function RoomPage() {
  const {
    roomId,
    room,
    members,
    messages,
    docs,
    sendMessage,
    rightTab,
    setRightTab,
    deletingDocId,
    documentContext,
    generatingQuizForDocId,
    lastGeneratedQuiz,
    clearLastGeneratedQuiz,
    handleGenerateQuiz,
    handleUploadFiles,
    handleDeleteDoc,
    handleUseDocumentContext,
    clearDocumentContext,
    cancelDocumentContext,
    isUploading,
  } = useRoomData();

  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  if (!room || messages === undefined) {
    return <ChatRoomSkeleton />;
  }

  const myMembership = members?.find((m) => m.isMe);
  const memberStatus = myMembership?.status;

  return (
    <>
      <div className="chat-ambient relative flex flex-1 flex-col md:flex-row overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-70" />
        <ChatSection
          roomId={roomId}
          roomName={room.name}
          roomStatus={room.status}
          memberStatus={memberStatus}
          members={members}
          messages={messages}
          sendMessage={sendMessage}
          selectionContext={documentContext}
          onClearSelectionContext={clearDocumentContext}
          onCancelSelectionContext={cancelDocumentContext}
          isGeneratingQuiz={!!generatingQuizForDocId}
          onToggleRightPanel={() => setIsRightPanelOpen(!isRightPanelOpen)}
        />

        <RightPanel
          rightTab={rightTab}
          setRightTab={setRightTab}
          roomId={roomId}
          room={room}
          memberStatus={memberStatus}
          docs={docs}
          members={members}
          deletingDocId={deletingDocId}
          onUploadFiles={handleUploadFiles}
          onDelete={handleDeleteDoc}
          onUseDocumentContext={handleUseDocumentContext}
          generatingQuizForDocId={generatingQuizForDocId}
          onGenerateQuiz={handleGenerateQuiz}
          isUploading={isUploading}
          isOpen={isRightPanelOpen}
          onClose={() => setIsRightPanelOpen(false)}
        />
      </div>

      {lastGeneratedQuiz && (
        <QuizReadyDialog
          quizId={lastGeneratedQuiz.quizId}
          title={lastGeneratedQuiz.title}
          isOpen={!!lastGeneratedQuiz}
          onClose={clearLastGeneratedQuiz}
        />
      )}
    </>
  );
}
