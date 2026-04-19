"use client";

import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";

export type RoomMessage = {
  _id: Id<"messages">;
  _creationTime: number;
  senderId: Id<"users"> | "ai" | "system" | null;
  content: string;
  type: "text" | "ai" | "system";
  replyToId?: Id<"messages">;
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

export function useRoomData() {
  const params = useParams();
  const roomId = params.roomId as Id<"rooms">;

  const [rightTab, setRightTab] = useState<"documents" | "members">(
    "documents",
  );
  const [deletingDocId, setDeletingDocId] = useState<Id<"documents"> | null>(
    null,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const room = useQuery(api.rooms.getById, { roomId });
  const members = useQuery(api.rooms.getMembers, { roomId }) as
    | RoomMember[]
    | undefined;
  const messages = useQuery(api.messages.getMessages, { roomId }) as
    | RoomMessage[]
    | undefined;
  const docs = useQuery(api.documents.list, { roomId }) as
    | Doc<"documents">[]
    | undefined;

  const sendMessage = useMutation(api.messages.send);
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const saveDoc = useMutation(api.documents.create);
  const removeDoc = useMutation(api.documents.remove);

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
      await removeDoc({ id, storageId });
    } catch (err) {
      console.error(err);
      alert("Failed to delete document.");
    } finally {
      setDeletingDocId(null);
    }
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
    handleUpload,
    handleDeleteDoc,
  };
}
