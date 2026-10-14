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

const fromPriceBadge = (html: string) =>
  html.match(/tabular-nums tracking-tight">(\d+)</)?.[1];

describe("CarsPageClient vehicle list", () => {
  beforeEach(() => {
    liveQueryResults.clear();
    liveQueryResults.set("seasons:getActive", []);
    liveQueryResults.set("seasons:getCurrent", { season: null });
  });

  it("renders the cached prices until the live subscription loads", () => {
    expect(fromPriceBadge(renderPage())).toBe("80");
  });

  it("renders the live prices once an admin edit reaches the subscription", () => {
    liveQueryResults.set("vehicles:getAllVehiclesWithClasses", [
      {
        ...cachedVehicle,
        pricingTiers: [{ minDays: 1, maxDays: 999, pricePerDay: 81 }],
      },
    ]);

    expect(fromPriceBadge(renderPage())).toBe("81");
  });
});
