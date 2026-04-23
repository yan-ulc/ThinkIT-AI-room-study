"use client";

import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export type RoomMessage = {
  _id: Id<"messages">;
  _creationTime: number;
  senderId: Id<"users"> | "ai" | "system" | null;
  content: string;
  type: "text" | "ai" | "system";
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
  role: "admin" | "member";
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

  const [rightTab, setRightTab] = useState<"documents" | "members">(
    "documents",
  );
  const [deletingDocId, setDeletingDocId] = useState<Id<"documents"> | null>(
    null,
  );
  const [documentContext, setDocumentContext] = useState<DocumentContext>(null);

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

  useEffect(() => {
    if (!roomId || messages === undefined) return;
    void markRoomRead({ roomId });
  }, [roomId, messages, markRoomRead]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const postUrl = await generateUploadUrl();

      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      await saveDoc({
        roomId,
        storageId,
        name: file.name,
      });

      e.target.value = "";
      alert("Upload sukses, Ngab!");
    } catch (err) {
      console.error(err);
      alert("Gagal upload!");
    }
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
    handleUpload,
    handleDeleteDoc,
    handleUseDocumentContext,
    clearDocumentContext,
    cancelDocumentContext,
  };
}
