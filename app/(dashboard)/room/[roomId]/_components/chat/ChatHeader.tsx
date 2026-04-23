"use client";

type ChatHeaderProps = {
  roomName: string;
};

export function ChatHeader({ roomName }: ChatHeaderProps) {
  return (
    <header className="h-14 shrink-0 flex items-center border-b border-border bg-surface px-6">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="absolute w-2 h-2 rounded-full bg-primary/30 animate-ping" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-[13px] font-semibold tracking-tight text-text leading-none">
            {roomName}
          </h3>
          <span className="text-[10px] text-text-3 mt-0.5 tracking-wide uppercase font-medium">
            Discussion Room
          </span>
        </div>
      </div>
    </header>
  );
}
