"use client";

import type { Id } from "@/convex/_generated/dataModel";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import type { DocumentContext, RoomMessage } from "../../hooks/useRoomData";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";
import { useChatLogic } from "./useChatLogic";

type ChatSectionProps = {
  roomId: Id<"rooms">;
  roomName: string;
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
};

export function ChatSection({
  roomId,
  roomName,
  messages,
  sendMessage,
  selectionContext,
  onClearSelectionContext,
  onCancelSelectionContext,
}: ChatSectionProps) {
  const {
    content,
    setContent,
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
    <section className="flex min-h-0 flex-1 flex-col border-r border-border bg-surface">
      <ChatHeader roomName={roomName} />

      <MessageList
        messages={messages}
        isAiThinking={isAiThinking}
        streamingAiId={streamingAiId}
        getDisplayedMessageContent={getDisplayedMessageContent}
        shouldHidePendingAiMessage={shouldHidePendingAiMessage}
        onReply={handleReplyFromMessage}
        scrollRef={scrollRef}
        onScroll={handleScroll}
      />

      <ChatInput
        content={content}
        setContent={setContent}
        onSubmit={handleSend}
        roomName={roomName}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        selectionContext={selectionContext}
        onClearContext={onCancelSelectionContext}
      />
    </section>
  );
}