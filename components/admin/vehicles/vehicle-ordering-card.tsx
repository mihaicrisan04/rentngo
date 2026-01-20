"use client";

import { Card } from "@/components/ui/card";
import { GripVertical } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";

interface VehicleOrderingCardProps {
  vehicle: {
    _id: Id<"vehicles">;
    make: string;
    model: string;
    year?: number;
    status: "available" | "rented" | "maintenance";
    mainImageId?: Id<"_storage">;
  };
  imageUrl?: string | null;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function VehicleOrderingCard({
  vehicle,
  imageUrl,
  isDragging = false,
  dragHandleProps,
}: VehicleOrderingCardProps) {
  return (
    <Card
      className={`p-3 transition-all ${
        isDragging
          ? "opacity-50 shadow-lg scale-105"
          : "hover:shadow-md hover:border-primary/50"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <div
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Thumbnail */}
        <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${vehicle.make} ${vehicle.model}`}
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              No Image
            </div>
          )}
        </div>

        {/* Vehicle Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-base truncate">
            {vehicle.make} {vehicle.model}
          </h4>
          {vehicle.year && (
            <p className="text-sm text-muted-foreground">{vehicle.year}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
