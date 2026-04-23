"use client";

import type { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { useAiStreaming } from "../../hooks/useAiStreaming";
import type { DocumentContext, RoomMessage } from "../../hooks/useRoomData";

type SendMessageFn = (args: {
  roomId: Id<"rooms">;
  content: string;
  replyToId?: Id<"messages">;
  selectionId?: Id<"documentSelections">;
}) => Promise<Id<"messages">>;

export function useChatLogic(
  roomId: Id<"rooms">,
  messages: RoomMessage[] | undefined,
  sendMessage: SendMessageFn,
  selectionContext: DocumentContext,
  onClearSelectionContext: () => void,
) {
  const [replyingTo, setReplyingTo] = useState<RoomMessage | null>(null);

  const {
    isAiThinking,
    streamingAiId,
    onUserMessageSent,
    getDisplayedMessageContent,
    shouldHidePendingAiMessage,
  } = useAiStreaming(messages);

  const handleSend = async (inputText: string) => {
    const trimmedContent = inputText.trim();
    if (!trimmedContent) return;

    let finalContent = trimmedContent;
    let replyToId: Id<"messages"> | undefined = replyingTo?._id;
    let selectionId: Id<"documentSelections"> | undefined;

    if (selectionContext) {
      const safeSelection = selectionContext.selectedText
        .replace(/\s+/g, " ")
        .trim()
        .replace(/"/g, "'");
      finalContent = `📄 ${selectionContext.docName}\n\n"${safeSelection}"\n\n@ai ${trimmedContent}`;
      replyToId = undefined;
      selectionId = selectionContext.selectionId;
    }

    const isAiMentioned = finalContent.toLowerCase().includes("@ai");
    const userMessageId = await sendMessage({
      roomId,
      content: finalContent,
      replyToId,
      selectionId,
    });

    onUserMessageSent(isAiMentioned, userMessageId);
    setReplyingTo(null);
    if (selectionContext) {
      onClearSelectionContext();
    }
  };

  const handleReplyFromMessage = (message: RoomMessage) => {
    if (message.type === "system") return;
    setReplyingTo(message);
  };

  return {
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
