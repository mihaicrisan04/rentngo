import { internalMutation } from "../_generated/server";

/**
 * Migration to clear the deprecated `class` field from all vehicles.
 * Run this after deploying code changes that no longer use the `class` field.
 *
 * Usage: npx convex run migrations/clearDeprecatedClassField
 */
export default internalMutation({
  args: {},
  handler: async (ctx) => {
    const vehicles = await ctx.db.query("vehicles").collect();
    let updated = 0;

    for (const vehicle of vehicles) {
      if ((vehicle as any).class !== undefined) {
        await ctx.db.patch(vehicle._id, { class: undefined } as any);
        updated++;
      }
    }

    return { updated, total: vehicles.length };
  },
});
