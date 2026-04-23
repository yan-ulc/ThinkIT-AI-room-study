import { mutation, query } from "./_generated/server";

export const storeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Panggil storeUser tanpa auth yang valid, kocak!");
    }

    // Cari apakah user sudah ada di database kita
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    // Mapping data dari Clerk ke Schema kita
    const userData = {
      clerkId: identity.subject,
      username:
        identity.nickname ??
        identity.email?.split("@")[0] ??
        "user_" + identity.subject.slice(-4),
      displayName: identity.name ?? "Anonymous",
      imageUrl: identity.pictureUrl,
    };

    if (user !== null) {
      // Jika user sudah ada, update datanya kalau ada yang berubah
      if (
        user.username !== userData.username ||
        user.displayName !== userData.displayName ||
        user.imageUrl !== userData.imageUrl
      ) {
        await ctx.db.patch(user._id, userData);
      }
      return user._id;
    }

    // Jika user baru, kita insert
    return await ctx.db.insert("users", userData);
  },
});

// Helper query untuk dapetin data user saat ini
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});
