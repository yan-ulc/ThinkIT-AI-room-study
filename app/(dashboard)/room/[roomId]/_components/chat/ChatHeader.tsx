"use client";

type ChatHeaderProps = {
  roomName: string;
  members?: Array<{
    _id: string;
    displayName: string;
    imageUrl?: string;
  }>;
};

export function ChatHeader({ roomName, members = [] }: ChatHeaderProps) {
  const onlineMembers = members.slice(0, 3);
  const remainingCount = Math.max(0, members.length - onlineMembers.length);

  return (
    <header className="glass-panel shrink-0 border-b border-border/60 px-5 py-3.5 rounded-b-xl" >
     <div className="flex items-center justify-between">
  {/* LEFT */}
  <div className="flex items-center gap-3">
    <div className="flex flex-col gap-px">
      <h3 className="text-[13.5px] font-semibold tracking-tight text-text-1 leading-none">
        {roomName}
      </h3>
      <span className="text-[10px] uppercase tracking-widest font-medium text-text-3 leading-none mt-1">
        Discussion Room
      </span>
    </div>
  </div>

  {/* RIGHT */}
  <div className="flex items-center gap-3">
    {/* AVATAR */}
    <div className="flex -space-x-2">
      {onlineMembers.map((member) => (
        <div
          key={member._id}
          title={member.displayName}
          className="h-8 w-8 overflow-hidden rounded-full border border-border bg-muted shadow-sm"
        >
          {member.imageUrl ? (
            <img
              src={member.imageUrl}
              alt={member.displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-muted-foreground">
              {member.displayName[0]?.toUpperCase() ?? "U"}
            </div>
          )}
        </div>
      ))}
    </div>

  </div>
</div>
    </header>
  );
}
