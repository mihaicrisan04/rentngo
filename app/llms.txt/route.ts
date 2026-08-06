import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { COMPANY } from "@/lib/company";

/**
 * /llms.txt — spec-compliant (llmstxt.org) Markdown description of the
 * business for AI assistants and crawlers. English is the canonical language
 * (maximizes AI reach); both locale URL trees are linked.
 *
 * Routing note: proxy.ts early-returns for any path containing a dot, so this
 * route is served directly without the next-intl locale redirect (same as
 * /robots.txt and /sitemap.xml).
 */

const TRANSMISSION_LABELS: Record<string, string> = {
  automatic: "automatic",
  manual: "manual",
};

const FUEL_LABELS: Record<string, string> = {
  diesel: "diesel",
  electric: "electric",
  hybrid: "hybrid",
  benzina: "petrol",
};

function formatVehicleLine(vehicle: {
  make: string;
  model: string;
  year?: number;
  slug?: string;
  seats?: number;
  transmission?: "automatic" | "manual";
  fuelType?: "diesel" | "electric" | "hybrid" | "benzina";
  pricePerDayFrom: number | null;
  className?: string;
}): string {
  const name = [vehicle.make, vehicle.model, vehicle.year]
    .filter(Boolean)
    .join(" ");
  const price =
    vehicle.pricePerDayFrom !== null
      ? ` — from €${vehicle.pricePerDayFrom}/day`
      : "";
  const details = [
    vehicle.className,
    vehicle.seats ? `${vehicle.seats} seats` : undefined,
    vehicle.transmission ? TRANSMISSION_LABELS[vehicle.transmission] : undefined,
    vehicle.fuelType ? FUEL_LABELS[vehicle.fuelType] : undefined,
  ]
    .filter(Boolean)
    .join(", ");

  const label = `${name}${price}`;
  const suffix = details ? `: ${details}` : "";

  if (vehicle.slug) {
    return `- [${label}](${COMPANY.baseUrl}/en/cars/${vehicle.slug})${suffix}`;
  }
  return `- ${label}${suffix}`;
}

export async function GET() {
  let fleetSection = "";
  try {
    const fleet = await fetchQuery(api.vehicles.getFleetSummary);
    if (fleet.length > 0) {
      fleetSection = ["## Fleet", "", ...fleet.map(formatVehicleLine), ""].join(
        "\n"
      );
    }
  } catch {
    // Fleet data is best-effort; the static sections below still describe the
    // business if Convex is unreachable.
  }

  const content = `# ${COMPANY.name} — Car Rental & VIP Transfers in Cluj-Napoca, Romania

> Airport-based car rental and private VIP/airport transfer service in Cluj-Napoca, Romania. Modern fleet with tiered daily pricing, optional SCDW (zero-deposit) insurance, and 24/7 pickup at Cluj "Avram Iancu" International Airport (CLJ).

Key facts:

- Main location: ${COMPANY.address.streetAddress}, ${COMPANY.address.locality} ${COMPANY.address.postalCode}, Romania (delivery to other locations for a fee)
- Phone/WhatsApp: ${COMPANY.phone.display} · Email: ${COMPANY.email}
- Open 24/7, all year
- Languages: Romanian (${COMPANY.baseUrl}/ro) and English (${COMPANY.baseUrl}/en)
- Prices quoted in EUR, invoiced in RON at the National Bank of Romania sell rate +1%
- Minimum driver age 23, driving licence held for at least 2 years

Pricing model: daily rates are tiered by rental length (longer rentals get lower per-day rates) with seasonal multipliers. The rate includes an average of 200 km/day; extra distance costs €5/50 km (standard and business classes) or €8/50 km (premium). Security deposit €200–€1,800 depending on the vehicle, or optional SCDW insurance instead (reduces the deposit to zero). Fuel policy is full-to-full. VIP transfers are priced by distance.

${fleetSection}## Services

- [Car rental](${COMPANY.baseUrl}/en/cars): browse the fleet with tiered daily rates, filters by class, transmission and fuel, and online booking with pickup at Cluj airport or delivery on request.
- [VIP & airport transfers](${COMPANY.baseUrl}/en/transfers): private airport, city and business transfers in and around Cluj with professional drivers, priced by distance.

## Pages

- [FAQ](${COMPANY.baseUrl}/en/faq): documents, deposit, SCDW insurance, mileage, fuel and payment questions
- [About](${COMPANY.baseUrl}/en/about)
- [Contact](${COMPANY.baseUrl}/en/contact)
- [Blog](${COMPANY.baseUrl}/en/blog)
- [Terms and conditions](${COMPANY.baseUrl}/en/terms)
- Romanian versions of all pages live under ${COMPANY.baseUrl}/ro/

## Company

- Legal name: ${COMPANY.legalName} (trade register ${COMPANY.registration.tradeRegister}, CUI ${COMPANY.registration.cui})
- Registered office: ${COMPANY.registration.registeredOffice}
- Social: ${COMPANY.sameAs.join(" · ")}
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
