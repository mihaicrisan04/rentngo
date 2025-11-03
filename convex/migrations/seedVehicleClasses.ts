import { internalMutation } from "../_generated/server";

/**
 * Seed script to populate initial vehicle classes
 *
 * Usage:
 * 1. Run this via Convex dashboard or CLI
 * 2. This will create the standard vehicle classes used in the system
 * 3. Only creates classes that don't already exist (idempotent)
 */
export default internalMutation({
  args: {},
  handler: async (ctx) => {
    const classes = [
      {
        name: "Economy",
        displayName: "Economy Cars",
        description: "Budget-friendly vehicles perfect for everyday travel",
        sortIndex: 0,
      },
      {
        name: "Compact",
        displayName: "Compact Cars",
        description: "Small and efficient cars, ideal for city driving",
        sortIndex: 1,
      },
      {
        name: "Intermediate",
        displayName: "Intermediate Cars",
        description: "Mid-size vehicles with balanced comfort and efficiency",
        sortIndex: 2,
      },
      {
        name: "Standard",
        displayName: "Standard Cars",
        description: "Standard comfort vehicles for all occasions",
        sortIndex: 3,
      },
      {
        name: "Full-Size",
        displayName: "Full-Size Cars",
        description: "Large, spacious vehicles for maximum comfort",
        sortIndex: 4,
      },
      {
        name: "Premium",
        displayName: "Premium Cars",
        description: "High-end comfort with premium features",
        sortIndex: 5,
      },
      {
        name: "Luxury",
        displayName: "Luxury Cars",
        description: "Top-tier luxury vehicles with exceptional comfort",
        sortIndex: 6,
      },
      {
        name: "Sport",
        displayName: "Sport Cars",
        description: "Performance-focused cars for driving enthusiasts",
        sortIndex: 7,
      },
      {
        name: "Super Sport",
        displayName: "Super Sport Cars",
        description: "High-performance sports cars with incredible speed",
        sortIndex: 8,
      },
      {
        name: "Supercars",
        displayName: "Supercars",
        description: "Exotic supercars for the ultimate driving experience",
        sortIndex: 9,
      },
      {
        name: "Executive",
        displayName: "Executive Cars",
        description: "Business class vehicles for professionals",
        sortIndex: 10,
      },
      {
        name: "Business",
        displayName: "Business Cars",
        description: "Professional business vehicles",
        sortIndex: 11,
      },
      {
        name: "Van",
        displayName: "Vans",
        description: "Passenger and cargo vans for groups and transport",
        sortIndex: 12,
      },
      {
        name: "Convertible",
        displayName: "Convertibles",
        description: "Open-top vehicles for enjoying the outdoors",
        sortIndex: 13,
      },
      {
        name: "Commercial",
        displayName: "Commercial Vehicles",
        description: "Commercial vehicles for business use",
        sortIndex: 14,
      },
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const classData of classes) {
      // Check if class with this name already exists
      const existing = await ctx.db
        .query("vehicleClasses")
        .withIndex("by_name", (q) => q.eq("name", classData.name))
        .first();

      if (existing) {
        console.log(`Skipped: Class "${classData.name}" already exists`);
        skippedCount++;
        continue;
      }

      // Create the class
      await ctx.db.insert("vehicleClasses", {
        name: classData.name,
        displayName: classData.displayName,
        description: classData.description,
        sortIndex: classData.sortIndex,
        isActive: true,
        additional50kmPrice: 5, // Default price per 50km package
      });

      console.log(`Created: Vehicle class "${classData.name}"`);
      createdCount++;
    }

    console.log(
      `\nSeeding complete! Created: ${createdCount}, Skipped: ${skippedCount}, Total: ${classes.length}`,
    );

    return {
      success: true,
      created: createdCount,
      skipped: skippedCount,
      total: classes.length,
    };
  },
});
