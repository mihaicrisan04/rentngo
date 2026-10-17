import { EXTRA_KM_PACKAGE_SIZE, type ReservationCharge } from "./pricing";

export interface LegacyChargeDescription {
  description: string;
  amount: number;
}

type ChargeTranslator = (
  key: string,
  params: Record<string, string | number>,
) => string;

/**
 * TRANSITIONAL: rebuild the localized prose line items from the structured
 * pricing breakdown, using the legacy `reservationPage.payment
 * .additionalCharges.*` keys with their exact historical params. The server
 * persists only the coded charges; this prose travels in the mutation args
 * solely because the email templates still render it. Delete together with
 * those keys once RNGO-19 gives the templates a coded-charge catalog.
 */
export function buildLegacyChargeDescriptions(
  charges: ReservationCharge[],
  t: ChargeTranslator,
): LegacyChargeDescription[] {
  return charges.map((charge) => {
    const { code, params, amount } = charge;
    switch (code) {
      case "pickupLocationFee":
      case "returnLocationFee":
        return {
          description: t(`payment.additionalCharges.${code}`, {
            location: params.location,
          }),
          amount,
        };
      case "snowChains":
        return {
          description: t("payment.additionalCharges.snowChains", {
            days: params.days,
            price: amount,
          }),
          amount,
        };
      case "childSeat1to4":
      case "childSeat5to12":
        return {
          description: t(`payment.additionalCharges.${code}`, {
            count: params.count,
            days: params.days,
            price: amount,
          }),
          amount,
        };
      case "extraKm": {
        const km = Number(params.km);
        return {
          description: t("payment.additionalCharges.extraKilometers", {
            count: km / EXTRA_KM_PACKAGE_SIZE,
            kilometers: km,
            price: amount,
          }),
          amount,
        };
      }
    }
  });
}
