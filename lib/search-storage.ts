export interface SearchData {
  deliveryLocation?: string;
  pickupDate?: Date;
  pickupTime?: string | null;
  restitutionLocation?: string;
  returnDate?: Date;
  returnTime?: string | null;
}

const SEARCH_STORAGE_KEY = "carRentalSearchData";
const DEFAULT_LOCATION = "Aeroport Cluj-Napoca";
const DEFAULT_TIME = "10:00";



// Utility to validate and fix dates that are in the past
const validateAndFixDate = (date: Date | undefined): Date | undefined => {
  if (!date) return undefined;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // If the date is in the past, return today's date instead
  if (date.getTime() < today.getTime()) {
    return today;
  }
  
  return date;
};

// Utility to get default location if none provided
const getDefaultLocationIfEmpty = (location: string | undefined): string => {
  return location && location.trim() !== "" ? location : DEFAULT_LOCATION;
};

export const searchStorage = {
  // Save search data to localStorage
  save: (data: Partial<SearchData>) => {
    if (typeof window === 'undefined') return;
    
    try {
      // Read existing data directly from localStorage (not via load() to avoid circular calls)
      let existing: Record<string, unknown> = {};
      const stored = localStorage.getItem(SEARCH_STORAGE_KEY);
      if (stored) {
        existing = JSON.parse(stored);
      }
      
      // Convert incoming dates to ISO strings
      const dataToMerge: Record<string, unknown> = { ...data };
      if (data.pickupDate instanceof Date) {
        dataToMerge.pickupDate = data.pickupDate.toISOString();
      }
      if (data.returnDate instanceof Date) {
        dataToMerge.returnDate = data.returnDate.toISOString();
      }
      
      const toStore = { ...existing, ...dataToMerge };
      
      localStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(toStore));
    } catch (error) {
      console.warn('Failed to save search data to localStorage:', error);
    }
  },

  // Load search data from localStorage with validation and defaults
  load: (): SearchData => {
    if (typeof window === 'undefined') return {
      deliveryLocation: DEFAULT_LOCATION,
      restitutionLocation: DEFAULT_LOCATION,
      pickupTime: DEFAULT_TIME,
      returnTime: DEFAULT_TIME,
    };
    
    try {
      const stored = localStorage.getItem(SEARCH_STORAGE_KEY);
      let parsed: SearchData = {};
      
      if (stored) {
        parsed = JSON.parse(stored);
      }
      
      // Convert ISO strings back to dates and validate them
      const pickupDate = validateAndFixDate(parsed.pickupDate ? new Date(parsed.pickupDate) : undefined);
      const returnDate = validateAndFixDate(parsed.returnDate ? new Date(parsed.returnDate) : undefined);
      
      // Apply defaults for locations
      const deliveryLocation = getDefaultLocationIfEmpty(parsed.deliveryLocation);
      const restitutionLocation = getDefaultLocationIfEmpty(parsed.restitutionLocation);
      
      // Apply defaults for times
      const pickupTime = parsed.pickupTime ?? DEFAULT_TIME;
      const returnTime = parsed.returnTime ?? DEFAULT_TIME;

      const result = {
        ...parsed,
        deliveryLocation,
        restitutionLocation,
        pickupDate,
        returnDate,
        pickupTime,
        returnTime,
      };
      
      // Note: Corrected values will be saved back by the hook's useEffect when state changes
      // Do NOT call save() here as it causes infinite loops
      
      return result;
    } catch (error) {
      console.warn('Failed to load search data from localStorage:', error);
      return {
        deliveryLocation: DEFAULT_LOCATION,
        restitutionLocation: DEFAULT_LOCATION,
        pickupTime: DEFAULT_TIME,
        returnTime: DEFAULT_TIME,
      };
    }
  },

  // Clear all search data
  clear: () => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(SEARCH_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear search data from localStorage:', error);
    }
  },

  // Update specific field
  updateField: <K extends keyof SearchData>(field: K, value: SearchData[K]) => {
    const current = searchStorage.load();
    searchStorage.save({ ...current, [field]: value });
  },

  // Helper functions
  validateDate: validateAndFixDate,
  getDefaultLocation: () => DEFAULT_LOCATION,
  getDefaultTime: () => DEFAULT_TIME,
  ensureLocationDefault: getDefaultLocationIfEmpty,
}; 
