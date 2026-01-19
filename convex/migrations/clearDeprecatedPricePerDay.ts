import { internalMutation } from "../_generated/server";

/**
 * Migration to clear the deprecated `pricePerDay` field from all vehicles.
 * If a vehicle has no pricingTiers, one is created from the pricePerDay value.
 * Run this after deploying code changes that no longer use the `pricePerDay` field.
 *
 * Usage: npx convex run migrations/clearDeprecatedPricePerDay
 */
export default internalMutation({
  args: {},
  handler: async (ctx) => {
    const vehicles = await ctx.db.query("vehicles").collect();
    let migrated = 0;
    let created = 0;

    for (const vehicle of vehicles) {
      // If no pricingTiers, create from pricePerDay
      if (!vehicle.pricingTiers || vehicle.pricingTiers.length === 0) {
        const price = (vehicle as any).pricePerDay || 50;
        await ctx.db.patch(vehicle._id, {
          pricingTiers: [{ minDays: 1, maxDays: 365, pricePerDay: price }],
          pricePerDay: undefined,
        } as any);
        created++;
      } else if ((vehicle as any).pricePerDay !== undefined) {
        // Has tiers, just clear legacy field
        await ctx.db.patch(vehicle._id, { pricePerDay: undefined } as any);
        migrated++;
      }
    }

    return { migrated, created, total: vehicles.length };
  },
});
