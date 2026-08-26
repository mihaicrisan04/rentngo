import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";

const PAGE_SIZE = 100;

/**
 * One-off backfill: pages through the Clerk Backend API and upserts every
 * Clerk user into the Convex users table via internal.users.upsertFromClerk.
 * Idempotent — existing rows are patched, soft-deleted rows are skipped.
 *
 * Usage: npx convex run migrations/backfillClerkUsers
 */
export default internalAction({
  args: {},
  returns: v.object({ processed: v.number() }),
  handler: async (ctx) => {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      throw new Error("CLERK_SECRET_KEY environment variable is not set");
    }

    let offset = 0;
    let processed = 0;

    for (;;) {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(offset),
        order_by: "+created_at",
      });
      const response = await fetch(`https://api.clerk.com/v1/users?${params}`, {
        headers: { Authorization: `Bearer ${secretKey}` },
      });
      if (!response.ok) {
        throw new Error(
          `Clerk API request failed: ${response.status} ${await response.text()}`,
        );
      }

      // Same UserJSON shape the webhook delivers
      const users = (await response.json()) as Array<Record<string, unknown>>;
      for (const user of users) {
        await ctx.runMutation(internal.users.upsertFromClerk, { data: user });
        processed++;
      }

      if (users.length < PAGE_SIZE) {
        break;
      }
      offset += PAGE_SIZE;
    }

    return { processed };
  },
});
