"use client";

import * as React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Vehicle } from "@/types/vehicle";

interface VehicleSummaryCardProps {
  vehicle: Vehicle;
  imageUrl: string | null | undefined;
  /** Seasonal daily rate from useReservationPricing. */
  displayPricePerDay: number | null;
  days: number | null;
}

export const VehicleSummaryCard = React.memo(function VehicleSummaryCard({
  vehicle,
  imageUrl,
  displayPricePerDay,
  days,
}: VehicleSummaryCardProps) {
  const t = useTranslations("reservationPage");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("vehicleDetails.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 relative bg-muted rounded-lg overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`${vehicle.make} ${vehicle.model}`}
                fill
                style={{ objectFit: "cover" }}
                sizes="80px"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                {t("vehicleDetails.noImage")}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-muted-foreground">{vehicle.year}</p>
            <div>
              <p className="text-lg font-bold text-yellow-500">
                {t("vehicleDetails.pricePerDay", {
                  price: displayPricePerDay ?? 0,
                })}
              </p>
              {days &&
                vehicle.pricingTiers &&
                vehicle.pricingTiers.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {t("vehicleDetails.rateForDays", { days })}
                  </p>
                )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
