"use client";

import { QuizReadyDialog } from "@/components/quiz/QuizReadyDialog";
import { ChatRoomSkeleton } from "./_components/chat/ChatRoomSkeleton";
import { ChatSection } from "./_components/chat/ChatSection";
import { RightPanel } from "./_components/right-panel/RightPanel";
import { useRoomData } from "./hooks/useRoomData";

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

  if (!room || messages === undefined) {
    return <ChatRoomSkeleton />;
  }

  return (
    <>
      <div className="chat-ambient relative flex flex-1 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-70" />
        <ChatSection
          roomId={roomId}
          roomName={room.name}
          members={members}
          messages={messages}
          sendMessage={sendMessage}
          selectionContext={documentContext}
          onClearSelectionContext={clearDocumentContext}
          onCancelSelectionContext={cancelDocumentContext}
        />

        <RightPanel
          rightTab={rightTab}
          setRightTab={setRightTab}
          roomId={roomId}
          docs={docs}
          members={members}
          deletingDocId={deletingDocId}
          onUploadFiles={handleUploadFiles}
          onDelete={handleDeleteDoc}
          onUseDocumentContext={handleUseDocumentContext}
          generatingQuizForDocId={generatingQuizForDocId}
          onGenerateQuiz={handleGenerateQuiz}
          isUploading={isUploading}
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
