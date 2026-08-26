// Pickup/return locations with their delivery fees in EUR.
// Moved out of components/shared/search-filters/location-picker.tsx so the
// Convex server can price location fees authoritatively.

export interface LocationWithPrice {
  name: string;
  price: number;
}

export const LOCATION_DATA: LocationWithPrice[] = [
  { name: "Aeroport Cluj-Napoca", price: 0 },
  { name: "Alba-Iulia", price: 80 },
  { name: "Bacau", price: 220 },
  { name: "Baia mare", price: 120 },
  { name: "Bistrita", price: 80 },
  { name: "Brasov", price: 180 },
  { name: "Bucuresti", price: 220 },
  { name: "Cluj-Napoca", price: 10 },
  { name: "Floresti", price: 10 },
  { name: "Oradea", price: 120 },
  { name: "Satu mare", price: 120 },
  { name: "Sibiu", price: 120 },
  { name: "Suceava", price: 220 },
  { name: "Targu Mures", price: 70 },
  { name: "Timisoara", price: 200 },
];

const normalizeLocationName = (name: string): string =>
  name.trim().toLowerCase();

const findLocation = (locationName: string): LocationWithPrice | undefined => {
  const normalized = normalizeLocationName(locationName);
  return LOCATION_DATA.find(
    (loc) => normalizeLocationName(loc.name) === normalized,
  );
};

/**
 * Delivery fee for a location by name (trimmed, case-insensitive so a
 * client can't dodge the fee on the authoritative recompute by changing
 * casing); unknown locations cost 0 — the picker offers a fixed list, so an
 * unknown name never comes from an honest client, and the server logs it
 * rather than hard-failing the booking (see createReservation).
 */
export const getLocationPrice = (locationName: string): number => {
  return findLocation(locationName)?.price ?? 0;
};

/** Whether a name matches a known location (trimmed, case-insensitive). */
export const isKnownLocation = (locationName: string): boolean => {
  return findLocation(locationName) !== undefined;
};
