import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import enMessages from "@/messages/en.json";
import { StatusBadge } from "./status-badge";

// The admin tree pins next-intl to "en" with messages/en.json (app/admin/layout.tsx),
// so StatusBadge must render there without a locale route segment.
describe("StatusBadge under the admin intl provider", () => {
  const render = (status: string) =>
    renderToString(
      <NextIntlClientProvider
        locale="en"
        messages={enMessages}
        timeZone="Europe/Bucharest"
      >
        <StatusBadge status={status} />
      </NextIntlClientProvider>,
    );

  it("renders a translated label for a known status", () => {
    expect(render("pending")).toContain("Pending");
    expect(render("confirmed")).toContain("Confirmed");
  });

  it("falls back to pending for unknown statuses", () => {
    expect(render("bogus")).toContain("Pending");
  });

  it("en messages contain every common.status key", () => {
    const status = (enMessages as { common: { status: Record<string, string> } })
      .common.status;
    for (const key of [
      "pending",
      "confirmed",
      "active",
      "completed",
      "cancelled",
    ]) {
      expect(status[key], `missing common.status.${key}`).toBeTruthy();
    }
  });
});
