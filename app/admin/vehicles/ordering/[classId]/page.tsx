"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { VehicleOrderingCard } from "@/components/admin/vehicle-ordering-card";
import { ArrowLeft, Loader2 } from "lucide-react";
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

  // Fetch vehicle class details
  const vehicleClass = useQuery(api.vehicleClasses.getById, { id: classId });

  // Fetch vehicles for this class
  const vehicles = useQuery(api.vehicles.getByClass, { classId });

  // Mutation to reorder vehicles
  const reorderVehicles = useMutation(api.vehicles.reorder);

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
            onClick={() => router.push("/admin/vehicles/ordering")}
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
          onClick={() => router.push("/admin/vehicles/ordering")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {vehicleClass.displayName || vehicleClass.name}
          </h1>
          <p className="text-muted-foreground">
            Drag and drop to reorder vehicles in this class
          </p>
        </div>
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
