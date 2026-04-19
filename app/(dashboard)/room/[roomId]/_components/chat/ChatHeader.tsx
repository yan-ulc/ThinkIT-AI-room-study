"use client";

type ChatHeaderProps = {
  roomName: string;
};

export function ChatHeader({ roomName }: ChatHeaderProps) {
  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-white shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-accent" />
        <h3 className="font-semibold text-sm">{roomName}</h3>
      </div>
    </header>
  );
}
