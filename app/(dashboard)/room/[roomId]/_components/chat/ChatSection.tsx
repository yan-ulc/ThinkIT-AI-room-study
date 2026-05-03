"use client";

import type { Id } from "@/convex/_generated/dataModel";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import type {
  DocumentContext,
  RoomMember,
  RoomMessage,
} from "../../hooks/useRoomData";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";
import { useChatLogic } from "./useChatLogic";

type ChatSectionProps = {
  roomId: Id<"rooms">;
  roomName: string;
  roomStatus?: "active" | "closed";
  memberStatus?: "active" | "removed";
  members?: RoomMember[];
  messages: RoomMessage[];
  sendMessage: (args: {
    roomId: Id<"rooms">;
    content: string;
    replyToId?: Id<"messages">;
    selectionId?: Id<"documentSelections">;
  }) => Promise<Id<"messages">>;
  selectionContext: DocumentContext;
  onClearSelectionContext: () => void;
  onCancelSelectionContext: () => void;
  isGeneratingQuiz?: boolean;
  onToggleRightPanel?: () => void;
};

export function ChatSection({
  roomId,
  roomName,
  roomStatus,
  memberStatus,
  members,
  messages,
  sendMessage,
  selectionContext,
  onClearSelectionContext,
  onCancelSelectionContext,
  isGeneratingQuiz,
  onToggleRightPanel,
}: ChatSectionProps) {
  const {
    replyingTo,
    setReplyingTo,
    handleSend,
    handleReplyFromMessage,
    isAiThinking,
    streamingAiId,
    getDisplayedMessageContent,
    shouldHidePendingAiMessage,
  } = useChatLogic(
    roomId,
    messages,
    sendMessage,
    selectionContext,
    onClearSelectionContext,
  );

  const { scrollRef, handleScroll } = useAutoScroll(messages, isAiThinking);

  return (
    <section className="relative flex min-h-0 flex-1 flex-col border-r border-border/70 bg-transparent">
      <ChatHeader roomName={roomName} members={members} onToggleRightPanel={onToggleRightPanel} />

      <MessageList
        messages={messages}
        isAiThinking={isAiThinking || !!isGeneratingQuiz}
        streamingAiId={streamingAiId}
        getDisplayedMessageContent={getDisplayedMessageContent}
        shouldHidePendingAiMessage={shouldHidePendingAiMessage}
        onReply={handleReplyFromMessage}
        scrollRef={scrollRef}
        onScroll={handleScroll}
      />

      <ChatInput
        onSubmitText={handleSend}
        roomName={roomName}
        roomStatus={roomStatus}
        memberStatus={memberStatus}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        selectionContext={selectionContext}
        onClearContext={onCancelSelectionContext}
      />
    </section>
  );
}
