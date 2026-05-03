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
      className="no-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-transparent"
    >
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-7">
        <div className="mx-auto w-full max-w-2xl pb-2">
          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center select-none">
              <div
                className="
                  flex h-12 w-12 items-center justify-center rounded-2xl
                  bg-primary/10 border border-primary/20
                  shadow-[0_4px_20px_oklch(var(--primary)/0.15)]
                "
              >
                <span className="text-xl">💬</span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[13.5px] font-medium text-text-2">
                  Start the conversation
                </p>
                <p className="max-w-60 text-[12px] text-text-3 leading-relaxed">
                  Ask a question or share a thought to kick things off.
                </p>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-0">
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
          </div>

          {/* Thinking indicator */}
          {isAiThinking && (
            <div className="mt-5">
              <ThinkingIndicator />
            </div>
          )}

          {/* Bottom spacer */}
          <div className="h-6" />
        </div>
      </div>
    </div>
  );
}
