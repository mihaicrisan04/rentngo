"use client";

import * as React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Car, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TransferVehicle } from "./transfer-vehicle-card";

interface TransferBookingFloatingCardProps {
  selectedVehicle: TransferVehicle | null;
  onContinue: () => void;
  onBack: () => void;
  className?: string;
}

export function TransferBookingFloatingCard({
  selectedVehicle,
  onContinue,
  onBack,
  className,
}: TransferBookingFloatingCardProps) {
  const t = useTranslations("transferPage");

  return (
    <div
      className={cn(
        "sticky bottom-0 z-40 -mx-4 lg:mx-0 px-4 py-4",
        "pb-[max(1rem,env(safe-area-inset-bottom))]",
        className
      )}
    >
      <div className="max-w-2xl mx-auto">
        <div
          className={cn(
            "rounded-2xl border shadow-2xl",
            "bg-background/80 backdrop-blur-xl",
            "p-4 sm:p-5"
          )}
        >
          {selectedVehicle ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Vehicle Image - Hidden on mobile */}
              <div className="hidden sm:block w-24 h-16 relative rounded-lg overflow-hidden bg-muted shrink-0">
                {selectedVehicle.imageUrl ? (
                  <Image
                    src={selectedVehicle.imageUrl}
                    alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="96px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <Car className="h-6 w-6" />
                  </div>
                )}
              </div>

              {/* Vehicle Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between sm:justify-start gap-3">
                  <h3 className="font-semibold truncate">
                    {selectedVehicle.make} {selectedVehicle.model}
                  </h3>
                  {selectedVehicle.seats && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
                      <Users className="h-3.5 w-3.5" />
                      <span>{selectedVehicle.seats}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-primary">
                    €{selectedVehicle.calculatedPrice?.toFixed(2) ?? "0.00"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {t("pricing.totalPrice").toLowerCase()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 sm:shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBack}
                  className="sm:hidden"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  onClick={onContinue}
                  className="flex-1 sm:flex-none sm:px-6"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-muted rounded-full p-2.5">
                  <Car className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  {t("vehicleSelection.selectPrompt")}
                </p>
              </div>
              <Button size="lg" disabled className="shrink-0">
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TransferBookingFloatingCard;
