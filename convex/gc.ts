import { v } from "convex/values";
import { internalMutation, MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const GRACE_MS = 24 * 60 * 60 * 1000;
const BATCH = 200;

async function collectReferencedStorageIds(
  ctx: MutationCtx,
): Promise<Set<string>> {
  const referenced = new Set<string>();

  const vehicles = await ctx.db.query("vehicles").collect();
  for (const vehicle of vehicles) {
    for (const imageId of vehicle.images ?? []) {
      referenced.add(imageId);
    }
    if (vehicle.mainImageId) {
      referenced.add(vehicle.mainImageId);
    }
  }

  const blogs = await ctx.db.query("blogs").collect();
  for (const blog of blogs) {
    if (blog.coverImage) {
      referenced.add(blog.coverImage);
    }
    for (const imageId of blog.images ?? []) {
      referenced.add(imageId);
    }
  }

  return referenced;
}

/**
 * Deletes _storage files not referenced by any vehicle or blog, skipping
 * files younger than GRACE_MS so in-progress admin uploads survive. Pages
 * through _storage in batches, rescheduling itself until done. With
 * dryRun: true it only logs what it would delete.
 */
export const sweepOrphanedFiles = internalMutation({
  args: {
    cursor: v.union(v.string(), v.null()),
    dryRun: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const referenced = await collectReferencedStorageIds(ctx);
    const page = await ctx.db.system
      .query("_storage")
      .paginate({ cursor: args.cursor, numItems: BATCH });

    const cutoff = Date.now() - GRACE_MS;
    let referencedSkipped = 0;
    let tooYoungSkipped = 0;
    const candidates: Id<"_storage">[] = [];

    for (const file of page.page) {
      if (referenced.has(file._id)) {
        referencedSkipped++;
      } else if (file._creationTime >= cutoff) {
        tooYoungSkipped++;
      } else {
        candidates.push(file._id);
      }
    }

    if (!args.dryRun) {
      for (const storageId of candidates) {
        try {
          await ctx.storage.delete(storageId);
        } catch {
          // Already deleted or never finished uploading — nothing to clean up
        }
      }
    }

    console.log("[gc] sweepOrphanedFiles batch", {
      scanned: page.page.length,
      referencedSkipped,
      tooYoungSkipped,
      [args.dryRun ? "wouldDelete" : "deleted"]: candidates.length,
      sampleCandidates: candidates.slice(0, 5),
    });

    if (!page.isDone) {
      await ctx.scheduler.runAfter(0, internal.gc.sweepOrphanedFiles, {
        cursor: page.continueCursor,
        dryRun: args.dryRun,
      });
    }
    return null;
  },
});
