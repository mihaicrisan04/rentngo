import { query } from "./_generated/server";

// List of authorized users IDs 
const AUTHORIZED_USERS = [
    "user_2wrgqldXONHGnBJvkeLqTMisRiZ",
];

export const isAuthorized = query({
    args: {},
    handler: async (ctx, args) => {
        const userId = await ctx.auth.getUserIdentity();
        if (!userId) return false;

        // Check if the user is in the list of authorized users
        return AUTHORIZED_USERS.includes(userId.subject);
    }
})
