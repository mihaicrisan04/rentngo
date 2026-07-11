import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireAdmin } from "./users";

// Generate a short-lived URL the admin client POSTs a file to directly,
// bypassing Convex function argument size limits. The POST response
// returns the storage ID, which is then persisted via narrow mutations
// (vehicles.addImages, blogs.create/update).
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});
