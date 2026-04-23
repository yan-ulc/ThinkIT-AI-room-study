"use client";

import type { Id } from "@/convex/_generated/dataModel";
import { CornerUpLeft, Reply } from "lucide-react";
import type { RoomMessage } from "../../hooks/useRoomData";
import { MessageContent } from "./MessageContent";

type MessageItemProps = {
  msg: RoomMessage;
  prevMsg: RoomMessage | undefined;
  streamingAiId: Id<"messages"> | null;
  displayedContent: string;
  onReply?: (msg: RoomMessage) => void;
};

export function MessageItem({
  msg,
  prevMsg,
  streamingAiId,
  displayedContent,
  onReply,
}: MessageItemProps) {
  const isSameSender =
    prevMsg && prevMsg.senderId === msg.senderId && msg.type !== "system";
  const isLongGap =
    prevMsg && msg._creationTime - prevMsg._creationTime > 300000;
  const showHeader = !isSameSender || isLongGap;
  const normalizedReply = (msg.replyToContent || "")
    .replace(/\s+/g, " ")
    .trim();
  const replySnippet =
    normalizedReply.length > 90
      ? `${normalizedReply.slice(0, 90).trim()}…`
      : normalizedReply;

  const isAi = msg.type === "ai";
  const isMine = msg.isMine;

  return (
    <div className={`flex flex-col ${showHeader ? "mt-7" : "mt-0.5"}`}>
      {/* Reply context ribbon */}
      {msg.replyToId && (
        <div
          className={`mb-1.5 flex items-center gap-1.5 opacity-50 transition-opacity hover:opacity-75 ${
            isMine ? "mr-10 flex-row-reverse" : "ml-10"
          }`}
        >
          <CornerUpLeft size={11} className="shrink-0 text-text-3" />
          <span className="text-[11px] italic text-text-3 leading-snug truncate max-w-xs">
            {replySnippet
              ? `${msg.replyToSenderName || "message"}: ${replySnippet}`
              : msg.replyToSenderName || "message"}
          </span>
        </div>
      )}

      {/* Sender header */}
      {showHeader && (
        <div
          className={`mb-2 flex items-center gap-2.5 ${isMine ? "flex-row-reverse" : "flex-row"}`}
        >
          {/* Avatar */}
          <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full border border-border bg-muted shadow-sm">
            {msg.senderImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={msg.senderImage}
                alt={msg.senderName || "User avatar"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[9px] font-bold text-text-3">
                {isAi
                  ? "AI"
                  : (msg.senderUsername ||
                      msg.senderName ||
                      "U")[0].toUpperCase()}
              </div>
            )}
          </div>

          <div
            className={`flex items-baseline gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
          >
            <span className="text-[12px] font-semibold text-text leading-none">
              {isAi ? "ThinkIT AI" : msg.senderUsername || msg.senderName}
            </span>
            <span className="text-[10px] text-text-3 leading-none">
              {new Date(msg._creationTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      )}

      {/* Message bubble row */}
      <div
        className={`flex w-full items-end gap-1 ${isMine ? "flex-row-reverse" : "flex-row"}`}
      >
        {/* Spacer for avatar column alignment */}
        <div className="w-7 shrink-0" />

        <div
          className={`group relative flex max-w-[72%] items-end gap-2 ${isMine ? "flex-row" : "flex-row-reverse"}`}
        >
          {/* Reply button */}
          <button
            onClick={() => onReply?.(msg)}
            className="mb-1 shrink-0 rounded-full border border-border bg-surface p-1 text-text-3 opacity-0 shadow-sm transition-all hover:bg-muted hover:text-text group-hover:opacity-100"
            type="button"
            title="Reply"
          >
            <Reply size={12} />
          </button>

          {/* Bubble */}
          <div
            className={`relative w-full rounded-2xl border px-4 py-3 text-[14px] shadow-sm leading-relaxed transition-colors ${
              isAi
                ? "rounded-tl-sm border-border bg-primary text-primary-foreground"
                : isMine
                  ? "rounded-tr-sm border-primary/20 bg-secondary-foreground text-text " //aslinya text-text
                  : "rounded-tl-sm border-primary/20 bg-primary text-primary-foreground"
            }`}
          >
            <MessageContent messageContent={displayedContent} isAi={isAi} />

            {/* Streaming cursor */}
            {isAi && streamingAiId === msg._id && (
              <span className="ml-0.5 inline-block h-3.5 w-2px animate-pulse rounded-full bg-current align-middle opacity-60" />
            )}

            {/* Timestamp for grouped messages (no header) */}
            {!showHeader && (
              <span
                className={`mt-1 block text-[10px] font-medium leading-none ${
                  isMine ? "text-right text-text-3" : "text-left text-slate-400"
                } opacity-0 group-hover:opacity-60 transition-opacity`}
              >
                {new Date(msg._creationTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
