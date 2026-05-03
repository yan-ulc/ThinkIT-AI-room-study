"use client";

export function ThinkingIndicator() {
  return (
    <div className="message-enter flex items-end gap-2.5">
      {/* AI avatar */}
      <div className="relative h-7 w-7 shrink-0">
        <div className="h-7 w-7 overflow-hidden rounded-full border border-border/80 bg-muted shadow-sm">
          <div className="bg-linear-to-br from-surface-2 to-surface-3 flex h-full w-full items-center justify-center text-[9px] font-bold text-text-3">
            AI
          </div>
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-[1.5px] border-background bg-primary shadow-sm" />
      </div>

      {/* Dots */}
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md bg-muted px-4 py-3 border border-border/50 shadow-sm">
        <span className="dot-bounce h-1.5 w-1.5 rounded-full bg-foreground/40" />
        <span className="dot-bounce h-1.5 w-1.5 rounded-full bg-foreground/40" />
        <span className="dot-bounce h-1.5 w-1.5 rounded-full bg-foreground/40" />
      </div>
    </div>
  );
}
