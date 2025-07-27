import { Skeleton } from "@/components/ui/skeleton";

export function VehicleImageCarouselSkeleton() {
  return (
    <div className="space-y-4">
      {/* Main Image Skeleton */}
      <div className="relative">
        <div className="aspect-[4/3] relative w-full bg-muted overflow-hidden rounded-lg">
          <Skeleton className="h-full w-full" />
        </div>
      </div>

      {/* Thumbnail Carousel Skeleton */}
      <div className="w-full">
        <div className="flex gap-2 p-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="w-20 h-20 relative rounded-lg overflow-hidden border-2 border-gray-200"
            >
              <Skeleton className="h-full w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
