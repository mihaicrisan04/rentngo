"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { VehicleOrderingCard } from "@/components/admin/vehicles/vehicle-ordering-card";
import { PricingField } from "@/components/admin/vehicle-classes/pricing-field";
import { useSortableReorder } from "@/hooks/use-sortable-reorder";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableVehicleCardProps {
  vehicle: {
    _id: Id<"vehicles">;
    make: string;
    model: string;
    year?: number;
    status: "available" | "rented" | "maintenance";
    mainImageId?: Id<"_storage">;
  };
}

function VehicleCardWithImage({ vehicle }: SortableVehicleCardProps) {
  // Fetch image URL if mainImageId exists
  const imageUrl = useQuery(
    api.vehicles.getImageUrl,
    vehicle.mainImageId ? { imageId: vehicle.mainImageId } : "skip",
  );

  return <SortableVehicleCard vehicle={vehicle} imageUrl={imageUrl ?? null} />;
}

function SortableVehicleCard({
  vehicle,
  imageUrl,
}: SortableVehicleCardProps & { imageUrl: string | null }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: vehicle._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <VehicleOrderingCard
        vehicle={vehicle}
        imageUrl={imageUrl}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

const parseNonNegative = (raw: string) => {
  const value = parseFloat(raw);
  return isNaN(value) || value < 0 ? null : value;
};

const parsePositive = (raw: string) => {
  const value = parseFloat(raw);
  return isNaN(value) || value <= 0 ? null : value;
};

export default function VehicleOrderingPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.classId as Id<"vehicleClasses">;

  const [additional50kmPrice, setAdditional50kmPrice] = useState<string>("");
  const [transferBaseFare, setTransferBaseFare] = useState<string>("");
  const [transferMultiplier, setTransferMultiplier] = useState<string>("");

  // Fetch vehicle class details
  const vehicleClass = useQuery(api.vehicleClasses.getById, { id: classId });

  // Fetch vehicles for this class
  const vehicles = useQuery(api.vehicles.getByClass, { classId });

  // Mutation to reorder vehicles
  const reorderVehicles = useMutation(api.vehicles.reorder);

  // Mutation to update vehicle class pricing
  const updateVehicleClass = useMutation(api.vehicleClasses.update);

  // Initialize pricing state when vehicle class data loads
  useEffect(() => {
    if (vehicleClass) {
      setAdditional50kmPrice(String(vehicleClass.additional50kmPrice ?? 5));
      setTransferBaseFare(String(vehicleClass.transferBaseFare ?? 25));
      setTransferMultiplier(vehicleClass.transferMultiplier?.toString() ?? "1.0");
    }
  }, [vehicleClass]);

  const {
    items,
    sensors,
    collisionDetection,
    handleDragStart,
    handleDragCancel,
    handleDragEnd,
  } = useSortableReorder({
    source: vehicles,
    persistOrder: async (newItems) => {
      const updates = newItems.map((item, index) => ({
        id: item._id,
        classSortIndex: index,
      }));
      await reorderVehicles({ updates });
    },
    successMessage: "Vehicle order updated",
    errorMessage: "Failed to update vehicle order",
  });

  if (!vehicleClass || !vehicles) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/admin/vehicles/classes")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Loading...</h1>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/admin/vehicles/classes")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {vehicleClass.displayName || vehicleClass.name}
          </h1>
          <p className="text-muted-foreground">
            Manage pricing and vehicle ordering for this class
          </p>
        </div>
      </div>

      {/* Rental Pricing */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Rental Pricing</h2>
          <p className="text-sm text-muted-foreground">
            Pricing settings for car rentals
          </p>
        </div>

        <PricingField
          label="Extra 50km Price"
          description="Price charged per additional 50km package for rentals"
          unit="EUR"
          min="0"
          step="0.01"
          value={additional50kmPrice}
          onChange={setAdditional50kmPrice}
          parseValue={parseNonNegative}
          invalidMessage="Please enter a valid price"
          successMessage="Extra 50km price updated"
          errorMessage="Failed to update price"
          save={(price) =>
            updateVehicleClass({ id: classId, additional50kmPrice: price })
          }
        />
      </div>

      {/* Transfer Pricing */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Transfer Pricing</h2>
          <p className="text-sm text-muted-foreground">
            Pricing settings for VIP transfer services
          </p>
        </div>

        <PricingField
          label="Base Fare"
          description="Minimum fare for transfer bookings in this class"
          unit="EUR"
          min="0"
          step="0.01"
          value={transferBaseFare}
          onChange={setTransferBaseFare}
          parseValue={parseNonNegative}
          invalidMessage="Please enter a valid base fare"
          successMessage="Transfer base fare updated"
          errorMessage="Failed to update base fare"
          save={(fare) =>
            updateVehicleClass({ id: classId, transferBaseFare: fare })
          }
        />

        <PricingField
          label="Rate Multiplier"
          description="Adjusts the per-km rate for this class (e.g., 1.2 = 20% higher)"
          unit="x"
          min="0.1"
          step="0.1"
          placeholder="1.0"
          value={transferMultiplier}
          onChange={setTransferMultiplier}
          parseValue={parsePositive}
          invalidMessage="Multiplier must be a positive number"
          successMessage="Transfer multiplier updated"
          errorMessage="Failed to update multiplier"
          save={(value) =>
            updateVehicleClass({
              id: classId,
              transferMultiplier: Math.round(value * 100) / 100,
            })
          }
        />
      </div>

      {/* Vehicle Ordering Section */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Vehicle Ordering</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Drag and drop to reorder vehicles in this class
        </p>
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-2">
            No vehicles in this class yet
          </p>
          <p className="text-sm text-muted-foreground">
            Add vehicles to this class from the vehicle management page
          </p>
        </div>
      ) : (
        /* Sortable List */
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragCancel={handleDragCancel}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((item) => item._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3 max-w-3xl">
              {items.map((vehicle) => (
                <VehicleCardWithImage key={vehicle._id} vehicle={vehicle} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
