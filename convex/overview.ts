import { query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { QueryCtx } from "./_generated/server";
import { requireAdmin } from "./users";
import { bookingStatusValidator } from "./validators";

/**
 * Compact shape shared by every overview panel: enough to render one row and
 * link to the owning admin table, nothing else.
 */
const overviewItemValidator = v.object({
  id: v.string(),
  kind: v.union(v.literal("reservation"), v.literal("transfer")),
  bookingNumber: v.optional(v.number()),
  customerName: v.string(),
  vehicleLabel: v.union(v.string(), v.null()),
  status: bookingStatusValidator,
  /** Event time: pickup/return for the schedule, creation for the rest. */
  timestamp: v.number(),
  time: v.optional(v.string()),
});

const scheduleItemValidator = overviewItemValidator.extend({
  event: v.union(v.literal("pickup"), v.literal("return")),
});

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 20;

/** Statuses an operator still has to act on; the rest are dead weight here. */
const LIVE_STATUSES = ["pending", "confirmed"] as const;

function isLive(status: string): boolean {
  return (LIVE_STATUSES as readonly string[]).includes(status);
}

async function vehicleLabel(
  ctx: QueryCtx,
  vehicleId: Id<"vehicles">,
): Promise<string | null> {
  const vehicle = await ctx.db.get(vehicleId);
  return vehicle ? `${vehicle.make} ${vehicle.model}` : null;
}

async function toReservationItem(
  ctx: QueryCtx,
  reservation: Doc<"reservations">,
  timestamp: number,
  time?: string,
) {
  return {
    id: reservation._id,
    kind: "reservation" as const,
    bookingNumber: reservation.reservationNumber,
    customerName: reservation.customerInfo.name,
    vehicleLabel: await vehicleLabel(ctx, reservation.vehicleId),
    status: reservation.status,
    timestamp,
    time,
  };
}

async function toTransferItem(
  ctx: QueryCtx,
  transfer: Doc<"transfers">,
  timestamp: number,
  time?: string,
) {
  return {
    id: transfer._id,
    kind: "transfer" as const,
    bookingNumber: transfer.transferNumber,
    customerName: transfer.customerInfo.name,
    vehicleLabel: await vehicleLabel(ctx, transfer.vehicleId),
    status: transfer.status,
    timestamp,
    time,
  };
}

/**
 * Pickups and returns falling inside [from, to). The caller passes the window
 * so the clock stays on the client (see `getUpcomingWindow`).
 */
export const getUpcomingSchedule = query({
  args: {
    from: v.number(),
    to: v.number(),
    limit: v.optional(v.number()),
  },
  returns: v.array(scheduleItemValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const limit = Math.min(args.limit ?? DEFAULT_LIMIT, MAX_LIMIT);

    const [pickups, returns, transfers] = await Promise.all([
      ctx.db
        .query("reservations")
        .withIndex("by_dates", (q) =>
          q.gte("startDate", args.from).lt("startDate", args.to),
        )
        .take(limit * 2),
      ctx.db
        .query("reservations")
        .withIndex("by_end_date", (q) =>
          q.gte("endDate", args.from).lt("endDate", args.to),
        )
        .take(limit * 2),
      ctx.db
        .query("transfers")
        .withIndex("by_pickup_date", (q) =>
          q.gte("pickupDate", args.from).lt("pickupDate", args.to),
        )
        .take(limit * 2),
    ]);

    const items = await Promise.all([
      ...pickups
        .filter((reservation) => isLive(reservation.status))
        .map(async (reservation) => ({
          ...(await toReservationItem(
            ctx,
            reservation,
            reservation.startDate,
            reservation.pickupTime,
          )),
          event: "pickup" as const,
        })),
      ...returns
        .filter((reservation) => isLive(reservation.status))
        .map(async (reservation) => ({
          ...(await toReservationItem(
            ctx,
            reservation,
            reservation.endDate,
            reservation.restitutionTime,
          )),
          event: "return" as const,
        })),
      ...transfers
        .filter((transfer) => isLive(transfer.status))
        .map(async (transfer) => ({
          ...(await toTransferItem(
            ctx,
            transfer,
            transfer.pickupDate,
            transfer.pickupTime,
          )),
          event: "pickup" as const,
        })),
    ]);

    return items.sort((a, b) => a.timestamp - b.timestamp).slice(0, limit);
  },
});
