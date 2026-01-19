"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Users, Fuel, Icon, Check, MapPin } from "lucide-react";
import { gearbox } from "@lucide/lab";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

export interface TransferVehicle {
  _id: Id<"vehicles">;
  make: string;
  model: string;
  year?: number;
  seats?: number;
  transmission?: "automatic" | "manual";
  fuelType?: "diesel" | "electric" | "hybrid" | "benzina";
  transferPricePerKm?: number;
  transferBaseFare?: number;
  classMultiplier?: number;
  distanceCharge?: number;
  calculatedPrice?: number;
  features?: string[];
  imageUrl?: string | null;
}

interface TransferVehicleCardProps {
  vehicle: TransferVehicle;
  distanceKm: number;
  transferType: "one_way" | "round_trip";
  isSelected?: boolean;
  onSelect: (vehicleId: Id<"vehicles">) => void;
}

export function TransferVehicleCard({
  vehicle,
  distanceKm,
  transferType,
  isSelected = false,
  onSelect,
}: TransferVehicleCardProps) {
  const t = useTranslations("transferPage");
  const tCommon = useTranslations("common");

  // Use server-calculated price if available
  const totalPrice = vehicle.calculatedPrice ?? 0;

  return (
    <div
      className={cn(
        "relative flex flex-col bg-accent text-card-foreground overflow-hidden rounded-lg shadow-lg w-full transition-all duration-300 hover:shadow-xl hover:scale-105 group before:absolute before:inset-0 before:rounded-lg before:border-2 before:border-primary/20 before:scale-110 before:opacity-0 before:transition-all before:duration-300 group-hover:before:opacity-100 before:pointer-events-none",
        isSelected && "ring-2 ring-primary shadow-lg",
      )}
    >
      {isSelected && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-primary text-primary-foreground">
            <Check className="h-3 w-3 mr-1" />
            Selected
          </Badge>
        </div>
      )}

      <div className="aspect-[16/10] relative w-full bg-muted overflow-hidden">
        {vehicle.imageUrl ? (
          <Image
            src={vehicle.imageUrl}
            alt={`${vehicle.make} ${vehicle.model}`}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <span className="text-sm">{tCommon("noImage")}</span>
          </div>
        )}
      </div>

      <div className="flex-grow p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {vehicle.make} {vehicle.model}
            </h3>
            {vehicle.year && (
              <p className="text-sm text-muted-foreground">{vehicle.year}</p>
            )}
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{vehicle.seats || "–"}</span>
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Icon iconNode={gearbox} className="h-4 w-4" />
            <span className="capitalize">{vehicle.transmission || "–"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Fuel className="h-4 w-4" />
            <span className="capitalize">{vehicle.fuelType || "–"}</span>
          </div>
        </div>

        <Separator />

        {/* Simplified pricing display */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{distanceKm} km</span>
            </div>
            {transferType === "round_trip" && (
              <Badge variant="outline" className="text-xs">
                {t("searchForm.roundTrip")}
              </Badge>
            )}
          </div>
          <Separator />
          <div className="flex justify-between items-baseline">
            <span className="font-medium">{t("pricing.totalPrice")}</span>
            <span className="text-2xl font-bold text-primary">
              €{totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        <Button
          className="w-full mt-2"
          variant={isSelected ? "secondary" : "default"}
          onClick={() => onSelect(vehicle._id)}
        >
          {isSelected ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Selected
            </>
          ) : (
            t("vehicleSelection.selectVehicle")
          )}
        </Button>
      </div>
    </div>
  );
}

export default TransferVehicleCard;
