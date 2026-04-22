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
      className="min-h-0 flex-1 overflow-y-auto bg-surface2/60 no-scrollbar"
    >
      {/* Comfortable reading container — not full-width */}
      <div className="mx-auto w-full max-w-3xl px-6 py-6 space-y-0.5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <div className="w-10 h-10 rounded-full border border-border bg-surface flex items-center justify-center">
              <span className="text-lg">💬</span>
            </div>
            <p className="text-[13px] text-text-3 max-w-xs leading-relaxed">
              This is the start of the discussion. Ask a question or share a thought.
            </p>
          </div>
        )}

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

        {isAiThinking && (
          <div className="pt-2">
            <ThinkingIndicator />
          </div>
        )}

        {/* Bottom breathing room */}
        <div className="h-4" />
      </div>
    </div>
  );
}