import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function VehicleSearchFormSkeleton() {
  return (
    <div className="mb-8">
      <div className="mb-8 text-center">
        <Skeleton className="h-8 w-64 mx-auto mb-2" />
        <Skeleton className="h-5 w-80 mx-auto" />
      </div>
      
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Pickup Location Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            
            {/* Pickup Date/Time Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-28" />
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
            
            {/* Return Location Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            
            {/* Return Date/Time Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-28" />
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
