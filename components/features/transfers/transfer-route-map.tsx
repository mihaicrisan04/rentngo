"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import type { TransferRouteMapProps } from "./transfer-route-map-impl";

// mapbox-gl (~1.5 MB parsed) is only needed once the map actually mounts in
// the browser (it is initialized inside a useEffect), so the implementation is
// code-split out of the transfer routes' initial JS and skipped during SSR.
const TransferRouteMapImpl = dynamic(
  () => import("./transfer-route-map-impl").then((mod) => mod.TransferRouteMap),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    ),
  },
);

export function TransferRouteMap({
  className,
  ...props
}: TransferRouteMapProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      <TransferRouteMapImpl {...props} className="h-full w-full" />
    </div>
  );
}

export default TransferRouteMap;
