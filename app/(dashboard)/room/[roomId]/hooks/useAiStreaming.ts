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

  const animationFrameRef = useRef<number | null>(null);
  const delayTimeoutRef = useRef<number | null>(null);
  const knownAiMessageIdsRef = useRef<Set<string>>(new Set());
  const hasHydratedKnownAiRef = useRef(false);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (delayTimeoutRef.current) {
        window.clearTimeout(delayTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!messages || messages.length === 0) return;

    // Hydrate known AI messages (biar ga ke-stream ulang)
    if (!hasHydratedKnownAiRef.current) {
      for (const msg of messages) {
        if (msg.type === "ai") {
          knownAiMessageIdsRef.current.add(String(msg._id));
        }
      }
      hasHydratedKnownAiRef.current = true;
      return;
    }

    if (!isAiThinking || !pendingAiAfterMessageId) return;

    const triggerIndex = messages.findIndex(
      (msg) => msg._id === pendingAiAfterMessageId,
    );

    if (triggerIndex === -1) return;

    const incomingAi = messages
      .slice(triggerIndex + 1)
      .find(
        (msg) =>
          msg.type === "ai" &&
          !knownAiMessageIdsRef.current.has(String(msg._id)),
      );

    if (!incomingAi) return;

    // Clear previous animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (delayTimeoutRef.current) {
      window.clearTimeout(delayTimeoutRef.current);
    }

    const text = incomingAi.content;

    // ⚡ ultra fast start (hampir instant)
    const delayMs = Math.min(250, text.length * 5);

    delayTimeoutRef.current = window.setTimeout(() => {
      setIsAiThinking(false);
      setPendingAiAfterMessageId(null);
      setStreamingAiId(incomingAi._id);
      setStreamingAiText("");

      knownAiMessageIdsRef.current.add(String(incomingAi._id));

      // 🚀 kalau kepanjangan, skip animasi (biar ga nyiksa user)
      if (text.length > 800) {
        setStreamingAiText(text);
        setStreamingAiId(null);
        return;
      }

      let index = 0;
      const totalLength = text.length;

      const step = () => {
        const progress = index / totalLength;

        // ⚡ dynamic speed (cepat di awal, smooth di akhir)
        const dynamicSpeed = 2 + 6 * (1 - progress);

        index += dynamicSpeed;

        const nextText = text.slice(0, Math.floor(index));
        setStreamingAiText(nextText);

        if (index < totalLength) {
          animationFrameRef.current = requestAnimationFrame(step);
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
    if (!pendingAiAfterMessageId) return;

    const latest = messages[messages.length - 1];

    if (
      latest.type === "ai" &&
      knownAiMessageIdsRef.current.has(String(latest._id))
    ) {
      const timeoutId = window.setTimeout(() => {
        setIsAiThinking(false);
        setPendingAiAfterMessageId(null);
      }, 0);

      return () => {
        window.clearTimeout(timeoutId);
      };
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
