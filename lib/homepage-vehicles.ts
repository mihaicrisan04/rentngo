const LATEST_VEHICLES_COUNT = 3;

export type HomepageVehiclesTitleKey =
  | "featuredCars"
  | "ourLatestCars"
  | "noCarsAvailable";

export interface HomepageVehicles<V> {
  vehicles: V[];
  titleKey: HomepageVehiclesTitleKey;
}

export function pickHomepageVehicles<V>(
  featuredVehicles: V[],
  allVehicles: V[],
): HomepageVehicles<V> {
  if (featuredVehicles.length > 0) {
    return { vehicles: featuredVehicles, titleKey: "featuredCars" };
  }
  const latestVehicles = allVehicles.slice(0, LATEST_VEHICLES_COUNT);
  return {
    vehicles: latestVehicles,
    titleKey: latestVehicles.length > 0 ? "ourLatestCars" : "noCarsAvailable",
  };
}
