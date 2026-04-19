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
      ? `${normalizedReply.slice(0, 90).trim()}...`
      : normalizedReply;

  return (
    <div className={`flex flex-col ${showHeader ? "mt-6" : "mt-1"}`}>
      {msg.replyToId && (
        <div
          className={`mb-1 flex  items-center gap-1 opacity-60 ${msg.isMine ? "mr-10 flex-row-reverse" : "ml-10"}`}
        >
          <CornerUpLeft size={12} className="text-slate-400" />
          <span className="text-[10px] italic text-slate-500">
            {replySnippet
              ? `Replying to ${msg.replyToSenderName || "message"}: ${replySnippet}`
              : `Replying to ${msg.replyToSenderName || "message"}`}
          </span>
        </div>
      )}

      {showHeader && (
        <div
          className={`mb-1 flex items-center gap-2 ${msg.isMine ? "flex-row-reverse" : "flex-row"}`}
        >
          <div className="h-8 shrink-0 w-8 overflow-hidden rounded-full border border-border bg-slate-100">
            {msg.senderImage ? (
              <img
                src={msg.senderImage}
                alt={msg.senderName || "User avatar"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-slate-500">
                {(msg.senderUsername || msg.senderName || "U")[0]}
              </div>
            )}
          </div>
          <span className="text-[13px] font-bold text-slate-700">
            {msg.type === "ai"
              ? "ThinkIT AI"
              : msg.senderUsername || msg.senderName}
          </span>
        </div>
      )}

      <div
        className={`flex w-full items-center  ${msg.isMine ? "flex-row-reverse" : "flex-row"}`}
      >
        {!showHeader && <div className="h-8" />}

        <div
          className={`group relative flex max-w-[75%] items-center gap-2 ${msg.isMine ? "flex-row" : "flex-row-reverse"}`}
        >
          <button
            onClick={() => onReply?.(msg)}
            className="shrink-0 rounded-full border border-border bg-white p-1.5 text-slate-400 opacity-0 shadow-sm transition-all hover:bg-slate-100 group-hover:opacity-100"
            type="button"
          >
            <Reply size={14} />
          </button>

          <div
            className={`relative min-w-20 w-full rounded-2xl border p-3 text-[14px] shadow-sm transition-all ${
              msg.type === "ai"
                ? "border-ai-border bg-white text-slate-800"
                : msg.isMine
                  ? "rounded-tr-none border-primary-light bg-primary-muted text-text"
                  : "rounded-tl-none border-border bg-white text-slate-800"
            }`}
          >
            <div className="wrap-break-word pb-3 leading-relaxed">
              <MessageContent
                messageContent={displayedContent}
                isAi={msg.type === "ai"}
              />
              {msg.type === "ai" && streamingAiId === msg._id && (
                <span className="ml-1 inline-block h-3 w-px animate-pulse align-middle bg-current" />
              )}
            </div>

            <span
              className={`absolute bottom-1 right-2 text-[9px] font-medium opacity-70 ${msg.isMine ? "text-text-3" : "text-slate-400"}`}
            >
              {new Date(msg._creationTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div> 
    </div>
  );
}
