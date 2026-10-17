export interface ParsedMapboxRoute {
  distanceKm: number;
  durationMinutes: number;
}

export type MapboxRouteErrorCode = "NO_ROUTE" | "INVALID_RESPONSE";

export class MapboxRouteError extends Error {
  constructor(public readonly code: MapboxRouteErrorCode) {
    super(
      code === "NO_ROUTE"
        ? "No driving route exists between the selected locations."
        : "Mapbox returned an invalid route response.",
    );
    this.name = "MapboxRouteError";
  }
}

export function parseMapboxRoute(payload: unknown): ParsedMapboxRoute {
  if (!payload || typeof payload !== "object") {
    throw new MapboxRouteError("INVALID_RESPONSE");
  }
  const routes = (payload as { routes?: unknown }).routes;
  if (!Array.isArray(routes) || routes.length === 0) {
    throw new MapboxRouteError("NO_ROUTE");
  }
  const route = routes[0];
  if (!route || typeof route !== "object") {
    throw new MapboxRouteError("INVALID_RESPONSE");
  }
  const { distance, duration } = route as {
    distance?: unknown;
    duration?: unknown;
  };
  if (
    typeof distance !== "number" ||
    typeof duration !== "number" ||
    !Number.isFinite(distance) ||
    !Number.isFinite(duration) ||
    distance < 0 ||
    duration < 0
  ) {
    throw new MapboxRouteError("INVALID_RESPONSE");
  }
  return {
    distanceKm: distance / 1000,
    durationMinutes: Math.ceil(duration / 60),
  };
}
