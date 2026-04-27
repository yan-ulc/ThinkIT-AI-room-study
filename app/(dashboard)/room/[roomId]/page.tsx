"use client";

import { QuizReadyDialog } from "@/components/quiz/QuizReadyDialog";
import { Loader2 } from "lucide-react";
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
    fileInputRef,
    deletingDocId,
    documentContext,
    generatingQuizForDocId,
    lastGeneratedQuiz,
    clearLastGeneratedQuiz,
    handleGenerateQuiz,
    handleUpload,
    handleDeleteDoc,
    handleUseDocumentContext,
    clearDocumentContext,
    cancelDocumentContext,
  } = useRoomData();

  if (!room || messages === undefined) {
    return (
      <div className="flex h-full w-full flex-1 items-center justify-center bg-surface">
        <div className="flex items-center gap-2 text-text-3">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm font-medium">Loading room...</span>
        </div>
      </div>
    );
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
          fileInputRef={fileInputRef}
          deletingDocId={deletingDocId}
          onUpload={handleUpload}
          onDelete={handleDeleteDoc}
          onUseDocumentContext={handleUseDocumentContext}
          generatingQuizForDocId={generatingQuizForDocId}
          onGenerateQuiz={handleGenerateQuiz}
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
