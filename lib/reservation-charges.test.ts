import { describe, expect, it } from "vitest";
import { buildLegacyChargeDescriptions } from "./reservation-charges";
import type { ReservationCharge } from "./pricing";

// Echo translator: records the key + params so the assertions pin the exact
// legacy message contract the email templates depend on.
const t = (key: string, params: Record<string, string | number>) =>
  `${key} ${JSON.stringify(params)}`;

describe("buildLegacyChargeDescriptions", () => {
  it("maps location fees with their location param", () => {
    const charges: ReservationCharge[] = [
      {
        code: "pickupLocationFee",
        params: { location: "Cluj-Napoca Centru" },
        amount: 20,
      },
      {
        code: "returnLocationFee",
        params: { location: "Aeroport Cluj-Napoca" },
        amount: 0,
      },
    ];
    expect(buildLegacyChargeDescriptions(charges, t)).toEqual([
      {
        description:
          'payment.additionalCharges.pickupLocationFee {"location":"Cluj-Napoca Centru"}',
        amount: 20,
      },
      {
        description:
          'payment.additionalCharges.returnLocationFee {"location":"Aeroport Cluj-Napoca"}',
        amount: 0,
      },
    ]);
  });

  it("maps physical extras with the historical params (days/count/price)", () => {
    const charges: ReservationCharge[] = [
      { code: "snowChains", params: { days: 4 }, amount: 12 },
      { code: "childSeat1to4", params: { count: 2, days: 4 }, amount: 24 },
      { code: "childSeat5to12", params: { count: 1, days: 4 }, amount: 12 },
    ];
    expect(buildLegacyChargeDescriptions(charges, t)).toEqual([
      {
        description:
          'payment.additionalCharges.snowChains {"days":4,"price":12}',
        amount: 12,
      },
      {
        description:
          'payment.additionalCharges.childSeat1to4 {"count":2,"days":4,"price":24}',
        amount: 24,
      },
      {
        description:
          'payment.additionalCharges.childSeat5to12 {"count":1,"days":4,"price":12}',
        amount: 12,
      },
    ]);
  });

  it("derives the extra-km package count from the km param", () => {
    const charges: ReservationCharge[] = [
      { code: "extraKm", params: { km: 150 }, amount: 15 },
    ];
    expect(buildLegacyChargeDescriptions(charges, t)).toEqual([
      {
        description:
          'payment.additionalCharges.extraKilometers {"count":3,"kilometers":150,"price":15}',
        amount: 15,
      },
    ]);
  });
});
