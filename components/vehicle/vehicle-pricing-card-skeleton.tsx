import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function VehiclePricingCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-24" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Price per day skeleton */}
          <div className="text-center">
            <div className="flex items-baseline justify-center gap-2">
              <Skeleton className="h-12 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-4 w-32 mx-auto mt-1" />
          </div>

          {/* Pricing tip skeleton */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Skeleton className="w-4 h-4 rounded-full mt-0.5" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
          </div>

          {/* Total price breakdown skeleton */}
          <div className="border-t pt-4 space-y-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}

            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
              <div className="text-right mt-1">
                <Skeleton className="h-4 w-16 ml-auto" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
