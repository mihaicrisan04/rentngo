"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Id } from "@/convex/_generated/dataModel";
import { TransferVehicleList } from "@/components/transfer/transfer-vehicle-list";
import { TransferRouteMap } from "@/components/transfer/transfer-route-map";
import { transferStorage, type TransferSearchData } from "@/lib/transferStorage";
import { formatDistance, formatDuration } from "@/lib/mapbox";

export default function TransferVehiclesPage() {
  const router = useRouter();
  const t = useTranslations("transferPage");

  const [searchData, setSearchData] = React.useState<TransferSearchData | null>(
    null,
  );
  const [selectedVehicleId, setSelectedVehicleId] =
    React.useState<Id<"vehicles"> | null>(null);
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    const stored = transferStorage.load();
    setSearchData(stored);

    if (stored.selectedVehicleId) {
      setSelectedVehicleId(stored.selectedVehicleId as Id<"vehicles">);
    }

    setIsHydrated(true);
  }, []);

  React.useEffect(() => {
    if (isHydrated && selectedVehicleId) {
      transferStorage.updateField("selectedVehicleId", selectedVehicleId);
    }
  }, [selectedVehicleId, isHydrated]);

  const handleBack = () => {
    router.push("/transfers");
  };

  const handleContinue = () => {
    if (selectedVehicleId) {
      router.push("/transfers/booking");
    }
  };

  const handleSelectVehicle = (vehicleId: Id<"vehicles">) => {
    setSelectedVehicleId(vehicleId);
  };

  if (!isHydrated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (
    !searchData?.pickupLocation ||
    !searchData?.dropoffLocation ||
    !searchData?.pickupDate ||
    !searchData?.pickupTime
  ) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <h2 className="text-2xl font-bold mb-4">Missing Transfer Details</h2>
          <p className="text-muted-foreground mb-6">
            Please complete the transfer search form first.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  const distanceKm = searchData.distanceKm || 0;
  const passengers = searchData.passengers || 1;
  const transferType = searchData.transferType || "one_way";

  return (
    <div className="container mx-auto py-8 max-w-6xl px-4 lg:px-0">
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>

        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">From: </span>
              <span className="font-medium">
                {searchData.pickupLocation.address.split(",")[0]}
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <div>
              <span className="text-muted-foreground">To: </span>
              <span className="font-medium">
                {searchData.dropoffLocation.address.split(",")[0]}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <TransferRouteMap
          pickupCoordinates={searchData.pickupLocation.coordinates}
          dropoffCoordinates={searchData.dropoffLocation.coordinates}
          pickupLabel={searchData.pickupLocation.address.split(",")[0]}
          dropoffLabel={searchData.dropoffLocation.address.split(",")[0]}
          className="h-[280px] sm:h-[350px] w-full"
        />
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-muted/50 rounded-lg px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{formatDistance(distanceKm)}</span>
            </div>
            {searchData.estimatedDurationMinutes && (
              <div className="flex items-center gap-1.5 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {formatDuration(searchData.estimatedDurationMinutes)}
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {t("vehicleSelection.routeEstimationNote")}
          </p>
        </div>
      </div>

      <TransferVehicleList
        passengers={passengers}
        distanceKm={distanceKm}
        transferType={transferType}
        selectedVehicleId={selectedVehicleId}
        onSelectVehicle={handleSelectVehicle}
      />

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 lg:relative lg:border-t-0 lg:p-0 lg:mt-8">
        <div className="container mx-auto flex justify-between items-center gap-4">
          <Button variant="outline" onClick={handleBack} className="lg:hidden">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1 lg:flex-none" />
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!selectedVehicleId}
            className="min-w-[200px]"
          >
            Continue to Booking
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      <div className="h-20 lg:hidden" />
    </div>
  );
}
