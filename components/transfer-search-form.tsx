"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Users, ArrowRight, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

import { MapboxLocationSearch, LocationData } from "./mapbox-location-search";
import { DateTimePicker } from "./date-time-picker";
import {
  transferStorage,
  TransferSearchData,
} from "@/lib/transferStorage";
import { getRouteInfo, RouteInfo } from "@/lib/mapbox";

interface TransferSearchFormProps {
  initialData?: TransferSearchData;
  onRouteCalculated?: (routeInfo: RouteInfo | null) => void;
}

export function TransferSearchForm({
  initialData,
  onRouteCalculated,
}: TransferSearchFormProps) {
  const router = useRouter();
  const t = useTranslations("transferPage");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [pickupLocation, setPickupLocation] =
    React.useState<LocationData | null>(initialData?.pickupLocation || null);
  const [dropoffLocation, setDropoffLocation] =
    React.useState<LocationData | null>(initialData?.dropoffLocation || null);
  const [pickupDate, setPickupDate] = React.useState<Date | undefined>(
    initialData?.pickupDate,
  );
  const [pickupTime, setPickupTime] = React.useState<string | null>(
    initialData?.pickupTime || null,
  );
  const [returnDate, setReturnDate] = React.useState<Date | undefined>(
    initialData?.returnDate,
  );
  const [returnTime, setReturnTime] = React.useState<string | null>(
    initialData?.returnTime || null,
  );
  const [passengers, setPassengers] = React.useState<number>(
    initialData?.passengers || 1,
  );
  const [transferType, setTransferType] = React.useState<
    "one_way" | "round_trip"
  >(initialData?.transferType || "one_way");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCalculatingRoute, setIsCalculatingRoute] = React.useState(false);
  const [routeInfo, setRouteInfo] = React.useState<RouteInfo | null>(null);
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    const stored = transferStorage.load();
    if (stored.pickupLocation) setPickupLocation(stored.pickupLocation);
    if (stored.dropoffLocation) setDropoffLocation(stored.dropoffLocation);
    if (stored.pickupDate) setPickupDate(stored.pickupDate);
    if (stored.pickupTime) setPickupTime(stored.pickupTime);
    if (stored.returnDate) setReturnDate(stored.returnDate);
    if (stored.returnTime) setReturnTime(stored.returnTime);
    if (stored.passengers) setPassengers(stored.passengers);
    if (stored.transferType) setTransferType(stored.transferType);
    if (stored.distanceKm && stored.estimatedDurationMinutes) {
      setRouteInfo({
        distanceKm: stored.distanceKm,
        durationMinutes: stored.estimatedDurationMinutes,
      });
    }
    setIsHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!isHydrated) return;

    transferStorage.save({
      pickupLocation: pickupLocation || undefined,
      dropoffLocation: dropoffLocation || undefined,
      pickupDate,
      pickupTime,
      returnDate,
      returnTime,
      passengers,
      transferType,
      distanceKm: routeInfo?.distanceKm,
      estimatedDurationMinutes: routeInfo?.durationMinutes,
    });
  }, [
    pickupLocation,
    dropoffLocation,
    pickupDate,
    pickupTime,
    returnDate,
    returnTime,
    passengers,
    transferType,
    routeInfo,
    isHydrated,
  ]);

  React.useEffect(() => {
    const calculateRoute = async () => {
      if (!pickupLocation || !dropoffLocation) {
        setRouteInfo(null);
        onRouteCalculated?.(null);
        return;
      }

      setIsCalculatingRoute(true);
      try {
        const info = await getRouteInfo(
          pickupLocation.coordinates,
          dropoffLocation.coordinates,
        );
        setRouteInfo(info);
        onRouteCalculated?.(info);
      } catch (error) {
        console.error("Failed to calculate route:", error);
        setRouteInfo(null);
        onRouteCalculated?.(null);
      } finally {
        setIsCalculatingRoute(false);
      }
    };

    calculateRoute();
  }, [pickupLocation, dropoffLocation, onRouteCalculated]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!pickupLocation || !dropoffLocation || !pickupDate || !pickupTime) {
      setIsLoading(false);
      return;
    }

    if (transferType === "round_trip" && (!returnDate || !returnTime)) {
      setIsLoading(false);
      return;
    }

    if (pickupDate && returnDate && transferType === "round_trip") {
      if (returnDate < pickupDate) {
        setIsLoading(false);
        return;
      }
    }

    transferStorage.save({
      pickupLocation,
      dropoffLocation,
      pickupDate,
      pickupTime,
      returnDate: transferType === "round_trip" ? returnDate : undefined,
      returnTime: transferType === "round_trip" ? returnTime : undefined,
      passengers,
      transferType,
      distanceKm: routeInfo?.distanceKm,
      estimatedDurationMinutes: routeInfo?.durationMinutes,
      selectedVehicleId: undefined,
    });

    router.push("/transfers/vehicles");
  };

  const canSearch =
    pickupLocation &&
    dropoffLocation &&
    pickupDate &&
    pickupTime &&
    (transferType === "one_way" || (returnDate && returnTime));

  return (
    <Card className="w-full shadow-xl relative">
      <form onSubmit={handleSubmit}>
        <CardContent className="p-4 lg:p-6 pb-0">
          <div className="mb-6">
            <Label className="text-sm font-medium mb-3 block">
              {t("searchForm.transferType")}
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={transferType === "one_way" ? "default" : "outline"}
                onClick={() => setTransferType("one_way")}
                size="sm"
              >
                {t("searchForm.oneWay")}
              </Button>
              <Button
                type="button"
                variant={transferType === "round_trip" ? "default" : "outline"}
                onClick={() => setTransferType("round_trip")}
                size="sm"
              >
                {t("searchForm.roundTrip")}
              </Button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 overflow-hidden">
            <div className="flex flex-col gap-4 w-full lg:w-1/2 min-w-0">
              <MapboxLocationSearch
                id="pickupLocation"
                label={t("searchForm.pickupLocation")}
                placeholder={t("searchForm.pickupLocationPlaceholder")}
                value={pickupLocation}
                onSelect={setPickupLocation}
                disabled={isLoading}
              />
              <DateTimePicker
                id="pickupDateTime"
                label={t("searchForm.pickupDateTime")}
                dateState={pickupDate}
                setDateState={setPickupDate}
                timeState={pickupTime}
                setTimeState={setPickupTime}
                minDate={today}
                disabledDateRanges={(date: Date) => date < today}
                popoverAlign="start"
                contentAlign="start"
                isLoading={isLoading}
                onDateChange={(newDate) => {
                  if (newDate && returnDate && returnDate < newDate) {
                    setReturnDate(newDate);
                  }
                }}
              />
            </div>

            <div className="hidden lg:flex justify-center items-center">
              <div className="flex flex-col items-center gap-2">
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                {transferType === "round_trip" && (
                  <ArrowRight className="h-6 w-6 text-muted-foreground rotate-180" />
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full lg:w-1/2 min-w-0">
              <MapboxLocationSearch
                id="dropoffLocation"
                label={t("searchForm.dropoffLocation")}
                placeholder={t("searchForm.dropoffLocationPlaceholder")}
                value={dropoffLocation}
                onSelect={setDropoffLocation}
                disabled={isLoading}
              />

              {transferType === "round_trip" && (
                <DateTimePicker
                  id="returnDateTime"
                  label={t("searchForm.returnDateTime")}
                  dateState={returnDate}
                  setDateState={setReturnDate}
                  timeState={returnTime}
                  setTimeState={setReturnTime}
                  minDate={pickupDate || today}
                  disabledDateRanges={(date: Date) => date < (pickupDate || today)}
                  popoverAlign="end"
                  contentAlign="start"
                  isLoading={isLoading}
                  pickupDate={pickupDate}
                  pickupTime={pickupTime}
                />
              )}
            </div>
          </div>

          <div className="mt-6">
            <Label
              htmlFor="passengers"
              className="text-sm font-medium mb-1.5 block"
            >
              {t("searchForm.passengers")}
            </Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <NativeSelect
                id="passengers"
                value={passengers.toString()}
                onChange={(e) => setPassengers(parseInt(e.target.value))}
                className="w-full h-12 pl-10"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <NativeSelectOption key={num} value={num.toString()}>
                    {t("searchForm.passengerCount", { count: num })}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          </div>

          {routeInfo && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-muted-foreground">
                      {t("vehicleSelection.distanceLabel")}:{" "}
                    </span>
                    <span className="font-medium">{routeInfo.distanceKm} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("vehicleSelection.durationLabel")}:{" "}
                    </span>
                    <span className="font-medium">
                      {routeInfo.durationMinutes < 60
                        ? `${routeInfo.durationMinutes} min`
                        : `${Math.floor(routeInfo.durationMinutes / 60)}h ${routeInfo.durationMinutes % 60}min`}
                    </span>
                  </div>
                </div>
                {isCalculatingRoute && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>
          )}

          {isCalculatingRoute && !routeInfo && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Calculating route...</span>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center pt-4 lg:pt-8 sm:pt-6 lg:p-6 md:pt-8">
          <Button
            type="submit"
            size="lg"
            className="w-full lg:w-auto lg:px-12 text-base py-3"
            disabled={isLoading || !canSearch || isCalculatingRoute}
          >
            <Search className="mr-2 h-5 w-5" />
            {isLoading
              ? t("searchForm.searching")
              : t("searchForm.searchTransfers")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}