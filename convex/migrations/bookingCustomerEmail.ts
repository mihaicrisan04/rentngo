import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";
import { normalizeCustomerEmail } from "../../lib/pricing";

/**
 * Backfill step of the booking customer-email widen-migrate-narrow (RNGO-54).
 *
 * Widen (this deploy) added the optional `customerEmailNormalized` field and
 * the `by_customer_email_and_status` index to `reservations` and `transfers`;
 * every create and every customerInfo update now writes it. The referral
 * "first rental only" rule looks a customer up through that index, so rows
 * predating the widen must be filled in or a returning customer would still
 * qualify for the welcome discount.
 *
 * Idempotent: a row whose stored value already equals the normalized email is
 * skipped, so a re-run only reports zero updates. Batched through a cursor so
 * it never collects an unbounded table in one transaction.
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

const INSPECT_LIMIT = 2000;

/** Read-only pre-flight; run before and after the backfill. */
export const inspect = internalQuery({
  args: {},
  returns: v.object({
    reservations: v.number(),
    reservationsNeedingBackfill: v.number(),
    transfers: v.number(),
    transfersNeedingBackfill: v.number(),
    /** True when a table hit INSPECT_LIMIT: the counts are a lower bound. */
    truncated: v.boolean(),
  }),
  handler: async (ctx) => {
    const reservations = await ctx.db.query("reservations").take(INSPECT_LIMIT);
    const transfers = await ctx.db.query("transfers").take(INSPECT_LIMIT);
    const stale = (row: {
      customerEmailNormalized?: string;
      customerInfo: { email: string };
    }) =>
      row.customerEmailNormalized !==
      normalizeCustomerEmail(row.customerInfo.email);

    return {
      truncated: [reservations, transfers].some(
        (rows) => rows.length === INSPECT_LIMIT,
      ),
      reservations: reservations.length,
      reservationsNeedingBackfill: reservations.filter(stale).length,
      transfers: transfers.length,
      transfersNeedingBackfill: transfers.filter(stale).length,
    };
  },
});

export const backfillReservations = internalMutation({
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
        .query("reservations")
        .paginate({ cursor, numItems: BATCH_SIZE });

      for (const reservation of page.page) {
        scanned++;
        const normalized = normalizeCustomerEmail(
          reservation.customerInfo.email,
        );
        if (reservation.customerEmailNormalized === normalized) continue;
        updated++;
        if (dryRun) continue;
        await ctx.db.patch(reservation._id, {
          customerEmailNormalized: normalized,
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

export const backfillTransfers = internalMutation({
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
        .query("transfers")
        .paginate({ cursor, numItems: BATCH_SIZE });

      for (const transfer of page.page) {
        scanned++;
        const normalized = normalizeCustomerEmail(transfer.customerInfo.email);
        if (transfer.customerEmailNormalized === normalized) continue;
        updated++;
        if (dryRun) continue;
        await ctx.db.patch(transfer._id, {
          customerEmailNormalized: normalized,
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
