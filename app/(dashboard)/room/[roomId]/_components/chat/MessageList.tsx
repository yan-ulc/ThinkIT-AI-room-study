"use client";

import type { Id } from "@/convex/_generated/dataModel";
import type { RoomMessage } from "../../hooks/useRoomData";
import { MessageItem } from "./MessageItem";
import { ThinkingIndicator } from "./ThinkingIndicator";

type MessageListProps = {
  messages: RoomMessage[];
  isAiThinking: boolean;
  streamingAiId: Id<"messages"> | null;
  getDisplayedMessageContent: (msg: {
    _id: Id<"messages">;
    content: string;
    type: string;
  }) => string;
  shouldHidePendingAiMessage: (msg: {
    _id: Id<"messages">;
    type: string;
  }) => boolean;
  onReply: (msg: RoomMessage) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
};

export function MessageList({
  messages,
  isAiThinking,
  streamingAiId,
  getDisplayedMessageContent,
  shouldHidePendingAiMessage,
  onReply,
  scrollRef,
  onScroll,
}: MessageListProps) {
  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className="min-h-0 flex-1 overflow-y-auto p-6 space-y-1 bg-slate-50/30 no-scrollbar"
    >
      {messages.map((msg, index) => {
        const prevMsg = messages[index - 1];

        return shouldHidePendingAiMessage(msg) ? null : (
          <MessageItem
            key={msg._id}
            msg={msg}
            prevMsg={prevMsg}
            streamingAiId={streamingAiId}
            displayedContent={getDisplayedMessageContent(msg)}
            onReply={onReply}
          />
        );
      })}

      {isAiThinking && <ThinkingIndicator />}
    </div>
  );
}
