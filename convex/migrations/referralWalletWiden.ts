import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";

/**
 * Backfill step of the referral wallet widen-migrate-narrow (RNGO-51).
 *
 * Widen (this deploy) added the v2 conversion statuses, the approval snapshot
 * fields and `affiliates.approvedConversions`; the code dual-writes both
 * counters and reads `approvedConversions ?? confirmedConversions`. This
 * migration moves the data over:
 *
 *   - `referralConversions.status: "confirmed" -> "approved"`, WITHOUT minting
 *     wallet credit: v1 conversions were confirmed at booking time under the
 *     old reward model and were never promised credit.
 *   - `affiliates.approvedConversions = confirmedConversions` where unset.
 *
 * Idempotent: rows already carrying the v2 shape are skipped, so re-running
 * only reports zero updates. Batched through a cursor so it never collects an
 * unbounded table in one transaction.
 *
 * Usage: see convex/migrations/README.md.
 */

const BATCH_SIZE = 100;
const MAX_BATCHES_PER_RUN = 10;

const resultValidator = v.object({
  dryRun: v.boolean(),
  scanned: v.number(),
  updated: v.number(),
  skipped: v.number(),
  isDone: v.boolean(),
  continueCursor: v.union(v.string(), v.null()),
});

/**
 * Read-only pre-flight. Run this on the target deployment BEFORE the backfill:
 * the program must still be disabled, otherwise the owner has to decide what
 * happens to conversions earned while v1 was live.
 */
const INSPECT_LIMIT = 2000;

export const inspect = internalQuery({
  args: {},
  returns: v.object({
    programEnabled: v.boolean(),
    settingsDocExists: v.boolean(),
    affiliates: v.number(),
    affiliatesNeedingBackfill: v.number(),
    conversions: v.number(),
    legacyConfirmedConversions: v.number(),
    walletTransactions: v.number(),
    /** True when a table hit INSPECT_LIMIT: the counts are a lower bound. */
    truncated: v.boolean(),
  }),
  handler: async (ctx) => {
    const settings = await ctx.db.query("affiliateSettings").first();
    const affiliates = await ctx.db.query("affiliates").take(INSPECT_LIMIT);
    const conversions = await ctx.db
      .query("referralConversions")
      .take(INSPECT_LIMIT);
    const walletTransactions = await ctx.db
      .query("walletTransactions")
      .take(INSPECT_LIMIT);

    return {
      truncated: [affiliates, conversions, walletTransactions].some(
        (rows) => rows.length === INSPECT_LIMIT,
      ),
      programEnabled: settings?.enabled ?? false,
      settingsDocExists: settings !== null,
      affiliates: affiliates.length,
      affiliatesNeedingBackfill: affiliates.filter(
        (a) => a.approvedConversions === undefined,
      ).length,
      conversions: conversions.length,
      legacyConfirmedConversions: conversions.filter(
        (c) => c.status === "confirmed",
      ).length,
      walletTransactions: walletTransactions.length,
    };
  },
});

export const backfillConversions = internalMutation({
  args: {
    dryRun: v.optional(v.boolean()),
    cursor: v.optional(v.union(v.string(), v.null())),
  },
  returns: resultValidator,
  handler: async (ctx, args) => {
    const dryRun = args.dryRun ?? false;
    let cursor = args.cursor ?? null;
    let scanned = 0;
    let updated = 0;
    let isDone = false;

    for (let batch = 0; batch < MAX_BATCHES_PER_RUN && !isDone; batch++) {
      const page = await ctx.db
        .query("referralConversions")
        .paginate({ cursor, numItems: BATCH_SIZE });

      for (const conversion of page.page) {
        scanned++;
        if (conversion.status !== "confirmed") continue;
        updated++;
        if (dryRun) continue;
        await ctx.db.patch(conversion._id, {
          status: "approved",
          approvedAt: conversion.confirmedAt ?? conversion.createdAt,
        });
      }

      cursor = page.continueCursor;
      isDone = page.isDone;
    }

    return {
      dryRun,
      scanned,
      updated,
      skipped: scanned - updated,
      isDone,
      continueCursor: isDone ? null : cursor,
    };
  },
});

export const backfillAffiliateCounters = internalMutation({
  args: {
    dryRun: v.optional(v.boolean()),
    cursor: v.optional(v.union(v.string(), v.null())),
  },
  returns: resultValidator,
  handler: async (ctx, args) => {
    const dryRun = args.dryRun ?? false;
    let cursor = args.cursor ?? null;
    let scanned = 0;
    let updated = 0;
    let isDone = false;

    for (let batch = 0; batch < MAX_BATCHES_PER_RUN && !isDone; batch++) {
      const page = await ctx.db
        .query("affiliates")
        .paginate({ cursor, numItems: BATCH_SIZE });

      for (const affiliate of page.page) {
        scanned++;
        if (affiliate.approvedConversions !== undefined) continue;
        updated++;
        if (dryRun) continue;
        await ctx.db.patch(affiliate._id, {
          approvedConversions: affiliate.confirmedConversions,
        });
      }

      cursor = page.continueCursor;
      isDone = page.isDone;
    }

    return {
      dryRun,
      scanned,
      updated,
      skipped: scanned - updated,
      isDone,
      continueCursor: isDone ? null : cursor,
    };
  },
});
