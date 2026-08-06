import { createLocalStorage } from "@/lib/create-local-storage";

export interface SearchData {
  deliveryLocation?: string;
  pickupDate?: Date;
  pickupTime?: string | null;
  restitutionLocation?: string;
  returnDate?: Date;
  returnTime?: string | null;
}

const SEARCH_STORAGE_KEY = "carRentalSearchData";
export const DEFAULT_SEARCH_LOCATION = "Aeroport Cluj-Napoca";
export const DEFAULT_SEARCH_TIME = "10:00";

const getDefaultLocationIfEmpty = (location: string | undefined): string => {
  return location && location.trim() !== "" ? location : DEFAULT_SEARCH_LOCATION;
};

const defaults = (): SearchData => ({
  deliveryLocation: DEFAULT_SEARCH_LOCATION,
  restitutionLocation: DEFAULT_SEARCH_LOCATION,
  pickupTime: DEFAULT_SEARCH_TIME,
  returnTime: DEFAULT_SEARCH_TIME,
});

const storage = createLocalStorage<SearchData>({
  key: SEARCH_STORAGE_KEY,
  label: "search",
  dateFields: ["pickupDate", "returnDate"],
  fallback: defaults,
  applyDefaults: (parsed) => ({
    ...parsed,
    deliveryLocation: getDefaultLocationIfEmpty(parsed.deliveryLocation),
    restitutionLocation: getDefaultLocationIfEmpty(parsed.restitutionLocation),
    pickupTime: parsed.pickupTime ?? DEFAULT_SEARCH_TIME,
    returnTime: parsed.returnTime ?? DEFAULT_SEARCH_TIME,
  }),
});

export const applySearchUpdates = (
  prev: SearchData,
  updates: Partial<SearchData>
): SearchData => {
  const next = { ...prev, ...updates };
  if (
    next.pickupDate &&
    next.returnDate &&
    next.returnDate.getTime() < next.pickupDate.getTime()
  ) {
    next.returnDate = next.pickupDate;
  }
  return next;
};

export const searchStorage = {
  ...storage,
  getDefaultLocation: () => DEFAULT_SEARCH_LOCATION,
  getDefaultTime: () => DEFAULT_SEARCH_TIME,
  ensureLocationDefault: getDefaultLocationIfEmpty,
};
