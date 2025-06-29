"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { useState } from "react";

interface VehicleImageProps {
  imageId: Id<"_storage">;
  alt: string;
  className?: string;
}

export function VehicleImage({ imageId, alt, className = "" }: VehicleImageProps) {
  const [isError, setIsError] = useState(false);
  const imageUrl = useQuery(api.vehicles.getImageUrl, { imageId });

  if (!imageUrl || isError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-400">No Image</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={() => setIsError(true)}
    />
  );
}