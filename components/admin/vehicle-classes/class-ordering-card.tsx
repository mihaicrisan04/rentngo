"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, ArrowRight } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";

interface ClassOrderingCardProps {
  class: {
    _id: Id<"vehicleClasses">;
    name: string;
    displayName?: string;
    description?: string;
  };
  vehicleCount: number;
  vehiclePreview: Array<{
    make: string;
    model: string;
    mainImageId?: Id<"_storage">;
  }>;
  isDragging?: boolean;
  onNavigate?: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

// Component to fetch and display individual vehicle thumbnail
function VehicleThumbnail({
  vehicle,
}: {
  vehicle: { make: string; model: string; mainImageId?: Id<"_storage"> };
}) {
  const imageUrl = useQuery(
    api.vehicles.getImageUrl,
    vehicle.mainImageId ? { imageId: vehicle.mainImageId } : "skip",
  );

  return (
    <div className="flex-shrink-0 w-16 text-center">
      <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center mb-1 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${vehicle.make} ${vehicle.model}`}
            width={64}
            height={64}
            quality={50}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-xl">🚗</div>
        )}
      </div>
      <p className="text-[9px] leading-tight text-foreground/70 line-clamp-2">
        {vehicle.make} {vehicle.model}
      </p>
    </div>
  );
}

export function ClassOrderingCard({
  class: vehicleClass,
  vehicleCount,
  vehiclePreview,
  isDragging = false,
  onNavigate,
  dragHandleProps,
}: ClassOrderingCardProps) {
  return (
    <Card
      className={`p-4 transition-all ${
        isDragging
          ? "opacity-50 shadow-lg scale-105"
          : "hover:shadow-md hover:border-primary/50"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <div
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing flex-shrink-0"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Class Name and Count */}
        <div className="flex-shrink-0 w-48">
          <h3 className="font-semibold text-lg leading-tight">
            {vehicleClass.displayName || vehicleClass.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            {vehicleCount} {vehicleCount === 1 ? "vehicle" : "vehicles"}
          </p>
        </div>

        {/* Horizontal Vehicle Preview */}
        <div className="flex-1 min-w-0">
          {vehicleCount === 0 ? (
            <div className="flex items-center justify-center py-2 text-sm text-muted-foreground italic">
              No vehicles
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              {vehiclePreview.slice(0, 10).map((vehicle, idx) => (
                <VehicleThumbnail key={idx} vehicle={vehicle} />
              ))}
              {vehicleCount > 10 && (
                <div className="flex-shrink-0 w-16 text-center">
                  <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center mb-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      +{vehicleCount - 10}
                    </p>
                  </div>
                  <p className="text-[9px] leading-tight text-foreground/70">
                    more
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Manage Button */}
        <div className="flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate?.();
            }}
            className="flex items-center gap-1"
          >
            Manage
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
