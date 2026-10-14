import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { getFunctionName } from "convex/server";
import enMessages from "@/messages/en.json";
import type { Id } from "@/convex/_generated/dataModel";
import { CarsPageClient } from "./cars-page-client";

const liveQueryResults = new Map<string, unknown>();

vi.mock("convex/react", () => ({
  useQuery: (query: Parameters<typeof getFunctionName>[0]) =>
    liveQueryResults.get(getFunctionName(query)),
}));

const cachedVehicle = {
  _id: "vehicle1" as Id<"vehicles">,
  _creationTime: 0,
  make: "Ford",
  model: "Kuga",
  status: "available" as const,
  pricingTiers: [{ minDays: 1, maxDays: 999, pricePerDay: 80 }],
  imageUrl: null,
};

const renderPage = () =>
  renderToString(
    <NextIntlClientProvider
      locale="en"
      messages={enMessages}
      timeZone="Europe/Bucharest"
    >
      <CarsPageClient initialVehicles={[cachedVehicle]} />
    </NextIntlClientProvider>,
  );

describe("CarsPageClient vehicle list", () => {
  beforeEach(() => liveQueryResults.clear());

  it("renders the cached vehicles until the live subscription loads", () => {
    expect(renderPage()).toContain("Kuga");
  });

  it("renders the live vehicles once an admin edit reaches the subscription", () => {
    liveQueryResults.set("vehicles:getAllVehiclesWithClasses", [
      { ...cachedVehicle, model: "Puma" },
    ]);

    const html = renderPage();

    expect(html).toContain("Puma");
    expect(html).not.toContain("Kuga");
  });
});
