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

// Best-effort cleanup for uploads that were never attached to a document
// (abandoned dialogs, failed sibling uploads, failed entity creation).
// Callers must not pass IDs that are referenced by a vehicle or blog —
// use vehicles.removeImage / blogs.removeImage for those.
export const deleteFiles = mutation({
  args: { storageIds: v.array(v.id("_storage")) },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    for (const storageId of args.storageIds) {
      try {
        await ctx.storage.delete(storageId);
      } catch {
        // Already deleted or never finished uploading — nothing to clean up
      }
    }
    return null;
  },
});
