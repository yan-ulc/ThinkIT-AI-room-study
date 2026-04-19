"use client";

import type { Id } from "@/convex/_generated/dataModel";
import { useEffect, useRef, useState } from "react";
import type { RoomMessage } from "./useRoomData";

export function useAiStreaming(messages: RoomMessage[] | undefined) {
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [streamingAiId, setStreamingAiId] = useState<Id<"messages"> | null>(
    null,
  );
  const [streamingAiText, setStreamingAiText] = useState("");
  const [pendingAiAfterMessageId, setPendingAiAfterMessageId] =
    useState<Id<"messages"> | null>(null);

  const aiAnimationTimeoutRef = useRef<number | null>(null);
  const aiDelayTimeoutRef = useRef<number | null>(null);
  const knownAiMessageIdsRef = useRef<Set<string>>(new Set());
  const hasHydratedKnownAiRef = useRef(false);

  useEffect(() => {
    return () => {
      if (aiAnimationTimeoutRef.current) {
        window.clearTimeout(aiAnimationTimeoutRef.current);
      }
      if (aiDelayTimeoutRef.current) {
        window.clearTimeout(aiDelayTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!messages || messages.length === 0) return;

    if (!hasHydratedKnownAiRef.current) {
      for (const msg of messages) {
        if (msg.type === "ai") {
          knownAiMessageIdsRef.current.add(String(msg._id));
        }
      }
      hasHydratedKnownAiRef.current = true;
      return;
    }

    if (!isAiThinking || !pendingAiAfterMessageId) {
      return;
    }

    const triggerIndex = messages.findIndex(
      (msg) => msg._id === pendingAiAfterMessageId,
    );

    if (triggerIndex === -1) {
      return;
    }

    const incomingAi = messages
      .slice(triggerIndex + 1)
      .find(
        (msg) =>
          msg.type === "ai" &&
          !knownAiMessageIdsRef.current.has(String(msg._id)),
      );

    if (!incomingAi) {
      return;
    }

    if (aiAnimationTimeoutRef.current) {
      window.clearTimeout(aiAnimationTimeoutRef.current);
    }
    if (aiDelayTimeoutRef.current) {
      window.clearTimeout(aiDelayTimeoutRef.current);
    }

    const words = incomingAi.content.split(/\s+/).filter(Boolean);
    const chunks = words.length > 40 ? 2 : 1;
    const delayMs = Math.min(1500, Math.max(500, words.length * 35));

    aiDelayTimeoutRef.current = window.setTimeout(() => {
      setIsAiThinking(false);
      setPendingAiAfterMessageId(null);
      setStreamingAiId(incomingAi._id);
      setStreamingAiText("");

      knownAiMessageIdsRef.current.add(String(incomingAi._id));

      let index = 0;
      const step = () => {
        index = Math.min(words.length, index + chunks);
        const nextText = words.slice(0, index).join(" ");
        setStreamingAiText(nextText);

        if (index < words.length) {
          aiAnimationTimeoutRef.current = window.setTimeout(step, 35);
          return;
        }

        setStreamingAiId(null);
        setStreamingAiText("");
      };

      step();
    }, delayMs);
  }, [messages, isAiThinking, pendingAiAfterMessageId]);

  useEffect(() => {
    if (!messages || messages.length === 0 || !isAiThinking) return;

    if (!pendingAiAfterMessageId) {
      return;
    }

    const latest = messages[messages.length - 1];
    if (
      latest.type === "ai" &&
      knownAiMessageIdsRef.current.has(String(latest._id))
    ) {
      setIsAiThinking(false);
      setPendingAiAfterMessageId(null);
    }
  }, [messages, isAiThinking, pendingAiAfterMessageId]);

  const onUserMessageSent = (
    isAiMentioned: boolean,
    userMessageId: Id<"messages">,
  ) => {
    if (!isAiMentioned) return;
    setIsAiThinking(true);
    setPendingAiAfterMessageId(userMessageId);
  };

  const getDisplayedMessageContent = (msg: {
    _id: Id<"messages">;
    content: string;
    type: string;
  }) => {
    if (msg.type !== "ai") return msg.content;
    if (streamingAiId === msg._id) return streamingAiText;
    return msg.content;
  };

  const shouldHidePendingAiMessage = (msg: {
    _id: Id<"messages">;
    type: string;
  }) => {
    if (msg.type !== "ai") return false;
    if (!isAiThinking) return false;
    if (streamingAiId === msg._id) return false;
    return !knownAiMessageIdsRef.current.has(String(msg._id));
  };

  return {
    isAiThinking,
    streamingAiId,
    onUserMessageSent,
    getDisplayedMessageContent,
    shouldHidePendingAiMessage,
  };
}
