const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export interface Coordinates {
  lng: number;
  lat: number;
}

export interface RouteInfo {
  distanceKm: number;
  durationMinutes: number;
}

export interface DirectionsResponse {
  routes: Array<{
    distance: number; // in meters
    duration: number; // in seconds
    geometry: {
      coordinates: Array<[number, number]>;
      type: string;
    };
  }>;
  waypoints: Array<{
    name: string;
    location: [number, number];
  }>;
}

export async function getRouteInfo(
  origin: Coordinates,
  destination: Coordinates,
): Promise<RouteInfo> {
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error("Mapbox access token is not configured");
  }

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?access_token=${MAPBOX_ACCESS_TOKEN}&overview=simplified`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Mapbox API error: ${response.statusText}`);
  }

  const data: DirectionsResponse = await response.json();

  if (!data.routes || data.routes.length === 0) {
    throw new Error("No route found between the specified locations");
  }

  const route = data.routes[0];

  return {
    distanceKm: Math.round((route.distance / 1000) * 10) / 10, // Convert meters to km, round to 1 decimal
    durationMinutes: Math.round(route.duration / 60), // Convert seconds to minutes
  };
}

export async function getRouteWithGeometry(
  origin: Coordinates,
  destination: Coordinates,
): Promise<RouteInfo & { geometry: Array<[number, number]> }> {
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error("Mapbox access token is not configured");
  }

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?access_token=${MAPBOX_ACCESS_TOKEN}&overview=full&geometries=geojson`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Mapbox API error: ${response.statusText}`);
  }

  const data: DirectionsResponse = await response.json();

  if (!data.routes || data.routes.length === 0) {
    throw new Error("No route found between the specified locations");
  }

  const route = data.routes[0];

  return {
    distanceKm: Math.round((route.distance / 1000) * 10) / 10,
    durationMinutes: Math.round(route.duration / 60),
    geometry: route.geometry.coordinates,
  };
}

export interface LocationSuggestion {
  mapbox_id: string;
  name: string;
  full_address?: string;
  place_formatted?: string;
  address?: string;
}

export interface RetrievedLocation {
  coordinates: Coordinates;
  fullAddress?: string;
  placeFormatted?: string;
  name?: string;
}

interface SuggestResponse {
  suggestions?: LocationSuggestion[];
}

interface RetrieveResponse {
  features?: Array<{
    geometry: { coordinates: [number, number] };
    properties?: {
      full_address?: string;
      place_formatted?: string;
      name?: string;
    };
  }>;
}

export async function suggestLocations(
  query: string,
  sessionToken: string,
): Promise<LocationSuggestion[]> {
  const params = new URLSearchParams({
    q: query,
    access_token: getMapboxToken(),
    session_token: sessionToken,
    language: "en",
    country: "RO",
    types: "address,poi,place",
    proximity: "23.5912,46.7712",
    limit: "5",
  });

  const response = await fetch(
    `https://api.mapbox.com/search/searchbox/v1/suggest?${params}`,
  );

  if (!response.ok) {
    throw new Error(`Mapbox API error: ${response.statusText}`);
  }

  const data: SuggestResponse = await response.json();
  return data.suggestions || [];
}

export async function retrieveLocation(
  mapboxId: string,
  sessionToken: string,
): Promise<RetrievedLocation> {
  const params = new URLSearchParams({
    access_token: getMapboxToken(),
    session_token: sessionToken,
  });

  const response = await fetch(
    `https://api.mapbox.com/search/searchbox/v1/retrieve/${mapboxId}?${params}`,
  );

  if (!response.ok) {
    throw new Error(`Mapbox API error: ${response.statusText}`);
  }

  const data: RetrieveResponse = await response.json();
  const feature = data.features?.[0];

  if (!feature) {
    throw new Error("No location details returned for the selected suggestion");
  }

  return {
    coordinates: {
      lng: feature.geometry.coordinates[0],
      lat: feature.geometry.coordinates[1],
    },
    fullAddress: feature.properties?.full_address,
    placeFormatted: feature.properties?.place_formatted,
    name: feature.properties?.name,
  };
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}min`;
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km} km`;
}

export function getMapboxToken(): string {
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error("Mapbox access token is not configured");
  }
  return MAPBOX_ACCESS_TOKEN;
}