import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";

/**
 * Verify the Svix signature on an incoming Clerk webhook request.
 * Returns the parsed event, or null when verification fails.
 */
export async function verifyClerkWebhook(
  request: Request,
  secret: string,
): Promise<WebhookEvent | null> {
  const payload = await request.text();
  const svixHeaders = {
    "svix-id": request.headers.get("svix-id") ?? "",
    "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
    "svix-signature": request.headers.get("svix-signature") ?? "",
  };

  try {
    new Webhook(secret).verify(payload, svixHeaders);
  } catch {
    return null;
  }
  return JSON.parse(payload) as WebhookEvent;
}
