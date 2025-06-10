"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriceDetails } from "@/lib/vehicleUtils";

interface VehiclePricingCardProps {
  pricePerDay: number;
  priceDetails: PriceDetails;
  currency?: string;
  deliveryLocation?: string;
  restitutionLocation?: string;
}

export function VehiclePricingCard({
  pricePerDay,
  priceDetails,
  currency = "EUR",
  deliveryLocation,
  restitutionLocation
}: VehiclePricingCardProps) {
  const { basePrice, totalPrice, days, deliveryFee, returnFee, totalLocationFees } = priceDetails;

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
              {pricePerDay}
            </span>
            <span className="text-lg text-muted-foreground ml-2">
              {currency} / Day
            </span>
          </div>

          {/* Total price if dates are available */}
          {totalPrice !== null && days !== null && basePrice !== null && (
            <>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    Base price ({days} day{days === 1 ? "" : "s"}):
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