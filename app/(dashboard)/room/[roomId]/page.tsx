"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { FileText, Send } from "lucide-react";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as Id<"rooms">;
  const [content, setContent] = useState("");
  const [rightTab, setRightTab] = useState<"documents" | "members">(
    "documents",
  );

  const messages = useQuery(api.messages.getMessages, { roomId });
  const sendMessage = useMutation(api.messages.send);
  const room = useQuery(api.rooms.getById, { roomId });
  const members = useQuery(api.rooms.getMembers, { roomId });
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const saveDoc = useMutation(api.documents.create);
  const docs = useQuery(api.documents.list, { roomId });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await sendMessage({ roomId, content });
      setContent("");
    } catch (err) {
      console.error(err);
    }
  };

  const renderContent = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (!part.startsWith("@")) return part;

      const isAiMention = part.toLowerCase() === "@ai";
      return (
        <span
          key={index}
          className={`font-bold ${isAiMention ? "text-primary bg-primary-muted px-1 rounded" : "text-accent"}`}
        >
          {part}
        </span>
      );
    });
  };

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

  if (!room || messages === undefined)
    return <div className="p-10">Loading...</div>;

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* MIDDLE PANEL: CHAT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-white border-r border-border">
        {/* Chat Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <h3 className="font-semibold text-sm">{room.name}</h3>
          </div>
        </header>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`group flex flex-col gap-1 ${msg.isMine && msg.type !== "ai" ? "items-end" : "items-start"}`}
            >
              <div className="flex items-baseline gap-2">
                <span
                  className={`font-bold text-[13px] ${msg.type === "ai" ? "text-primary" : "text-text"}`}
                >
                  {msg.type === "ai"
                    ? "ThinkIT AI"
                    : String(msg.senderName || "Unknown")}
                  {msg.type === "ai" && (
                    <span className="ml-2 bg-primary text-white text-[9px] px-1.5 py-0.5 rounded">
                      AI
                    </span>
                  )}
                </span>
              </div>
              <div
                className={`p-3 rounded-2xl text-[14px] ${
                  msg.type === "ai"
                    ? "bg-ai-surface border border-ai-border text-primary font-medium shadow-sm"
                    : msg.isMine
                      ? "rounded-tr-none bg-primary-muted border border-primary-light text-text"
                      : "rounded-tl-none bg-white border border-border text-text"
                } max-w-[85%]`}
              >
                {renderContent(msg.content)}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white border-t border-border">
          <form
            onSubmit={handleSend}
            className="flex gap-2 max-w-4xl mx-auto bg-surface2 border border-border-strong p-2 rounded-xl focus-within:border-primary transition-all"
          >
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Message #${room.name}...`}
              className="flex-1 bg-transparent border-none outline-none px-2 text-sm text-text"
            />
            <Button
              type="submit"
              size="icon"
              className="bg-primary hover:bg-primary-light h-8 w-8 rounded-lg"
            >
              <Send size={14} />
            </Button>
          </form>
        </div>
      </div>

      {/* RIGHT PANEL: INFO/FILES (Step 4 Preview) */}
      <div className="w-70 shrink-0 bg-white flex flex-col lg:flex">
        <div className="flex border-b border-border">
          <button
            onClick={() => setRightTab("documents")}
            className={`flex-1 py-3 text-[13px] font-medium ${
              rightTab === "documents"
                ? "border-b-2 border-primary text-primary"
                : "text-text-2 hover:bg-slate-50"
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setRightTab("members")}
            className={`flex-1 py-3 text-[13px] font-medium ${
              rightTab === "members"
                ? "border-b-2 border-primary text-primary"
                : "text-text-2 hover:bg-slate-50"
            }`}
          >
            Members
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {rightTab === "documents" ? (
            <div className="p-4 space-y-4">
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleUpload}
                accept=".pdf,.txt,.doc,.docx"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full text-xs gap-2 border-primary text-primary hover:bg-primary-muted"
              >
                <FileText size={14} /> Upload Document
              </Button>

              <div className="space-y-2 mt-4">
                {docs === undefined ? (
                  <p className="text-[12px] text-text-3">
                    Loading documents...
                  </p>
                ) : docs.length === 0 ? (
                  <p className="text-[12px] text-text-3">
                    No documents yet. Upload one to see it here.
                  </p>
                ) : (
                  docs.map((doc) => (
                    <a
                      key={doc._id}
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 p-2 border rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <FileText size={16} className="text-primary" />
                      <span className="text-[12px] font-medium truncate">
                        {doc.name}
                      </span>
                    </a>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-border-strong bg-surface2 p-3">
                <p className="mb-2 text-[10px] font-bold uppercase text-text-3">
                  Invite Code
                </p>
                <div className="flex gap-2">
                  <code className="flex-1 truncate rounded border bg-white p-1.5 text-[11px]">
                    {roomId}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px]"
                    onClick={() => {
                      navigator.clipboard.writeText(String(roomId));
                      alert("ID Copied!");
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-text-3">
                  Members - {members?.length ?? 0}
                </p>

                {(members ?? []).map((m) => (
                  <div key={m._id} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary-light bg-primary-muted text-[10px] font-bold text-primary">
                      {m.displayName?.[0] ?? "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium">
                        {m.displayName}
                      </p>
                      <p className="text-[10px] capitalize text-text-3">
                        {m.role}
                      </p>
                    </div>
                    {m.role === "admin" ? (
                      <div
                        className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500"
                        title="Online"
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
