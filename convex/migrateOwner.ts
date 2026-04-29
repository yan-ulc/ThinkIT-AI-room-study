import { internalMutation } from "./_generated/server";

export const backfillOwners = internalMutation({
  handler: async (ctx) => {
    const rooms = await ctx.db.query("rooms").collect();
    for (const room of rooms) {
      if (!room.ownerId) {
        await ctx.db.patch(room._id, { ownerId: room.createdBy, status: "active" });
      }

      // Update the creator's membership to "owner"
      const membership = await ctx.db
        .query("roomMembers")
        .withIndex("by_room_and_user", (q) =>
          q.eq("roomId", room._id).eq("userId", room.createdBy),
        )
        .unique();

      if (membership && membership.role !== "owner") {
        await ctx.db.patch(membership._id, { role: "owner", isHidden: false });
      }
    }
  },
});
