import { internalMutation } from "../_generated/server";

/**
 * Migration script to update existing vehicles with classId references
 *
 * This script:
 * 1. Maps old class enum values to new vehicle class names
 * 2. Finds all vehicles without classId
 * 3. Assigns appropriate classId based on old class field
 * 4. Sets default classSortIndex to 0
 *
 * Usage:
 * 1. Ensure vehicle classes are seeded first (run seedVehicleClasses)
 * 2. Run this migration via Convex dashboard or CLI
 * 3. This is idempotent - safe to run multiple times
 */
export default internalMutation({
  args: {},
  handler: async (ctx) => {
    // Mapping from old class enum values to new class names
    const classMapping: Record<string, string> = {
      economy: "Economy",
      compact: "Compact",
      intermediate: "Intermediate",
      standard: "Standard",
      "full-size": "Full-Size",
      premium: "Premium",
      luxury: "Luxury",
      sport: "Sport",
      executive: "Executive",
      commercial: "Commercial",
      convertible: "Convertible",
      "super-sport": "Super Sport",
      supercars: "Supercars",
      business: "Business",
      van: "Van",
    };

    // Get all vehicles
    const vehicles = await ctx.db.query("vehicles").collect();

    // Get all vehicle classes and create a map
    const vehicleClasses = await ctx.db.query("vehicleClasses").collect();
    const classNameToId = new Map(
      vehicleClasses.map((vc) => [vc.name.toLowerCase(), vc._id]),
    );

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    console.log(`Found ${vehicles.length} vehicles to process`);

    for (const vehicle of vehicles) {
      // Skip if vehicle already has classId
      if (vehicle.classId) {
        console.log(
          `Skipped: ${vehicle.make} ${vehicle.model} - already has classId`,
        );
        skippedCount++;
        continue;
      }

      // Skip if vehicle has no old class field
      if (!vehicle.class) {
        console.log(
          `Warning: ${vehicle.make} ${vehicle.model} - no class field, skipping`,
        );
        errors.push(
          `${vehicle.make} ${vehicle.model} (ID: ${vehicle._id}) has no class field`,
        );
        errorCount++;
        continue;
      }

      // Map old class to new class name
      const oldClass = vehicle.class;
      const newClassName = classMapping[oldClass];

      if (!newClassName) {
        console.log(
          `Error: ${vehicle.make} ${vehicle.model} - unknown class "${oldClass}"`,
        );
        errors.push(
          `${vehicle.make} ${vehicle.model} (ID: ${vehicle._id}) has unknown class "${oldClass}"`,
        );
        errorCount++;
        continue;
      }

      // Find the class ID
      const newClassId = classNameToId.get(newClassName.toLowerCase());

      if (!newClassId) {
        console.log(
          `Error: ${vehicle.make} ${vehicle.model} - class "${newClassName}" not found in database`,
        );
        errors.push(
          `${vehicle.make} ${vehicle.model} (ID: ${vehicle._id}) - class "${newClassName}" not found. Run seedVehicleClasses first.`,
        );
        errorCount++;
        continue;
      }

      // Update the vehicle
      try {
        await ctx.db.patch(vehicle._id, {
          classId: newClassId,
          classSortIndex: 0, // Default sort index
        });

        console.log(
          `Migrated: ${vehicle.make} ${vehicle.model} from "${oldClass}" to "${newClassName}"`,
        );
        migratedCount++;
      } catch (error) {
        console.log(
          `Error updating ${vehicle.make} ${vehicle.model}:`,
          error,
        );
        errors.push(
          `${vehicle.make} ${vehicle.model} (ID: ${vehicle._id}) - update failed: ${error}`,
        );
        errorCount++;
      }
    }

    console.log("\n=== Migration Summary ===");
    console.log(`Total vehicles: ${vehicles.length}`);
    console.log(`Migrated: ${migratedCount}`);
    console.log(`Skipped (already migrated): ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);

    if (errors.length > 0) {
      console.log("\n=== Errors ===");
      errors.forEach((error) => console.log(error));
    }

    return {
      success: errorCount === 0,
      total: vehicles.length,
      migrated: migratedCount,
      skipped: skippedCount,
      errors: errorCount,
      errorDetails: errors,
    };
  },
});
