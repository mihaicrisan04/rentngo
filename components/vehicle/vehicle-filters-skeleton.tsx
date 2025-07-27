import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function VehicleFiltersSkeleton() {
  return (
    <Card className="mb-8 shadow-lg bg-accent">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Brand Filter Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Fuel Type Filter Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Transmission Filter Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Type Filter Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );
} 
