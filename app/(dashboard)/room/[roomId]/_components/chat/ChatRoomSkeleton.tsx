/**
 * ChatRoomSkeleton
 * Full-layout shimmer skeleton shown while the room data loads.
 * Mirrors the real room layout: header, message bubbles, input bar, right panel.
 */
export function ChatRoomSkeleton() {
  return (
    <div className="chat-ambient relative flex flex-1 overflow-hidden">
      {/* ── Left: Chat column ── */}
      <section className="relative flex min-h-0 flex-1 flex-col border-r border-border/70">
        {/* Header skeleton */}
        <div className="flex h-14 items-center gap-3 border-b border-border/60 bg-card/80 px-5 backdrop-blur-sm">
          <div className="h-7 w-7 rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-36 rounded-md bg-muted animate-pulse" />
          {/* Avatar stack */}
          <div className="ml-auto flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-6 w-6 rounded-full bg-muted animate-pulse"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        </div>

        {/* Messages skeleton */}
        <div className="no-scrollbar flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-7">
            <div className="mx-auto w-full max-w-2xl space-y-5">
              {SKELETON_MESSAGES.map((msg, i) => (
                <SkeletonBubble
                  key={i}
                  align={msg.align}
                  widths={msg.widths}
                  delay={i * 60}
                  hasAvatar={msg.hasAvatar}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Input bar skeleton */}
        <div className="px-4 pb-4 pt-2">
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2.5 shadow-lg backdrop-blur-sm">
            <div className="h-4 flex-1 rounded-full bg-muted animate-pulse" />
            <div className="h-8 w-8 shrink-0 rounded-full bg-muted animate-pulse" />
          </div>
        </div>
      </section>

      {/* ── Right: Panel column ── */}
      <aside className="hidden w-[300px] shrink-0 flex-col border-l border-border/60 bg-card/50 md:flex">
        {/* Tab bar */}
        <div className="flex h-12 items-center gap-1 border-b border-border/60 px-3">
          {[80, 64, 72].map((w, i) => (
            <div
              key={i}
              className="h-7 rounded-lg bg-muted animate-pulse"
              style={{ width: w, animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
        {/* Panel content rows */}
        <div className="flex flex-col gap-3 p-4">
          {[100, 80, 90, 70, 95].map((w, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="h-8 w-8 shrink-0 rounded-xl bg-muted animate-pulse"
                style={{ animationDelay: `${i * 50}ms` }}
              />
              <div className="flex flex-1 flex-col gap-1.5">
                <div
                  className="h-3 rounded-md bg-muted animate-pulse"
                  style={{ width: `${w}%`, animationDelay: `${i * 50 + 20}ms` }}
                />
                <div
                  className="h-2.5 w-1/2 rounded-md bg-muted animate-pulse"
                  style={{ animationDelay: `${i * 50 + 40}ms` }}
                />
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

/* ── Helpers ── */

type BubbleConfig = {
  align: "left" | "right";
  widths: number[]; // % widths for each line
  hasAvatar: boolean;
};

const SKELETON_MESSAGES: BubbleConfig[] = [
  { align: "left",  widths: [75, 55],     hasAvatar: true  },
  { align: "right", widths: [60],         hasAvatar: false },
  { align: "left",  widths: [80, 65, 45], hasAvatar: true  },
  { align: "right", widths: [50, 70],     hasAvatar: false },
  { align: "left",  widths: [65],         hasAvatar: true  },
  { align: "right", widths: [40],         hasAvatar: false },
  { align: "left",  widths: [70, 50],     hasAvatar: true  },
];

function SkeletonBubble({
  align,
  widths,
  delay,
  hasAvatar,
}: BubbleConfig & { delay: number }) {
  const isRight = align === "right";

  return (
    <div
      className={`flex items-end gap-2.5 ${isRight ? "flex-row-reverse" : ""}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Avatar */}
      {hasAvatar ? (
        <div
          className="h-7 w-7 shrink-0 rounded-full bg-muted animate-pulse self-end"
          style={{ animationDelay: `${delay}ms` }}
        />
      ) : (
        <div className="w-7 shrink-0" />
      )}

      {/* Bubble */}
      <div
        className={`flex flex-col gap-1.5 ${isRight ? "items-end" : "items-start"}`}
        style={{ maxWidth: "72%" }}
      >
        {widths.map((w, i) => (
          <div
            key={i}
            className={`h-9 rounded-2xl bg-muted animate-pulse ${
              isRight ? "rounded-br-sm" : "rounded-bl-sm"
            }`}
            style={{
              width: `${w}%`,
              minWidth: 80,
              animationDelay: `${delay + i * 40}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
