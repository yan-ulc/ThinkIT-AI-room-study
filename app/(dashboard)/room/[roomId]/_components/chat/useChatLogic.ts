"use client";

import type { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { useAiStreaming } from "../../hooks/useAiStreaming";
import type { RoomMessage } from "../../hooks/useRoomData";

type SendMessageFn = (args: {
  roomId: Id<"rooms">;
  content: string;
  replyToId?: Id<"messages">;
}) => Promise<Id<"messages">>;

export function useChatLogic(
  roomId: Id<"rooms">,
  messages: RoomMessage[] | undefined,
  sendMessage: SendMessageFn,
) {
  const [content, setContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<RoomMessage | null>(null);

  const {
    isAiThinking,
    streamingAiId,
    onUserMessageSent,
    getDisplayedMessageContent,
    shouldHidePendingAiMessage,
  } = useAiStreaming(messages);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const isAiMentioned = content.toLowerCase().includes("@ai");
    const isReplyingToAi = replyingTo?.type === "ai";
    const userMessageId = await sendMessage({
      roomId,
      content,
      replyToId: replyingTo?._id,
    });

    onUserMessageSent(isAiMentioned || isReplyingToAi, userMessageId);
    setContent("");
    setReplyingTo(null);
  };

  const handleReplyFromMessage = (message: RoomMessage) => {
    if (message.type === "system") return;
    setReplyingTo(message);
  };

  return {
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
  };
}
