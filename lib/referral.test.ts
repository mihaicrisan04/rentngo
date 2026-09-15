import { describe, expect, it } from "vitest";
import { buildReferralUrl, buildWhatsAppShareUrl } from "./referral";

describe("buildReferralUrl", () => {
  it("builds the /r/<slug> link for an origin", () => {
    expect(buildReferralUrl("https://rngo.ro", "ana-x7")).toBe(
      "https://rngo.ro/r/ana-x7",
    );
  });

  it("does not double the slash on a trailing-slash origin", () => {
    expect(buildReferralUrl("http://localhost:3000/", "ana-x7")).toBe(
      "http://localhost:3000/r/ana-x7",
    );
  });
});

describe("buildWhatsAppShareUrl", () => {
  it("percent-encodes the message, including the link", () => {
    expect(buildWhatsAppShareUrl("Cod ANA-X7: https://rngo.ro/r/ana-x7")).toBe(
      "https://wa.me/?text=Cod%20ANA-X7%3A%20https%3A%2F%2Frngo.ro%2Fr%2Fana-x7",
    );
  });

  it("encodes diacritics and the ampersand that would truncate the text", () => {
    expect(buildWhatsAppShareUrl("Închiriază & câștigă")).toBe(
      "https://wa.me/?text=%C3%8Enchiriaz%C4%83%20%26%20c%C3%A2%C8%99tig%C4%83",
    );
  });
});
