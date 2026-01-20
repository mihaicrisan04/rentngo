"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDateBasedSeasonalPricing } from "@/hooks/useDateBasedSeasonalPricing";
import { PriceDetails, calculateIncludedKilometers } from "@/lib/vehicleUtils";
import { getPriceForDuration, getBasePricePerDay } from "@/types/vehicle";
import { Vehicle } from "@/types/vehicle";
import { useTranslations, useLocale } from "next-intl";

interface VehiclePricingCardProps {
  vehicle: Vehicle;
  priceDetails: PriceDetails;
  currency?: string;
  deliveryLocation?: string;
  restitutionLocation?: string;
  pickupDate?: Date | null;
  returnDate?: Date | null;
}

export function VehiclePricingCard({
  vehicle,
  priceDetails,
  currency = "EUR",
  deliveryLocation,
  restitutionLocation,
  pickupDate,
  returnDate,
}: VehiclePricingCardProps) {
  const t = useTranslations("vehiclePricing");
  const locale = useLocale();
  const { multiplier: seasonalMultiplier } = useDateBasedSeasonalPricing(
    pickupDate,
    returnDate,
  );
  const {
    basePrice,
    totalPrice,
    days,
    deliveryFee,
    returnFee,
    totalLocationFees,
  } = priceDetails;

  // Extract price per day from priceDetails (already includes seasonal adjustment)
  const currentPricePerDay =
    days && basePrice !== null
      ? Math.round(basePrice / days)
      : Math.round(getBasePricePerDay(vehicle) * seasonalMultiplier);

  // Calculate potential savings for longer rentals
  const getPricingTip = () => {
    if (!vehicle.pricingTiers || vehicle.pricingTiers.length <= 1) return null;

    // Calculate prices with seasonal adjustment for each tier
    const prices = vehicle.pricingTiers.map((tier) =>
      Math.round(
        getPriceForDuration(vehicle, tier.minDays) * seasonalMultiplier,
      ),
    );
    const lowestPrice = Math.min(...prices);

    const savings = currentPricePerDay - lowestPrice;

    if (savings > 0) {
      // Find the tier with the lowest seasonally-adjusted price
      const bestTier = vehicle.pricingTiers.find(
        (tier) =>
          Math.round(
            getPriceForDuration(vehicle, tier.minDays) * seasonalMultiplier,
          ) === lowestPrice,
      );
      return {
        savings,
        minDaysForBest: bestTier?.minDays || 1,
        lowestPrice,
      };
    }
    return null;
  };

  const pricingTip = getPricingTip();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Price per day */}
          <div className="text-center">
            <span className="text-3xl font-bold text-yellow-500">
              {currentPricePerDay}
            </span>
            <span className="text-lg text-muted-foreground ml-2">
              {currency} / {t("day")}
            </span>
            {days && vehicle.pricingTiers && vehicle.pricingTiers.length > 0 ? (
              <div className="text-sm text-muted-foreground mt-1">
                {t("rateFor", {
                  days,
                  plural:
                    locale === "ro"
                      ? days === 1
                        ? ""
                        : "le"
                      : days === 1
                        ? ""
                        : "s",
                })}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground mt-1">
                {t("startingRate")}
              </div>
            )}
          </div>

          {/* Pricing tip for better rates */}
          {pricingTip && !days && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-bold">💡</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-blue-800 font-medium">
                    {t("savingsTitle", {
                      savings: pricingTip.savings,
                      currency,
                    })}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {t("savingsDescription", {
                      minDays: pricingTip.minDaysForBest,
                      lowestPrice: pricingTip.lowestPrice,
                      currency,
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Show savings tip when dates are selected but user could get better rate */}
          {pricingTip && days && days < pricingTip.minDaysForBest && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-bold">💰</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-green-800 font-medium">
                    {t("extendSavingsTitle", {
                      savings: pricingTip.savings,
                      currency,
                    })}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {t("extendSavingsDescription", {
                      minDays: pricingTip.minDaysForBest,
                      lowestPrice: pricingTip.lowestPrice,
                      currentPrice: currentPricePerDay,
                      currency,
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Total price if dates are available */}
          {totalPrice !== null && days !== null && basePrice !== null && (
            <>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    {t("basePrice", {
                      days,
                      plural:
                        locale === "ro"
                          ? days === 1
                            ? ""
                            : "le"
                          : days === 1
                            ? ""
                            : "s",
                      currentPrice: currentPricePerDay,
                      currency,
                    })}
                    :
                  </span>
                  <span className="text-muted-foreground">
                    {basePrice} {currency}
                  </span>
                </div>

                {deliveryFee > 0 && deliveryLocation && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      {t("pickupLocationFee", { location: deliveryLocation })}:
                    </span>
                    <span className="text-muted-foreground">
                      +{deliveryFee} {currency}
                    </span>
                  </div>
                )}

                {returnFee > 0 && restitutionLocation && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      {t("returnLocationFee", {
                        location: restitutionLocation,
                      })}
                      :
                    </span>
                    <span className="text-muted-foreground">
                      +{returnFee} {currency}
                    </span>
                  </div>
                )}

                {totalLocationFees > 0 && (
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-muted-foreground">
                      {t("totalLocationFees")}:
                    </span>
                    <span className="text-muted-foreground">
                      +{totalLocationFees} {currency}
                    </span>
                  </div>
                )}

                {/* Kilometers included */}
                {days && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      {t("kilometersIncluded")}:
                    </span>
                    <span className="text-muted-foreground">
                      {calculateIncludedKilometers(days)} km
                    </span>
                  </div>
                )}

                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">
                      {t("totalPrice")}:
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      {totalPrice} {currency}
                    </span>
                  </div>
                  {days && (
                    <div className="text-right text-sm text-muted-foreground">
                      {t("forDays", {
                        days,
                        plural:
                          locale === "ro"
                            ? days === 1
                              ? ""
                              : "le"
                            : days === 1
                              ? ""
                              : "s",
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Show message when no dates are selected */}
          {totalPrice === null && (
            <div className="text-center text-sm text-muted-foreground py-4">
              {t("selectDatesMessage")}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
