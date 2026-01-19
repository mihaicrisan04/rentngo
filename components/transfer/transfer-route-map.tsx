"use client";

import * as React from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getMapboxToken } from "@/lib/mapbox";
import { cn } from "@/lib/utils";

interface Coordinates {
  lng: number;
  lat: number;
}

interface TransferRouteMapProps {
  pickupCoordinates: Coordinates;
  dropoffCoordinates: Coordinates;
  pickupLabel?: string;
  dropoffLabel?: string;
  className?: string;
  compact?: boolean;
}

export function TransferRouteMap({
  pickupCoordinates,
  dropoffCoordinates,
  pickupLabel = "Pickup",
  dropoffLabel = "Dropoff",
  className,
  compact = false,
}: TransferRouteMapProps) {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    let accessToken: string;
    try {
      accessToken = getMapboxToken();
    } catch {
      setError("Mapbox token not configured");
      return;
    }

    mapboxgl.accessToken = accessToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [
        (pickupCoordinates.lng + dropoffCoordinates.lng) / 2,
        (pickupCoordinates.lat + dropoffCoordinates.lat) / 2,
      ],
      zoom: 10,
      interactive: false,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on("load", async () => {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([pickupCoordinates.lng, pickupCoordinates.lat]);
      bounds.extend([dropoffCoordinates.lng, dropoffCoordinates.lat]);

      const padding = compact
        ? { top: 30, bottom: 30, left: 40, right: 40 }
        : { top: 80, bottom: 50, left: 50, right: 50 };

      map.fitBounds(bounds, {
        padding,
        maxZoom: compact ? 11 : 14,
      });

      try {
        const routeUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupCoordinates.lng},${pickupCoordinates.lat};${dropoffCoordinates.lng},${dropoffCoordinates.lat}?access_token=${accessToken}&overview=full&geometries=geojson`;

        const response = await fetch(routeUrl);
        if (!response.ok) throw new Error("Failed to fetch route");

        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const routeGeometry = data.routes[0].geometry;

          map.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: routeGeometry,
            },
          });

          map.addLayer({
            id: "route-outline",
            type: "line",
            source: "route",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#1a1a2e",
              "line-width": 8,
              "line-opacity": 0.3,
            },
          });

          map.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#3b82f6",
              "line-width": 4,
            },
          });
        }
      } catch (err) {
        console.error("Error fetching route:", err);
        map.addSource("route-line", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [
                [pickupCoordinates.lng, pickupCoordinates.lat],
                [dropoffCoordinates.lng, dropoffCoordinates.lat],
              ],
            },
          },
        });

        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route-line",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3b82f6",
            "line-width": 3,
            "line-dasharray": [2, 2],
          },
        });
      }

      const pickupMarkerEl = compact
        ? createCompactMarkerElement("pickup")
        : createMarkerElement("pickup", pickupLabel);
      new mapboxgl.Marker({
        element: pickupMarkerEl,
        anchor: compact ? "center" : "bottom",
      })
        .setLngLat([pickupCoordinates.lng, pickupCoordinates.lat])
        .addTo(map);

      const dropoffMarkerEl = compact
        ? createCompactMarkerElement("dropoff")
        : createMarkerElement("dropoff", dropoffLabel);
      new mapboxgl.Marker({
        element: dropoffMarkerEl,
        anchor: compact ? "center" : "bottom",
      })
        .setLngLat([dropoffCoordinates.lng, dropoffCoordinates.lat])
        .addTo(map);

      setIsLoaded(true);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [pickupCoordinates, dropoffCoordinates, pickupLabel, dropoffLabel, compact]);

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted rounded-lg",
          className
        )}
      >
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      <div ref={mapContainerRef} className="h-full w-full" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      )}
    </div>
  );
}

function createMarkerElement(
  type: "pickup" | "dropoff",
  label: string
): HTMLDivElement {
  const container = document.createElement("div");
  container.className = "flex flex-col items-center";

  const labelEl = document.createElement("div");
  labelEl.className = `
    px-2 py-1 rounded-md text-xs font-medium mb-1 whitespace-nowrap shadow-md
    ${type === "pickup" ? "bg-green-500 text-white" : "bg-red-500 text-white"}
  `;
  labelEl.textContent = label;

  const pin = document.createElement("div");
  pin.className = `
    w-6 h-6 rounded-full border-3 border-white shadow-lg flex items-center justify-center
    ${type === "pickup" ? "bg-green-500" : "bg-red-500"}
  `;

  const innerDot = document.createElement("div");
  innerDot.className = "w-2 h-2 rounded-full bg-white";
  pin.appendChild(innerDot);

  container.appendChild(labelEl);
  container.appendChild(pin);

  return container;
}

function createCompactMarkerElement(type: "pickup" | "dropoff"): HTMLDivElement {
  const pin = document.createElement("div");
  pin.className = `
    w-4 h-4 rounded-full border-2 border-white shadow-md flex items-center justify-center
    ${type === "pickup" ? "bg-green-500" : "bg-red-500"}
  `;

  const innerDot = document.createElement("div");
  innerDot.className = "w-1.5 h-1.5 rounded-full bg-white";
  pin.appendChild(innerDot);

  return pin;
}

export default TransferRouteMap;