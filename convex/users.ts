import {
  mutation,
  query,
  internalMutation,
  QueryCtx,
  MutationCtx,
} from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";
import type { UserJSON } from "@clerk/nextjs/server";

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
  deletedAt: v.optional(v.number()),
});

/** Clerk profile fields mapped to our users table shape. */
type ClerkUserAttributes = {
  clerkId: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
};

/**
 * Core upsert keyed by clerkId, shared by the webhook sync
 * (upsertFromClerk) and the mutation safety net (getOrCreateCurrentUser).
 * Soft-deleted rows are left untouched so an out-of-order user.updated
 * webhook can never resurrect anonymized PII.
 */
async function upsertUser(
  ctx: MutationCtx,
  attrs: ClerkUserAttributes
): Promise<Doc<"users">> {
  const existingUser = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", attrs.clerkId))
    .unique();

  if (existingUser) {
    if (existingUser.deletedAt !== undefined) {
      return existingUser;
    }

    const updates: Partial<Doc<"users">> = {};
    if (existingUser.name !== attrs.name) {
      updates.name = attrs.name;
    }
    if (existingUser.email !== attrs.email) {
      updates.email = attrs.email;
    }
    // Only update firstName/lastName if Clerk provides them (don't overwrite with undefined)
    if (attrs.firstName !== undefined && existingUser.firstName !== attrs.firstName) {
      updates.firstName = attrs.firstName;
    }
    if (attrs.lastName !== undefined && existingUser.lastName !== attrs.lastName) {
      updates.lastName = attrs.lastName;
    }

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(existingUser._id, updates);
    }

    // Re-fetch to ensure we return the latest state if patched
    return (await ctx.db.get(existingUser._id))!;
  }

  const newUserId = await ctx.db.insert("users", {
    email: attrs.email,
    name: attrs.name,
    firstName: attrs.firstName,
    lastName: attrs.lastName,
    clerkId: attrs.clerkId,
    role: "renter", // Default role
    // phone and preferences are optional and can be set via an update operation later
  });
  return (await ctx.db.get(newUserId))!;
}

/**
 * Soft delete + anonymize: sets deletedAt and scrubs PII (GDPR erasure)
 * while keeping the row so userId references in reservations, transfers
 * and affiliates stay valid. Re-signups are safe — Clerk issues a new
 * clerkId, so a fresh row is created.
 */
async function softDeleteUser(
  ctx: MutationCtx,
  user: Doc<"users">
): Promise<void> {
  await ctx.db.patch(user._id, {
    deletedAt: Date.now(),
    name: "Deleted user",
    email: `deleted+${user.clerkId}@removed`,
    firstName: undefined,
    lastName: undefined,
    phone: undefined,
  });
}

/**
 * Webhook-driven upsert for Clerk user.created / user.updated events.
 * `data` is the raw Clerk UserJSON payload — too wide (and Clerk-versioned)
 * to spell out as a strict Convex object validator, hence v.any().
 */
export const upsertFromClerk = internalMutation({
  args: { data: v.any() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const data = args.data as UserJSON;

    const primaryEmail =
      data.email_addresses?.find((e) => e.id === data.primary_email_address_id)
        ?.email_address ?? data.email_addresses?.[0]?.email_address;
    if (!primaryEmail) {
      // Schema requires an email. Skip (200) rather than throw so Clerk
      // doesn't retry an event we can never process.
      console.warn("[users] upsertFromClerk: Clerk user has no email, skipping", {
        clerkId: data.id,
      });
      return null;
    }

    const firstName = data.first_name ?? undefined;
    const lastName = data.last_name ?? undefined;
    const name =
      (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName) ||
      data.username ||
      primaryEmail;

    await upsertUser(ctx, {
      clerkId: data.id,
      email: primaryEmail,
      name,
      firstName,
      lastName,
    });
    return null;
  },
});

/**
 * Webhook-driven soft delete for Clerk user.deleted events.
 */
export const deleteFromClerk = internalMutation({
  args: { clerkId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (user && user.deletedAt === undefined) {
      await softDeleteUser(ctx, user);
    } else if (!user) {
      console.warn("[users] deleteFromClerk: no user row for Clerk user", {
        clerkId: args.clerkId,
      });
    }
    return null;
  },
});

/**
 * Retrieves the current authenticated user's profile from the database using their Clerk ID.
 */
export const get = query({
  args: {},
  returns: v.union(UserDocValidator, v.null()),
  handler: async (ctx): Promise<Doc<"users"> | null> => {
    return await getCurrentUser(ctx);
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
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
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
 * Soft-deletes the current authenticated user's account (anonymizes PII,
 * keeps the row so their reservations/transfers stay linked).
 */
export const remove = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User profile not found. Cannot delete.");
    }

    await softDeleteUser(ctx, user);
    // Explicitly return null to match v.null() validator
    return null;
  },
});

/**
 * Helper function to get the current authenticated user from the database.
 * Returns null if not authenticated, user not found, or soft-deleted.
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

  // Cheap defense: a soft-deleted user shouldn't hold a valid JWT anyway
  if (!user || user.deletedAt !== undefined) {
    return null;
  }

  return user;
};

/**
 * Safety net for renter-facing write mutations: returns the current user's
 * row, creating (or refreshing) it from the JWT identity when the Clerk
 * webhook sync hasn't landed yet — a delayed/missed webhook can never block
 * a booking. Returns null when unauthenticated (guest flows stay guest).
 */
export const getOrCreateCurrentUser = async (
  ctx: MutationCtx
): Promise<Doc<"users"> | null> => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  const email = identity.email;
  if (!email) {
    // Schema requires an email, so we can't create a row — fall back to lookup
    return await getCurrentUser(ctx);
  }

  // Extract name components from the Clerk identity (JWT claims)
  const firstName = typeof identity.firstName === "string" ? identity.firstName : undefined;
  const lastName = typeof identity.lastName === "string" ? identity.lastName : undefined;
  // Determine the full name: use identity.name, fallback to firstName + lastName,
  // then identity.nickname, then email. The schema requires 'name' to be a string.
  const name =
    (typeof identity.name === "string" ? identity.name : null) ||
    (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName) ||
    (typeof identity.nickname === "string" ? identity.nickname : null) ||
    email;

  const user = await upsertUser(ctx, {
    clerkId: identity.subject,
    email,
    name,
    firstName,
    lastName,
  });
  return user.deletedAt !== undefined ? null : user;
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

/**
 * Helper function to require that the current authenticated user is an admin.
 * Throws an error if not authenticated, user not found, or not an admin.
 */
export const requireAdmin = async (ctx: QueryCtx | MutationCtx): Promise<Doc<"users">> => {
  const user = await getCurrentUserOrThrow(ctx);
  if (user.role !== "admin") {
    throw new Error("User not authorized (admin only).");
  }
  return user;
};
