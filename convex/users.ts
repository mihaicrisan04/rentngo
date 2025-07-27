import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

// Validator for the User document structure, including system fields
const UserDocValidator = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  name: v.string(),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  email: v.string(),
  clerkId: v.string(),
  phone: v.optional(v.string()),
  role: v.union(v.literal("renter"), v.literal("admin")),
  preferences: v.optional(
    v.object({
      language: v.union(v.literal("en"), v.literal("ro")),
      notifications: v.boolean(),
    })
  ),
});

/**
 * Ensures a user record exists for the currently authenticated Clerk user.
 * Creates a new user if one doesn't exist using their Clerk ID as the identifier.
 * Updates the user's name and email if they have changed in Clerk.
 * This function should be called by the client after successful Clerk authentication.
 */
export const ensureUser = mutation({
  args: {}, // No arguments needed as it uses the auth context
  returns: UserDocValidator, // Added return validator
  handler: async (ctx): Promise<Doc<"users">> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User identity not found. Ensure user is authenticated.");
    }

    const clerkId = identity.subject;
    const email = identity.email;
    if (!email) {
      throw new Error("Email not found in user identity from Clerk. Cannot ensure user.");
    }

    // Extract name components from Clerk identity
    const firstName = typeof identity.firstName === 'string' ? identity.firstName : undefined;
    const lastName = typeof identity.lastName === 'string' ? identity.lastName : undefined;
    // Determine the full name: use identity.name, fallback to firstName + lastName, then identity.nickname, then email.
    // The schema requires 'name' to be a string.
    const name = (typeof identity.name === 'string' ? identity.name : null) || 
                 (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName) || 
                 (typeof identity.nickname === 'string' ? identity.nickname : null) || 
                 email;

    // Check if user already exists by Clerk ID (more reliable than email)
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (existingUser) {
      // User exists, check if fields need update
      const updates: Partial<Doc<"users">> = {};
      if (existingUser.name !== name) {
        updates.name = name;
      }
      if (existingUser.email !== email) {
        updates.email = email;
      }
      if (existingUser.firstName !== firstName) {
        updates.firstName = firstName;
      }
      if (existingUser.lastName !== lastName) {
        updates.lastName = lastName;
      }
      
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(existingUser._id, updates);
      }
      
      // Return the (potentially updated) existing user document
      // Re-fetch to ensure we return the latest state if patched
      return (await ctx.db.get(existingUser._id))!;
    } else {
      // User does not exist, create a new one
      const newUserId = await ctx.db.insert("users", {
        email,
        name,
        firstName,
        lastName,
        clerkId,
        role: "renter", // Default role
        // phone and preferences are optional and can be set via an update operation later
      });
      return (await ctx.db.get(newUserId))!;
    }
  },
});

/**
 * Retrieves the current authenticated user's profile from the database using their Clerk ID.
 */
export const get = query({
  args: {},
  returns: v.union(UserDocValidator, v.null()), // Added return validator
  handler: async (ctx): Promise<Doc<"users"> | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Not authenticated, so no user profile to return
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user;
  },
});

/**
 * Updates the current authenticated user's profile.
 * Allows updating name, firstName, lastName, phone, and preferences according to the schema.
 */
export const update = mutation({
  args: {
    name: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    preferences: v.optional(
      v.object({
        language: v.union(v.literal("en"), v.literal("ro")),
        notifications: v.boolean(),
      })
    ),
  },
  returns: v.null(), // Added return validator
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated. Cannot update profile.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User profile not found. Cannot update.");
    }

    const patchData: Partial<Doc<"users">> = {};

    if (args.name !== undefined) {
      patchData.name = args.name;
    }
    if (args.firstName !== undefined) {
      patchData.firstName = args.firstName;
    }
    if (args.lastName !== undefined) {
      patchData.lastName = args.lastName;
    }
    if (args.phone !== undefined) {
      patchData.phone = args.phone;
    }
    if (args.preferences !== undefined) {
      patchData.preferences = args.preferences;
    }

    if (Object.keys(patchData).length > 0) {
      await ctx.db.patch(user._id, patchData);
    }
    // Explicitly return null to match v.null() validator
    return null;
  },
});

/**
 * Deletes the current authenticated user's account based on their Clerk ID.
 */
export const remove = mutation({
  args: {},
  returns: v.null(), // Added return validator
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated. Cannot delete account.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User profile not found. Cannot delete.");
    }

    await ctx.db.delete(user._id);
    // Consider related data cleanup if necessary (e.g., reservations, vehicles)
    // Explicitly return null to match v.null() validator
    return null;
  },
});

/**
 * Helper function to get the current authenticated user from the database.
 * Returns null if not authenticated or user not found.
 */
export const getCurrentUser = async (ctx: QueryCtx | MutationCtx): Promise<Doc<"users"> | null> => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  return user;
};

/**
 * Helper function to get the current authenticated user from the database.
 * Throws an error if not authenticated or user not found.
 */
export const getCurrentUserOrThrow = async (ctx: QueryCtx | MutationCtx): Promise<Doc<"users">> => {
  const user = await getCurrentUser(ctx);
  if (!user) {
    throw new Error("User not authenticated or not found in database. Please ensure user is logged in and has been created.");
  }
  return user;
};
