"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { Car, AlertCircle } from "lucide-react";
import {
  TransferVehicleCard,
  type TransferVehicle,
} from "./transfer-vehicle-card";

interface TransferVehicleListProps {
  passengers: number;
  distanceKm: number;
  transferType: "one_way" | "round_trip";
  selectedVehicleId?: Id<"vehicles"> | null;
  onSelectVehicle: (vehicleId: Id<"vehicles">) => void;
}

function VehicleCardSkeleton() {
  return (
    <div className="flex flex-col bg-card rounded-lg shadow-md overflow-hidden">
      <Skeleton className="aspect-[16/10] w-full" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-px w-full" />
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <Skeleton className="h-px w-full" />
        <div className="flex justify-between items-baseline">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-10 w-full mt-2" />
      </div>
    </div>
  );
}

export function TransferVehicleList({
  passengers,
  distanceKm,
  transferType,
  selectedVehicleId,
  onSelectVehicle,
}: TransferVehicleListProps) {
  const t = useTranslations("transferPage");

  const vehiclesData = useQuery(api.transfers.getTransferVehiclesWithImages, {
    minSeats: passengers,
    distanceKm: distanceKm,
    transferType: transferType,
  });

  const isLoading = vehiclesData === undefined;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">{t("vehicleSelection.title")}</h2>
          <p className="text-muted-foreground mt-1">
            {t("vehicleSelection.subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <VehicleCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!vehiclesData || vehiclesData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">{t("vehicleSelection.title")}</h2>
          <p className="text-muted-foreground mt-1">
            {t("vehicleSelection.subtitle")}
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="bg-muted rounded-full p-4 mb-4">
            <Car className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {t("vehicleSelection.noVehiclesFound")}
          </h3>
          <p className="text-muted-foreground text-center max-w-md">
            No vehicles available for {passengers}{" "}
            {passengers === 1 ? "passenger" : "passengers"}. Try reducing the
            passenger count.
          </p>
        </div>
      </div>
    );
  }

  const vehicles: TransferVehicle[] = vehiclesData.map((v) => ({
    _id: v._id,
    make: v.make,
    model: v.model,
    year: v.year,
    seats: v.seats,
    transmission: v.transmission,
    fuelType: v.fuelType,
    transferPricePerKm: v.transferPricePerKm,
    transferBaseFare: v.transferBaseFare,
    classMultiplier: v.classMultiplier,
    distanceCharge: v.distanceCharge,
    calculatedPrice: v.calculatedPrice,
    features: v.features,
    imageUrl: v.imageUrl,
  }));

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">{t("vehicleSelection.title")}</h2>
        <p className="text-muted-foreground mt-1">
          {t("vehicleSelection.subtitle")}
        </p>
      </div>

      <div className="flex items-center justify-center gap-6 text-sm bg-muted/50 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            {t("vehicleSelection.distanceLabel")}:
          </span>
          <span className="font-medium">{distanceKm} km</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            {t("searchForm.passengers")}:
          </span>
          <span className="font-medium">{passengers}</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            {t("searchForm.transferType")}:
          </span>
          <span className="font-medium capitalize">
            {transferType === "one_way" ? t("searchForm.oneWay") : t("searchForm.roundTrip")}
          </span>
        </div>
      </div>

      {distanceKm <= 0 && (
        <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0" />
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            Unable to calculate route distance. Please check your pickup and
            dropoff locations.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <TransferVehicleCard
            key={vehicle._id}
            vehicle={vehicle}
            distanceKm={distanceKm}
            transferType={transferType}
            isSelected={selectedVehicleId === vehicle._id}
            onSelect={onSelectVehicle}
          />
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {vehicles.length} {vehicles.length === 1 ? "vehicle" : "vehicles"}{" "}
        available
      </p>
    </div>
  );
}

export default TransferVehicleList;
