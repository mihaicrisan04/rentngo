import { describe, expect, it } from "vitest";
import { Webhook } from "svix";
import { verifyClerkWebhook } from "./clerkWebhook";

const SECRET = `whsec_${Buffer.from("test-signing-secret").toString("base64")}`;
const EVENT = {
  type: "user.created",
  object: "event",
  data: { id: "user_123", email_addresses: [] },
};

function signedRequest(
  payload: string,
  { secret = SECRET, msgId = "msg_1" } = {},
) {
  const timestamp = new Date();
  const signature = new Webhook(secret).sign(msgId, timestamp, payload);
  return new Request("https://example.convex.site/webhooks/clerk", {
    method: "POST",
    body: payload,
    headers: {
      "svix-id": msgId,
      "svix-timestamp": Math.floor(timestamp.getTime() / 1000).toString(),
      "svix-signature": signature,
    },
  });
}

describe("verifyClerkWebhook", () => {
  it("returns the parsed event for a correctly signed payload", async () => {
    const request = signedRequest(JSON.stringify(EVENT));

    await expect(verifyClerkWebhook(request, SECRET)).resolves.toEqual(EVENT);
  });

  it("rejects a payload signed with another secret", async () => {
    const otherSecret = `whsec_${Buffer.from("other").toString("base64")}`;
    const request = signedRequest(JSON.stringify(EVENT), {
      secret: otherSecret,
    });

    await expect(verifyClerkWebhook(request, SECRET)).resolves.toBeNull();
  });

  it("rejects a payload modified after signing", async () => {
    const signed = signedRequest(JSON.stringify(EVENT));
    const tampered = new Request(signed.url, {
      method: "POST",
      headers: signed.headers,
      body: JSON.stringify({ ...EVENT, type: "user.deleted" }),
    });

    await expect(verifyClerkWebhook(tampered, SECRET)).resolves.toBeNull();
  });

  it("rejects a request without svix headers", async () => {
    const request = new Request("https://example.convex.site/webhooks/clerk", {
      method: "POST",
      body: JSON.stringify(EVENT),
    });

    await expect(verifyClerkWebhook(request, SECRET)).resolves.toBeNull();
  });
});
