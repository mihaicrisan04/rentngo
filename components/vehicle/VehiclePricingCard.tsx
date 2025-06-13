"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSeasonalPricing } from "@/hooks/useSeasonalPricing";
import { PriceDetails, getPriceForDurationWithSeason } from "@/lib/vehicleUtils";
import { Vehicle, getPriceForDuration } from "@/types/vehicle";

interface VehiclePricingCardProps {
  vehicle: Vehicle;
  priceDetails: PriceDetails;
  currency?: string;
  deliveryLocation?: string;
  restitutionLocation?: string;
}

export function VehiclePricingCard({
  vehicle,
  priceDetails,
  currency = "EUR",
  deliveryLocation,
  restitutionLocation
}: VehiclePricingCardProps) {
  const { multiplier: currentMultiplier, currentSeason } = useSeasonalPricing();
  const { basePrice, totalPrice, days, deliveryFee, returnFee, totalLocationFees } = priceDetails;

  // Get the appropriate price per day based on rental duration
  const currentPricePerDay = days ? getPriceForDurationWithSeason(vehicle, days, currentMultiplier) : 
    (vehicle.pricingTiers && vehicle.pricingTiers.length > 0 ? 
      Math.max(...vehicle.pricingTiers.map(tier => tier.pricePerDay)) : 
      vehicle.pricePerDay);

  // Calculate potential savings for longer rentals
  const getPricingTip = () => {
    if (!vehicle.pricingTiers || vehicle.pricingTiers.length <= 1) return null;
    const prices = vehicle.pricingTiers.map(tier => getPriceForDurationWithSeason(vehicle, tier.minDays, currentMultiplier));
    const highestPrice = Math.max(...prices);
    const lowestPrice = Math.min(...prices);

    const savings = currentPricePerDay - lowestPrice;
    
    if (savings > 0) {
      // Find the tier with the lowest seasonally-adjusted price to show the minimum days needed
      const bestTier = vehicle.pricingTiers.find(tier => 
        getPriceForDurationWithSeason(vehicle, tier.minDays, currentMultiplier) === lowestPrice
      );
      return {
        savings,
        minDaysForBest: bestTier?.minDays || 1,
        lowestPrice
      };
    }
    return null;
  };

  const pricingTip = getPricingTip();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Price per day */}
          <div className="text-center">
            <span className="text-3xl font-bold text-yellow-500">
              {currentPricePerDay}
            </span>
            <span className="text-lg text-muted-foreground ml-2">
              {currency} / Day
            </span>
            {days && vehicle.pricingTiers && vehicle.pricingTiers.length > 0 ? (
              <div className="text-sm text-muted-foreground mt-1">
                Rate for {days} day{days === 1 ? "" : "s"} rental
              </div>
            ) : (
              <div className="text-sm text-muted-foreground mt-1">
                Starting from this rate
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
                    Save up to {pricingTip.savings} {currency}/day on longer rentals!
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Rent for {pricingTip.minDaysForBest}+ days and pay only {pricingTip.lowestPrice} {currency}/day
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
                    Extend your rental to save {pricingTip.savings} {currency}/day!
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Rent for {pricingTip.minDaysForBest}+ days and pay only {pricingTip.lowestPrice} {currency}/day instead of {currentPricePerDay} {currency}/day
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
                    Base price ({days} day{days === 1 ? "" : "s"} @ {currentPricePerDay} {currency}/day):
                  </span>
                  <span className="text-muted-foreground">
                    {basePrice} {currency}
                  </span>
                </div>

                {deliveryFee > 0 && deliveryLocation && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Pick-up location fee ({deliveryLocation}):
                    </span>
                    <span className="text-muted-foreground">
                      +{deliveryFee} {currency}
                    </span>
                  </div>
                )}

                {returnFee > 0 && restitutionLocation && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Return location fee ({restitutionLocation}):
                    </span>
                    <span className="text-muted-foreground">
                      +{returnFee} {currency}
                    </span>
                  </div>
                )}

                {totalLocationFees > 0 && (
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-muted-foreground">
                      Total location fees:
                    </span>
                    <span className="text-muted-foreground">
                      +{totalLocationFees} {currency}
                    </span>
                  </div>
                )}

                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Price:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {totalPrice} {currency}
                    </span>
                  </div>
                  {days && (
                    <div className="text-right text-sm text-muted-foreground">
                      for {days} day{days === 1 ? "" : "s"}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Show message when no dates are selected */}
          {totalPrice === null && (
            <div className="text-center text-sm text-muted-foreground py-4">
              Select pickup and return dates to see total pricing
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 