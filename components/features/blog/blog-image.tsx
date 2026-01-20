"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface BlogImageProps {
  storageId: string;
  alt: string;
  caption?: string;
  className?: string;
}

function isValidStorageId(storageId: string): boolean {
  // Convex storage IDs start with "kg" followed by base64-like characters
  return /^kg[a-zA-Z0-9_-]+$/.test(storageId);
}

export function BlogImage({
  storageId,
  alt,
  caption,
  className,
}: BlogImageProps) {
  // Validate storage ID format before making query
  const isValid = isValidStorageId(storageId);

  const imageUrl = useQuery(
    api.blogs.getImageUrl,
    isValid ? { imageId: storageId as Id<"_storage"> } : "skip",
  );

  // Show placeholder for invalid storage IDs
  if (!isValid) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center bg-muted rounded-lg h-64 my-6 border-2 border-dashed border-muted-foreground/30",
          className,
        )}
      >
        <span className="text-muted-foreground text-center px-4">
          📷 Image Placeholder
          <br />
          <span className="text-xs">
            Replace{" "}
            <code className="bg-background px-1 py-0.5 rounded">
              {storageId}
            </code>{" "}
            with actual storage ID
          </span>
        </span>
      </div>
    );
  }

  // Show loading state while fetching
  if (!imageUrl) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted rounded-lg h-64 my-6",
          className,
        )}
      >
        <span className="text-muted-foreground">Loading image...</span>
      </div>
    );
  }

  return (
    <figure className={cn("my-6", className)}>
      <div className="relative aspect-video w-full rounded-lg overflow-hidden">
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 800px"
          quality={85}
          loading="lazy"
        />
      </div>
      {caption && (
        <figcaption className="text-center text-sm text-muted-foreground mt-2 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
