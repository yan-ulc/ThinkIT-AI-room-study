"use client";

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
    handleUpload,
    handleDeleteDoc,
  } = useRoomData();

  if (!room || messages === undefined) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <ChatSection
        roomId={roomId}
        roomName={room.name}
        messages={messages}
        sendMessage={sendMessage}
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
      />
    </div>
  );
}
