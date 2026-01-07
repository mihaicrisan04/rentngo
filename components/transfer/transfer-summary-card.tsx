"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Car,
  ArrowRight,
  Route,
} from "lucide-react";
import { LocationData } from "@/lib/transferStorage";
import { cn } from "@/lib/utils";
import { TransferRouteMap } from "@/components/transfer/transfer-route-map";

interface Coordinates {
  lng: number;
  lat: number;
}

interface TransferSummaryCardProps {
  pickupLocation: LocationData;
  dropoffLocation: LocationData;
  pickupCoordinates?: Coordinates;
  dropoffCoordinates?: Coordinates;
  pickupDate: Date;
  pickupTime: string;
  returnDate?: Date;
  returnTime?: string;
  transferType: "one_way" | "round_trip";
  passengers: number;
  distanceKm: number;
  estimatedDurationMinutes: number;
  vehicle?: {
    make: string;
    model: string;
    year?: number;
  } | null;
  pricing: {
    baseFare: number;
    distancePrice: number;
    totalPrice: number;
    pricePerKm: number;
  };
  className?: string;
}

export function TransferSummaryCard({
  pickupLocation,
  dropoffLocation,
  pickupCoordinates,
  dropoffCoordinates,
  pickupDate,
  pickupTime,
  returnDate,
  returnTime,
  transferType,
  passengers,
  distanceKm,
  estimatedDurationMinutes,
  vehicle,
  pricing,
  className,
}: TransferSummaryCardProps) {
  const t = useTranslations("transferPage");

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5" />
          {t("booking.summary")}
        </CardTitle>
        {pickupCoordinates && dropoffCoordinates && (
          <TransferRouteMap
            pickupCoordinates={pickupCoordinates}
            dropoffCoordinates={dropoffCoordinates}
            pickupLabel={pickupLocation.address.split(",")[0]}
            dropoffLabel={dropoffLocation.address.split(",")[0]}
            className="h-[100px] w-full mt-3 opacity-75"
            compact
          />
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <div className="w-0.5 h-8 bg-border" />
              <div className="h-3 w-3 rounded-full bg-red-500" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Pickup
                </p>
                <p className="font-medium text-sm leading-tight">
                  {pickupLocation.address}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Dropoff
                </p>
                <p className="font-medium text-sm leading-tight">
                  {dropoffLocation.address}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="font-medium">{format(pickupDate, "EEE, MMM d")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Time</p>
              <p className="font-medium">{pickupTime}</p>
            </div>
          </div>
        </div>

        {transferType === "round_trip" && returnDate && returnTime && (
          <>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ArrowRight className="h-3 w-3 rotate-180" />
              <span>Return Trip</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Return Date</p>
                  <p className="font-medium">{format(returnDate, "EEE, MMM d")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Return Time</p>
                  <p className="font-medium">{returnTime}</p>
                </div>
              </div>
            </div>
          </>
        )}

        <Separator />

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{passengers} {passengers === 1 ? "Passenger" : "Passengers"}</span>
          </div>
          <Badge variant="outline">
            {transferType === "one_way" ? t("searchForm.oneWay") : t("searchForm.roundTrip")}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{distanceKm} km</span>
          </div>
          <span className="text-muted-foreground">
            ~{formatDuration(estimatedDurationMinutes)}
          </span>
        </div>

        {vehicle && (
          <>
            <Separator />
            <div className="flex items-center gap-2 text-sm">
              <Car className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {vehicle.make} {vehicle.model}
                </p>
                {vehicle.year && (
                  <p className="text-xs text-muted-foreground">{vehicle.year}</p>
                )}
              </div>
            </div>
          </>
        )}

        <Separator />

        <div className="space-y-2">
          {distanceKm < 20 ? (
            // Short distance: show base fare only
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("pricing.basePrice")} ({distanceKm} km)</span>
              <span>€{pricing.baseFare.toFixed(2)}</span>
            </div>
          ) : (
            // Long distance: show distance calculation only
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Distance ({distanceKm} km × €{pricing.pricePerKm.toFixed(2)})
              </span>
              <span>€{pricing.distancePrice.toFixed(2)}</span>
            </div>
          )}
          {transferType === "round_trip" && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Round trip (×2)</span>
              <span>Included</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-baseline border-t pt-4">
        <span className="font-semibold">{t("pricing.totalPrice")}</span>
        <span className="text-2xl font-bold text-primary">
          €{pricing.totalPrice.toFixed(2)}
        </span>
      </CardFooter>
    </Card>
  );
}

export default TransferSummaryCard;
