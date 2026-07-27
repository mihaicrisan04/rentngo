import type { MutationCtx } from "./_generated/server";

type BookingCounter =
  | {
      name: "reservationNumber";
      table: "reservations";
      field: "reservationNumber";
      seed: 10000;
    }
  | {
      name: "transferNumber";
      table: "transfers";
      field: "transferNumber";
      seed: 1;
    };

export const reservationNumberCounter = {
  name: "reservationNumber",
  table: "reservations",
  field: "reservationNumber",
  seed: 10000,
} as const satisfies BookingCounter;

export const transferNumberCounter = {
  name: "transferNumber",
  table: "transfers",
  field: "transferNumber",
  seed: 1,
} as const satisfies BookingCounter;

export async function nextBookingNumber(
  ctx: MutationCtx,
  config: BookingCounter,
): Promise<number> {
  const counter = await ctx.db
    .query("counters")
    .withIndex("by_name", (query) => query.eq("name", config.name))
    .unique();

  if (counter) {
    const next = counter.value + 1;
    await ctx.db.patch(counter._id, { value: next });
    return next;
  }

  const latestNumber =
    config.name === "reservationNumber"
      ? (
          await ctx.db
            .query("reservations")
            .withIndex("by_number")
            .order("desc")
            .first()
        )?.reservationNumber
      : (
          await ctx.db
            .query("transfers")
            .withIndex("by_number")
            .order("desc")
            .first()
        )?.transferNumber;
  const initial = latestNumber === undefined ? config.seed : latestNumber + 1;

  await ctx.db.insert("counters", { name: config.name, value: initial });
  return initial;
}
