"use client";

import { useState, useEffect, useRef } from "react";
import {
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { toast } from "sonner";

interface UseSortableReorderOptions<T> {
  source: T[] | undefined;
  persistOrder: (items: T[]) => Promise<void>;
  successMessage: string;
  errorMessage: string;
}

export function useSortableReorder<T extends { _id: string }>({
  source,
  persistOrder,
  successMessage,
  errorMessage,
}: UseSortableReorderOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (source && !isDraggingRef.current) {
      setItems([...source]);
    }
  }, [source]);

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

  const handleDragStart = () => {
    isDraggingRef.current = true;
  };

  const handleDragCancel = () => {
    isDraggingRef.current = false;
    if (source) {
      setItems([...source]);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    isDraggingRef.current = false;
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item._id === active.id);
    const newIndex = items.findIndex((item) => item._id === over.id);

    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    try {
      await persistOrder(newItems);
      toast.success(successMessage);
    } catch {
      toast.error(errorMessage);
      if (source) {
        setItems([...source]);
      }
    }
  };

  return {
    items,
    sensors,
    collisionDetection: closestCenter,
    handleDragStart,
    handleDragCancel,
    handleDragEnd,
  };
}
