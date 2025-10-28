"use client";

import React, { useState } from "react";
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
  rectSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Star, X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface DraggableImageItem {
  id: string;
  imageId: Id<"_storage">;
  isMain?: boolean;
}

interface SortableImageItemProps {
  item: DraggableImageItem;
  onSetMain: (imageId: Id<"_storage">) => void;
  onRemove: (imageId: Id<"_storage">) => void;
  disabled?: boolean;
  showRemoveButton?: boolean;
  showMainButton?: boolean;
}

function SortableImageItem({
  item,
  onSetMain,
  onRemove,
  disabled = false,
  showRemoveButton = true,
  showMainButton = true,
}: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const imageUrl = useQuery(api.vehicles.getImageUrl, {
    imageId: item.imageId,
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200",
        isDragging
          ? "opacity-50 border-primary shadow-lg z-50"
          : "border-border",
        item.isMain ? "ring-2 ring-yellow-400 ring-offset-2" : "",
        disabled ? "opacity-50" : "",
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing",
          "bg-black/50 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity",
          disabled && "cursor-not-allowed",
        )}
      >
        <GripVertical className="h-4 w-4 text-white" />
      </div>

      {/* Image */}
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt="Vehicle image"
          width={200}
          height={200}
          quality={60}
          className="w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Loading...
        </div>
      )}

      {/* Main image indicator */}
      {item.isMain && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-medium">
          Main
        </div>
      )}

      {/* Overlay with controls */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        {showMainButton && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => onSetMain(item.imageId)}
            disabled={disabled || item.isMain}
            className="bg-white/90 hover:bg-white text-black"
          >
            {item.isMain ? (
              <>
                <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                Main
              </>
            ) : (
              <>
                <Star className="h-4 w-4 mr-1" />
                Set Main
              </>
            )}
          </Button>
        )}

        {showRemoveButton && (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => onRemove(item.imageId)}
            disabled={disabled}
            className="bg-red-500/90 hover:bg-red-600 text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

interface DraggableImageListProps {
  images: Id<"_storage">[];
  mainImageId?: Id<"_storage">;
  onReorder: (newOrder: Id<"_storage">[]) => void;
  onSetMain: (imageId: Id<"_storage">) => void;
  onRemove: (imageId: Id<"_storage">) => void;
  disabled?: boolean;
  layout?: "grid" | "horizontal";
  showRemoveButton?: boolean;
  showMainButton?: boolean;
  className?: string;
}

export function DraggableImageList({
  images,
  mainImageId,
  onReorder,
  onSetMain,
  onRemove,
  disabled = false,
  layout = "grid",
  showRemoveButton = true,
  showMainButton = true,
  className,
}: DraggableImageListProps) {
  const [items, setItems] = useState<DraggableImageItem[]>(() =>
    images.map((imageId, index) => ({
      id: `image-${index}-${imageId}`,
      imageId,
      isMain: imageId === mainImageId,
    })),
  );

  // Update items when props change
  React.useEffect(() => {
    setItems(
      images.map((imageId, index) => ({
        id: `image-${index}-${imageId}`,
        imageId,
        isMain: imageId === mainImageId,
      })),
    );
  }, [images, mainImageId]);

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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Extract the new order of image IDs
        const newImageOrder = newItems.map((item) => item.imageId);
        onReorder(newImageOrder);

        return newItems;
      });
    }
  }

  if (images.length === 0) {
    return (
      <div className={cn("text-center text-muted-foreground py-8", className)}>
        No images uploaded yet.
      </div>
    );
  }

  return (
    <div className={cn("group", className)}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={
            layout === "grid"
              ? rectSortingStrategy
              : horizontalListSortingStrategy
          }
        >
          <div
            className={cn(
              layout === "grid"
                ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3"
                : "flex gap-3 overflow-x-auto pb-2",
            )}
          >
            {items.map((item) => (
              <SortableImageItem
                key={item.id}
                item={item}
                onSetMain={onSetMain}
                onRemove={onRemove}
                disabled={disabled}
                showRemoveButton={showRemoveButton}
                showMainButton={showMainButton}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
