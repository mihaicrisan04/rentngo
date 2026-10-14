import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { getFunctionName } from "convex/server";
import enMessages from "@/messages/en.json";
import type { Id } from "@/convex/_generated/dataModel";
import { HomePageClient } from "./home-page-client";

const liveQueryResults = new Map<string, unknown>();
const subscribedQueries = new Set<string>();

vi.mock("convex/react", () => ({
  useQuery: (query: Parameters<typeof getFunctionName>[0], args: unknown) => {
    if (args === "skip") return undefined;
    const name = getFunctionName(query);
    subscribedQueries.add(name);
    return liveQueryResults.get(name);
  },
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const vehicle = (model: string) => ({
  _id: `vehicle-${model}` as Id<"vehicles">,
  _creationTime: 0,
  make: "Ford",
  model,
  status: "available" as const,
  pricingTiers: [{ minDays: 1, maxDays: 999, pricePerDay: 80 }],
  imageUrl: null,
});

const renderPage = () =>
  renderToString(
    <NextIntlClientProvider
      locale="en"
      messages={enMessages}
      timeZone="Europe/Bucharest"
    >
      <HomePageClient
        initialVehicles={{
          vehicles: [vehicle("Kuga")],
          titleKey: "featuredCars",
        }}
      />
    </NextIntlClientProvider>,
  );

describe("HomePageClient vehicles", () => {
  beforeEach(() => {
    liveQueryResults.clear();
    subscribedQueries.clear();
  });

  it("renders the cached vehicles until the live subscription loads", () => {
    const html = renderPage();

    expect(html).toContain("Kuga");
    expect(html).toContain("Featured Cars");
  });

  it("renders the live featured vehicles once an admin edit reaches the subscription", () => {
    liveQueryResults.set("featuredCars:getFeaturedVehicles", [vehicle("Puma")]);

    const html = renderPage();

    expect(html).toContain("Puma");
    expect(html).not.toContain("Kuga");
    expect(subscribedQueries).not.toContain(
      "vehicles:getAllVehiclesWithClasses",
    );
  });

  it("keeps the cached vehicles while the latest-vehicles fallback loads", () => {
    liveQueryResults.set("featuredCars:getFeaturedVehicles", []);

    const html = renderPage();

    expect(html).toContain("Kuga");
    expect(html).toContain("Featured Cars");
  });

  it("falls back to the latest vehicles when every featured car is removed", () => {
    liveQueryResults.set("featuredCars:getFeaturedVehicles", []);
    liveQueryResults.set("vehicles:getAllVehiclesWithClasses", [
      vehicle("Fiesta"),
    ]);

    const html = renderPage();

    expect(html).toContain("Fiesta");
    expect(html).toContain("Our Latest Cars");
    expect(html).not.toContain("Kuga");
  });
});
