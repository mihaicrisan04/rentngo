import { MAX_TRANSFER_DISTANCE_KM } from "./constants";

export interface Coordinates {
  lng: number;
  lat: number;
}

const EARTH_RADIUS_KM = 6371.0088;
const LEGACY_DISTANCE_TOLERANCE_KM = 1;

export function assertValidCoordinates(coordinates: Coordinates): void {
  if (
    !Number.isFinite(coordinates.lng) ||
    !Number.isFinite(coordinates.lat) ||
    coordinates.lng < -180 ||
    coordinates.lng > 180 ||
    coordinates.lat < -90 ||
    coordinates.lat > 90
  ) {
    throw new Error("Invalid transfer coordinates.");
  }
}

export function haversineKm(from: Coordinates, to: Coordinates): number {
  assertValidCoordinates(from);
  assertValidCoordinates(to);

  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(to.lat - from.lat);
  const longitudeDelta = toRadians(to.lng - from.lng);
  const fromLatitude = toRadians(from.lat);
  const toLatitude = toRadians(to.lat);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function assertPlausibleRouteDistance(
  distanceKm: number,
  from: Coordinates,
  to: Coordinates,
): void {
  if (
    !Number.isFinite(distanceKm) ||
    distanceKm < 0 ||
    distanceKm > MAX_TRANSFER_DISTANCE_KM
  ) {
    throw new Error("Invalid transfer distance.");
  }

  const lowerBound = Math.max(
    0,
    haversineKm(from, to) - LEGACY_DISTANCE_TOLERANCE_KM,
  );
  if (distanceKm < lowerBound) {
    throw new Error(
      `Invalid transfer distance: ${distanceKm} km is below the straight-line lower bound.`,
    );
  }
}

export function isWithinDistanceTolerance(
  advisoryKm: number,
  authoritativeKm: number,
): boolean {
  if (!Number.isFinite(advisoryKm) || !Number.isFinite(authoritativeKm)) {
    return false;
  }
  return (
    Math.abs(advisoryKm - authoritativeKm) <= Math.max(2, authoritativeKm * 0.1)
  );
}

export function routeCacheKey(from: Coordinates, to: Coordinates): string {
  assertValidCoordinates(from);
  assertValidCoordinates(to);
  const format = ({ lng, lat }: Coordinates) =>
    `${lng.toFixed(4)},${lat.toFixed(4)}`;
  return `${format(from)}|${format(to)}`;
}
