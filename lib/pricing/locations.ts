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

/** Delivery fee for a location by exact name; unknown locations cost 0. */
export const getLocationPrice = (locationName: string): number => {
  const location = LOCATION_DATA.find((loc) => loc.name === locationName);
  return location ? location.price : 0;
};
