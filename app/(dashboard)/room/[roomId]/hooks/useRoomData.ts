"use client";

import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export type RoomMessage = {
  _id: Id<"messages">;
  _creationTime: number;
  senderId: Id<"users"> | "ai" | "system" | null;
  content: string;
  type: "text" | "ai" | "system" | "quiz";
  metadata?: {
    quizId?: Id<"quizzes">;
    quizTitle?: string;
  };
  replyToId?: Id<"messages">;
  selectionId?: Id<"documentSelections">;
  selectionText?: string;
  replyToSenderName?: string;
  replyToContent?: string;
  senderName?: string;
  senderUsername?: string;
  senderImage?: string;
  isMine: boolean;
};

export type RoomMember = {
  _id: Id<"users">;
  displayName: string;
  imageUrl?: string;
  role: "owner" | "admin" | "member";
  status: "active" | "removed";
  isMe: boolean;
};

export type RoomDocument = Doc<"documents"> & {
  previewContent?: string;
};

export type DocumentContext = {
  type: "document";
  roomId: Id<"rooms">;
  docId: Id<"documents">;
  selectionId: Id<"documentSelections">;
  docName: string;
  selectedText: string;
} | null;

export function useRoomData() {
  const params = useParams();
  const roomId = params.roomId as Id<"rooms">;

  const [rightTab, setRightTab] = useState<"documents" | "members" | "quizzes">(
    "documents",
  );
  const [isUploading, setIsUploading] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<Id<"documents"> | null>(
    null,
  );
  const [documentContext, setDocumentContext] = useState<DocumentContext>(null);
  // Persists across DocumentPreview unmounts — this is the fix for quiz generation state
  const [generatingQuizForDocId, setGeneratingQuizForDocId] =
    useState<Id<"documents"> | null>(null);
  const [lastGeneratedQuiz, setLastGeneratedQuiz] = useState<{
    quizId: Id<"quizzes">;
    title: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const room = useQuery(api.rooms.getById, { roomId });
  const members = useQuery(api.rooms.getMembers, { roomId }) as
    | RoomMember[]
    | undefined;
  const messages = useQuery(api.messages.getMessages, { roomId }) as
    | RoomMessage[]
    | undefined;
  const docs = useQuery(api.documents.list, { roomId }) as
    | RoomDocument[]
    | undefined;

  const sendMessage = useMutation(api.messages.send);
  const markRoomRead = useMutation(api.rooms.markRoomRead);
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const saveDoc = useMutation(api.documents.create);
  const removeDoc = useMutation(api.documents.remove);
  const cancelSelection = useMutation(api.documents.cancelSelection);
  const generateQuizAction = useAction(api.quiz.generate);

  const handleGenerateQuiz = useCallback(
    async (
      documentId: Id<"documents">,
      title?: string,
      questionCount?: number,
    ): Promise<boolean> => {
      if (generatingQuizForDocId) return false; // Block concurrent generation
      setGeneratingQuizForDocId(documentId);
      let timeoutId: number | undefined;
      try {
        const timeoutMs = 60_000;
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = window.setTimeout(() => {
            reject(new Error("Quiz generation timed out. Please try again."));
          }, timeoutMs);
        });

        const result = await Promise.race([
          generateQuizAction({
            documentId,
            title,
            questionCount,
          }),
          timeoutPromise,
        ]);
        // Store result so we can show the success dialog
        setLastGeneratedQuiz({ quizId: result.quizId, title: result.title });
        return true;
      } catch (e) {
        console.error(e);
        const message =
          e instanceof Error ? e.message : "Failed to generate quiz.";
        alert(message);
        return false;
      } finally {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }
        setGeneratingQuizForDocId(null);
      }
    },
    [generatingQuizForDocId, generateQuizAction],
  );

  useEffect(() => {
    // room being non-null means auth passed and user is a member.
    // Only then is it safe to call markRoomRead.
    if (!roomId || !room || messages === undefined) return;
    void markRoomRead({ roomId });
  }, [roomId, room, messages, markRoomRead]);

  const uploadFile = async (file: File) => {
    setIsUploading(true);

    const promise = (async () => {
      const postUrl = await generateUploadUrl();

      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      
      if (!result.ok) throw new Error("Upload failed");
      
      const { storageId } = await result.json();

      await saveDoc({
        roomId,
        storageId,
        name: file.name,
      });
    })();

    toast.promise(promise, {
      loading: `Uploading ${file.name}...`,
      success: "File successfully uploaded!",
      error: "Failed to upload file.",
    });

    try {
      await promise;
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    e.target.value = "";
  };

  const handleUploadFiles = async (files: FileList) => {
    const file = files[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleDeleteDoc = async (
    id: Id<"documents">,
    storageId: Id<"_storage">,
    name: string,
  ) => {
    const ok = window.confirm(`Delete "${name}"? This cannot be undone.`);
    if (!ok) return;

    try {
      setDeletingDocId(id);
      await removeDoc({ id });
    } catch (err) {
      console.error(err);
      alert("Failed to delete document.");
    } finally {
      setDeletingDocId(null);
    }
  };

  const handleUseDocumentContext = (context: NonNullable<DocumentContext>) => {
    if (documentContext?.selectionId) {
      void cancelSelection({ selectionId: documentContext.selectionId });
    }
    setDocumentContext(context);
  };

  const clearDocumentContext = () => {
    setDocumentContext(null);
  };

  const cancelDocumentContext = () => {
    if (documentContext?.selectionId) {
      void cancelSelection({ selectionId: documentContext.selectionId });
    }
    setDocumentContext(null);
  };

  return {
    roomId,
    room,
    members,
    messages,
    docs,
    sendMessage,
    rightTab,
    setRightTab,
    fileInputRef,
    deletingDocId,
    documentContext,
    generatingQuizForDocId,
    lastGeneratedQuiz,
    clearLastGeneratedQuiz: () => setLastGeneratedQuiz(null),
    handleGenerateQuiz,
    handleUpload,
    handleUploadFiles,
    handleDeleteDoc,
    handleUseDocumentContext,
    clearDocumentContext,
    cancelDocumentContext,
    isUploading,
  };
}
