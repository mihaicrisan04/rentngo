import { internalMutation } from "../_generated/server";

/**
 * Migration script to add additional50kmPrice field to existing vehicle classes
 *
 * This script:
 * 1. Finds all vehicle classes without additional50kmPrice
 * 2. Sets default value of 5 EUR for existing classes
 *
 * Usage:
 * 1. Run this via Convex dashboard or CLI
 * 2. This is idempotent - safe to run multiple times
 */
export default internalMutation({
  args: {},
  handler: async (ctx) => {
    // Get all vehicle classes
    const vehicleClasses = await ctx.db.query("vehicleClasses").collect();

    let updatedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    console.log(`Found ${vehicleClasses.length} vehicle classes to check`);

    for (const vehicleClass of vehicleClasses) {
      // Check if additional50kmPrice field exists
      // Since the schema now requires this field, existing classes will have it as undefined
      // We need to add it manually
      if ((vehicleClass as any).additional50kmPrice === undefined) {
        try {
          await ctx.db.patch(vehicleClass._id, {
            additional50kmPrice: 5, // Default price
          });

          console.log(
            `Updated: Vehicle class "${vehicleClass.name}" - added additional50kmPrice: 5`,
          );
          updatedCount++;
        } catch (error) {
          console.log(
            `Error updating vehicle class "${vehicleClass.name}":`,
            error,
          );
          errors.push(
            `${vehicleClass.name} (ID: ${vehicleClass._id}) - update failed: ${error}`,
          );
        }
      } else {
        console.log(
          `Skipped: Vehicle class "${vehicleClass.name}" - already has additional50kmPrice`,
        );
        skippedCount++;
      }
    }

    console.log("\n=== Migration Summary ===");
    console.log(`Total classes: ${vehicleClasses.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped (already has field): ${skippedCount}`);
    console.log(`Errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log("\n=== Errors ===");
      errors.forEach((error) => console.log(error));
    }

    return {
      success: errors.length === 0,
      total: vehicleClasses.length,
      updated: updatedCount,
      skipped: skippedCount,
      errors: errors.length,
      errorDetails: errors,
    };
  },
});

