"use client";

export function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl w-fit animate-pulse mt-4">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
      </div>
      <span className="text-xs font-semibold text-primary">
        ThinkIT is reading docs...
      </span>
    </div>
  );
}
