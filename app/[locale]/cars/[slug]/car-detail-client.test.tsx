import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { getFunctionName } from "convex/server";
import enMessages from "@/messages/en.json";
import type { Id } from "@/convex/_generated/dataModel";
import type { Vehicle } from "@/types/vehicle";
import { CarDetailClient } from "./car-detail-client";

const liveQueryResults = new Map<string, unknown>();

vi.mock("convex/react", () => ({
  useQuery: (query: Parameters<typeof getFunctionName>[0]) =>
    liveQueryResults.get(getFunctionName(query)),
}));

const cachedVehicle: Vehicle = {
  _id: "vehicle1" as Id<"vehicles">,
  _creationTime: 0,
  make: "Ford",
  model: "Kuga",
  year: 2022,
  slug: "ford-kuga-2022",
  status: "available",
  pricingTiers: [{ minDays: 1, maxDays: 999, pricePerDay: 80 }],
};

const renderPage = () =>
  renderToString(
    <NextIntlClientProvider
      locale="en"
      messages={enMessages}
      timeZone="Europe/Bucharest"
    >
      <CarDetailClient
        initialVehicle={cachedVehicle}
        mainImageUrl={null}
        imageUrls={{}}
      />
    </NextIntlClientProvider>,
  );

describe("CarDetailClient pricing tiers", () => {
  beforeEach(() => liveQueryResults.clear());

  it("renders the cached tiers until the live subscription loads", () => {
    expect(renderPage()).toContain("€<!-- -->80.00");
  });

  it("renders the live tiers once an admin edit reaches the subscription", () => {
    liveQueryResults.set("vehicles:getById", {
      ...cachedVehicle,
      pricingTiers: [{ minDays: 1, maxDays: 999, pricePerDay: 81 }],
    });

    const html = renderPage();

    expect(html).toContain("€<!-- -->81.00");
    expect(html).not.toContain("€<!-- -->80.00");
  });
});
