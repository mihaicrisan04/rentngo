import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";

const http = httpRouter();

/**
 * Clerk webhook endpoint (registered in the Clerk dashboard as
 * https://<deployment>.convex.site/webhooks/clerk, subscribed to
 * user.created, user.updated and user.deleted). Primary Clerk -> Convex
 * user sync; getOrCreateCurrentUser in booking mutations is the safety net.
 */
http.route({
  path: "/webhooks/clerk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);
    if (!event) {
      return new Response("Invalid webhook signature", { status: 400 });
    }

    switch (event.type) {
      case "user.created":
      case "user.updated":
        await ctx.runMutation(internal.users.upsertFromClerk, {
          data: event.data,
        });
        break;
      case "user.deleted":
        if (event.data.id) {
          await ctx.runMutation(internal.users.deleteFromClerk, {
            clerkId: event.data.id,
          });
        }
        break;
      default:
        // Unhandled event types are acknowledged no-ops
        break;
    }

    return new Response(null, { status: 200 });
  }),
});

/**
 * Verify the Svix signature on an incoming Clerk webhook request.
 * Returns the parsed event, or null when verification fails.
 */
async function validateRequest(request: Request): Promise<WebhookEvent | null> {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("CLERK_WEBHOOK_SECRET environment variable is not set");
  }

  const payload = await request.text();
  const svixHeaders = {
    "svix-id": request.headers.get("svix-id") ?? "",
    "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
    "svix-signature": request.headers.get("svix-signature") ?? "",
  };

  try {
    return new Webhook(secret).verify(payload, svixHeaders) as unknown as WebhookEvent;
  } catch {
    return null;
  }
}

export default http;
