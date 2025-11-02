"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { GripVertical, ArrowRight } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import { toast } from "sonner";

interface ClassOrderingCardProps {
  class: {
    _id: Id<"vehicleClasses">;
    name: string;
    displayName?: string;
    description?: string;
    additional50kmPrice?: number;
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
  const [editPriceOpen, setEditPriceOpen] = useState(false);
  const [newPrice, setNewPrice] = useState<number>(
    vehicleClass.additional50kmPrice ?? 5,
  );
  const updateClass = useMutation(api.vehicleClasses.update);

  const handleSavePrice = async () => {
    if (newPrice < 0 || newPrice > 100) {
      toast.error("Price must be between 0 and 100 EUR");
      return;
    }

    try {
      await updateClass({
        id: vehicleClass._id,
        additional50kmPrice: newPrice,
      });
      toast.success("Price updated successfully");
      setEditPriceOpen(false);
    } catch (error) {
      console.error("Error updating price:", error);
      toast.error("Failed to update price");
    }
  };

  return (
    <>
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

        {/* Buttons */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setNewPrice(vehicleClass.additional50kmPrice ?? 5);
              setEditPriceOpen(true);
            }}
          >
            Edit Price 
            <span className="ml-2 text-xs text-muted-foreground font-normal">
              {vehicleClass.additional50kmPrice ? `${vehicleClass.additional50kmPrice} EUR` : '5 EUR'}
            </span>
          </Button>
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

    {/* Edit Price Dialog */}
    <Dialog open={editPriceOpen} onOpenChange={setEditPriceOpen}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit Extra 50km Price</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="price-input">
              Current Price: {vehicleClass.additional50kmPrice ?? 5} EUR
            </Label>
            <Input
              id="price-input"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={newPrice}
              onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
              className="mt-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditPriceOpen(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSavePrice}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
  );
}
