import { createLocalStorage } from "@/lib/create-local-storage";

export interface LocationData {
  address: string;
  coordinates: {
    lng: number;
    lat: number;
  };
}

export interface TransferSearchData {
  pickupLocation?: LocationData;
  dropoffLocation?: LocationData;
  pickupDate?: Date;
  pickupTime?: string | null;
  returnDate?: Date;
  returnTime?: string | null;
  passengers?: number;
  transferType?: "one_way" | "round_trip";
  distanceKm?: number;
  estimatedDurationMinutes?: number;
  /**
   * Identifies the exact pickup/dropoff coordinate pair that `distanceKm` and
   * `estimatedDurationMinutes` were computed for. On restore the metrics are
   * only trusted when this key matches the current pair, so a location change
   * with a still-pending Directions request can't leave stale distance (and
   * therefore a wrong fare) associated with the new pair.
   */
  routeInfoKey?: string;
  selectedVehicleId?: string;
}

const TRANSFER_STORAGE_KEY = "transferSearchData";
const DEFAULT_PASSENGERS = 1;
const DEFAULT_TRANSFER_TYPE = "one_way" as const;

const storage = createLocalStorage<TransferSearchData>({
  key: TRANSFER_STORAGE_KEY,
  label: "transfer",
  dateFields: ["pickupDate", "returnDate"],
  fallback: () => ({
    passengers: DEFAULT_PASSENGERS,
    transferType: DEFAULT_TRANSFER_TYPE,
  }),
  applyDefaults: (parsed) => ({
    ...parsed,
    passengers: parsed.passengers ?? DEFAULT_PASSENGERS,
    transferType: parsed.transferType ?? DEFAULT_TRANSFER_TYPE,
  }),
});

export const transferStorage = {
  ...storage,

  clearVehicleSelection: () => {
    const current = transferStorage.load();
    const { selectedVehicleId: _selectedVehicleId, ...rest } = current;
    transferStorage.clear();
    transferStorage.save(rest);
  },

  getDefaultPassengers: () => DEFAULT_PASSENGERS,
  getDefaultTransferType: () => DEFAULT_TRANSFER_TYPE,
};
