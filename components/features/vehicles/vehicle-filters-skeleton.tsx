import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function VehicleFiltersSkeleton() {
  return (
    <>
      {/* Toggle Button Skeleton */}
      <div className="mb-3">
        <Skeleton className="h-9 w-full sm:w-40" />
      </div>

      {/* Filter Options Card Skeleton - Matches expanded state */}
      <Card className="mb-3 shadow-lg bg-accent">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Brand Filter Skeleton */}
            <div>
              <Skeleton className="h-5 w-16 mb-2" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            </div>

            {/* Fuel Type Filter Skeleton */}
            <div>
              <Skeleton className="h-5 w-20 mb-2" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-2/3" />
              </div>
            </div>

            {/* Transmission Filter Skeleton */}
            <div>
              <Skeleton className="h-5 w-24 mb-2" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            </div>

            {/* Type Filter Skeleton */}
            <div>
              <Skeleton className="h-5 w-12 mb-2" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}