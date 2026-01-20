"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VehicleOrderingCard } from "@/components/admin/vehicles/vehicle-ordering-card";
import { ArrowLeft, Loader2, Check } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
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

export default function VehicleOrderingPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.classId as Id<"vehicleClasses">;

  const [items, setItems] = useState<
    Array<{
      _id: Id<"vehicles">;
      make: string;
      model: string;
      year?: number;
      status: "available" | "rented" | "maintenance";
      classSortIndex: number;
      mainImageId?: Id<"_storage">;
    }>
  >([]);

  // Pricing state - separate state for each field
  const [additional50kmPrice, setAdditional50kmPrice] = useState<string>("");
  const [transferBaseFare, setTransferBaseFare] = useState<string>("");
  const [isSaving50km, setIsSaving50km] = useState(false);
  const [isSavingBaseFare, setIsSavingBaseFare] = useState(false);

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
    }
  }, [vehicleClass]);

  // Handler for saving extra 50km price
  const handleSave50kmPrice = async () => {
    const price = parseFloat(additional50kmPrice);
    if (isNaN(price) || price < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setIsSaving50km(true);
    try {
      await updateVehicleClass({
        id: classId,
        additional50kmPrice: price,
      });
      toast.success("Extra 50km price updated");
    } catch {
      toast.error("Failed to update price");
    } finally {
      setIsSaving50km(false);
    }
  };

  // Handler for saving transfer base fare
  const handleSaveBaseFare = async () => {
    const fare = parseFloat(transferBaseFare);
    if (isNaN(fare) || fare < 0) {
      toast.error("Please enter a valid base fare");
      return;
    }

    setIsSavingBaseFare(true);
    try {
      await updateVehicleClass({
        id: classId,
        transferBaseFare: fare,
      });
      toast.success("Transfer base fare updated");
    } catch {
      toast.error("Failed to update base fare");
    } finally {
      setIsSavingBaseFare(false);
    }
  };

  // Sync items when vehicles data changes
  if (vehicles && items.length === 0) {
    setItems([...vehicles]);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item._id === active.id);
    const newIndex = items.findIndex((item) => item._id === over.id);

    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    // Update sort indices
    const updates = newItems.map((item, index) => ({
      id: item._id,
      classSortIndex: index,
    }));

    try {
      await reorderVehicles({ updates });
      toast.success("Vehicle order updated");
    } catch {
      toast.error("Failed to update vehicle order");
      // Revert on error
      if (vehicles) {
        setItems([...vehicles]);
      }
    }
  };

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

      {/* Pricing Settings */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Pricing Settings</h2>

        {/* Extra 50km Price */}
        <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
          <div className="flex-1">
            <p className="font-medium">Extra 50km Price</p>
            <p className="text-sm text-muted-foreground">
              Price charged per additional 50km package for rentals
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={additional50kmPrice}
              onChange={(e) => setAdditional50kmPrice(e.target.value)}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">EUR</span>
            <Button
              size="icon"
              variant="outline"
              onClick={handleSave50kmPrice}
              disabled={isSaving50km}
            >
              {isSaving50km ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Transfer Base Fare */}
        <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
          <div className="flex-1">
            <p className="font-medium">Transfer Base Fare</p>
            <p className="text-sm text-muted-foreground">
              Minimum fare for transfer bookings in this class
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={transferBaseFare}
              onChange={(e) => setTransferBaseFare(e.target.value)}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">EUR</span>
            <Button
              size="icon"
              variant="outline"
              onClick={handleSaveBaseFare}
              disabled={isSavingBaseFare}
            >
              {isSavingBaseFare ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
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
          collisionDetection={closestCenter}
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
