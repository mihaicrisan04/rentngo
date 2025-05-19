import { query } from "./_generated/server";

// List of authorized users IDs (from clerk)
const AUTHORIZED_USERS = [
    "user_2wrgqldXONHGnBJvkeLqTMisRiZ",
];

// List of authorized users IDs (from convex)
const AUTHORIZED_USER_CONVEX = [
    "js749ptf37fwm6v0htrnmswmhn7fqyfa",
];

export const isAuthorized = query({
    args: {},
    handler: async (ctx, args) => {
        const userId = await ctx.auth.getUserIdentity();
        if (!userId) return false;

        // Check if the user is in the list of authorized users
        return AUTHORIZED_USERS.includes(userId.subject) || AUTHORIZED_USER_CONVEX.includes(userId.subject);
    }
})
