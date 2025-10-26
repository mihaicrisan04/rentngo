"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ClassOrderingCard } from "@/components/admin/class-ordering-card";
import { CreateClassDialog } from "@/components/admin/create-class-dialog";
import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
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

interface SortableClassCardProps {
  classData: {
    _id: Id<"vehicleClasses">;
    name: string;
    displayName?: string;
    description?: string;
    sortIndex: number;
  };
  vehicleCount: number;
  vehiclePreview: Array<{
    make: string;
    model: string;
    mainImageId?: Id<"_storage">;
  }>;
  onNavigate: () => void;
}

function SortableClassCard({
  classData,
  vehicleCount,
  vehiclePreview,
  onNavigate,
}: SortableClassCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: classData._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ClassOrderingCard
        class={classData}
        vehicleCount={vehicleCount}
        vehiclePreview={vehiclePreview}
        isDragging={isDragging}
        onNavigate={onNavigate}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export default function ClassOrderingPage() {
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [items, setItems] = useState<
    Array<{
      _id: Id<"vehicleClasses">;
      name: string;
      displayName?: string;
      description?: string;
      sortIndex: number;
      isActive: boolean;
    }>
  >([]);

  // Fetch all vehicle classes
  const classes = useQuery(api.vehicleClasses.list, { activeOnly: false });

  // Fetch all vehicles to get counts per class
  const allVehicles = useQuery(api.vehicles.getAllVehicles);

  // Mutation to reorder classes
  const reorderClasses = useMutation(api.vehicleClasses.reorder);

  // Update local state when data loads
  useState(() => {
    if (classes) {
      setItems([...classes]);
    }
  });

  // Sync items when classes data changes
  if (classes && items.length === 0) {
    setItems([...classes]);
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
      sortIndex: index,
    }));

    try {
      await reorderClasses({ updates });
      toast.success("Class order updated");
    } catch {
      toast.error("Failed to update class order");
      // Revert on error
      if (classes) {
        setItems([...classes]);
      }
    }
  };

  const getVehicleDataForClass = (classId: Id<"vehicleClasses">) => {
    if (!allVehicles) return { count: 0, preview: [] };

    const classVehicles = allVehicles.filter((v) => v.classId === classId);
    return {
      count: classVehicles.length,
      preview: classVehicles.map((v) => ({
        make: v.make,
        model: v.model,
        mainImageId: v.mainImageId,
      })),
    };
  };

  if (!classes || !allVehicles) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Class Ordering</h1>
            <p className="text-muted-foreground">
              Drag and drop to reorder vehicle classes
            </p>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Class Ordering</h1>
          <p className="text-muted-foreground">
            Drag and drop to reorder vehicle classes
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Class
        </Button>
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No vehicle classes found</p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Class
          </Button>
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
            <div className="space-y-3">
              {items.map((classItem) => {
                const { count, preview } = getVehicleDataForClass(
                  classItem._id,
                );
                return (
                  <SortableClassCard
                    key={classItem._id}
                    classData={classItem}
                    vehicleCount={count}
                    vehiclePreview={preview}
                    onNavigate={() =>
                      router.push(`/admin/vehicles/ordering/${classItem._id}`)
                    }
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Create Class Dialog */}
      <CreateClassDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          toast.success("Class created successfully");
          setCreateDialogOpen(false);
        }}
      />
    </div>
  );
}
