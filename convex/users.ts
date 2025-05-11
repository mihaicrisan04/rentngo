import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

// Validator for the User document structure, including system fields
const UserDocValidator = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  name: v.string(),
  email: v.string(),
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
 * Creates a new user if one doesn't exist using their email as the identifier.
 * Updates the user's name if it has changed in Clerk.
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

    const email = identity.email;
    if (!email) {
      throw new Error("Email not found in user identity from Clerk. Cannot ensure user.");
    }

    // Determine the name: use identity.name, fallback to identity.nickname, then email.
    // The schema requires 'name' to be a string.
    const name = identity.name || identity.nickname || email;

    // Check if user already exists by email
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existingUser) {
      // User exists, check if name needs update
      if (existingUser.name !== name) {
        await ctx.db.patch(existingUser._id, { name });
      }
      // Return the (potentially updated) existing user document
      // Re-fetch to ensure we return the latest state if patched
      return (await ctx.db.get(existingUser._id))!;
    } else {
      // User does not exist, create a new one
      const newUserId = await ctx.db.insert("users", {
        email,
        name,
        role: "renter", // Default role
        // phone and preferences are optional and can be set via an update operation later
      });
      return (await ctx.db.get(newUserId))!;
    }
  },
});

/**
 * Retrieves the current authenticated user's profile from the database using their email.
 */
export const get = query({
  args: {},
  returns: v.union(UserDocValidator, v.null()), // Added return validator
  handler: async (ctx): Promise<Doc<"users"> | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) {
      // Not authenticated or email not available, so no user profile to return
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();

    return user;
  },
});

/**
 * Updates the current authenticated user's profile.
 * Allows updating name, phone, and preferences according to the schema.
 */
export const update = mutation({
  args: {
    name: v.optional(v.string()),
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
    if (!identity || !identity.email) {
      throw new Error("User not authenticated or email missing. Cannot update profile.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();

    if (!user) {
      throw new Error("User profile not found. Cannot update.");
    }

    const patchData: Partial<Doc<"users">> = {};

    if (args.name !== undefined) {
      patchData.name = args.name;
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
 * Deletes the current authenticated user's account based on their email.
 */
export const remove = mutation({
  args: {},
  returns: v.null(), // Added return validator
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) {
      throw new Error("User not authenticated or email missing. Cannot delete account.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
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
