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
  selectedVehicleId?: string;
}

const TRANSFER_STORAGE_KEY = "transferSearchData";
const DEFAULT_PASSENGERS = 1;
const DEFAULT_TRANSFER_TYPE = "one_way" as const;

const validateAndFixDate = (date: Date | undefined): Date | undefined => {
  if (!date) return undefined;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date.getTime() < today.getTime()) {
    return today;
  }

  return date;
};

export const transferStorage = {
  save: (data: Partial<TransferSearchData>) => {
    if (typeof window === "undefined") return;

    try {
      let existing: Record<string, unknown> = {};
      const stored = localStorage.getItem(TRANSFER_STORAGE_KEY);
      if (stored) {
        existing = JSON.parse(stored);
      }

      const dataToMerge: Record<string, unknown> = { ...data };
      if (data.pickupDate instanceof Date) {
        dataToMerge.pickupDate = data.pickupDate.toISOString();
      }
      if (data.returnDate instanceof Date) {
        dataToMerge.returnDate = data.returnDate.toISOString();
      }

      const toStore = { ...existing, ...dataToMerge };

      localStorage.setItem(TRANSFER_STORAGE_KEY, JSON.stringify(toStore));
    } catch (error) {
      console.warn("Failed to save transfer data to localStorage:", error);
    }
  },

  load: (): TransferSearchData => {
    if (typeof window === "undefined")
      return {
        passengers: DEFAULT_PASSENGERS,
        transferType: DEFAULT_TRANSFER_TYPE,
      };

    try {
      const stored = localStorage.getItem(TRANSFER_STORAGE_KEY);
      let parsed: TransferSearchData = {};

      if (stored) {
        parsed = JSON.parse(stored);
      }

      const pickupDate = validateAndFixDate(
        parsed.pickupDate ? new Date(parsed.pickupDate) : undefined,
      );
      const returnDate = validateAndFixDate(
        parsed.returnDate ? new Date(parsed.returnDate) : undefined,
      );

      return {
        ...parsed,
        pickupDate,
        returnDate,
        passengers: parsed.passengers ?? DEFAULT_PASSENGERS,
        transferType: parsed.transferType ?? DEFAULT_TRANSFER_TYPE,
      };
    } catch (error) {
      console.warn("Failed to load transfer data from localStorage:", error);
      return {
        passengers: DEFAULT_PASSENGERS,
        transferType: DEFAULT_TRANSFER_TYPE,
      };
    }
  },

  clear: () => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(TRANSFER_STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear transfer data from localStorage:", error);
    }
  },

  updateField: <K extends keyof TransferSearchData>(
    field: K,
    value: TransferSearchData[K],
  ) => {
    const current = transferStorage.load();
    transferStorage.save({ ...current, [field]: value });
  },

  clearVehicleSelection: () => {
    const current = transferStorage.load();
    const { selectedVehicleId: _selectedVehicleId, ...rest } = current;
    transferStorage.clear();
    transferStorage.save(rest);
  },

  validateDate: validateAndFixDate,
  getDefaultPassengers: () => DEFAULT_PASSENGERS,
  getDefaultTransferType: () => DEFAULT_TRANSFER_TYPE,
};