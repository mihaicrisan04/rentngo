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
      const existing = searchStorage.load();
      const updated = { ...existing, ...data };
      
      // Convert dates to ISO strings for storage
      const toStore = {
        ...updated,
        pickupDate: updated.pickupDate?.toISOString(),
        returnDate: updated.returnDate?.toISOString(),
      };
      
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
      
      const result = {
        ...parsed,
        deliveryLocation,
        restitutionLocation,
        pickupDate,
        returnDate,
      };
      
      // If dates were corrected or locations were defaulted, save the corrected values back
      const hasDateCorrections = (
        (parsed.pickupDate && pickupDate && new Date(parsed.pickupDate).getTime() !== pickupDate.getTime()) ||
        (parsed.returnDate && returnDate && new Date(parsed.returnDate).getTime() !== returnDate.getTime())
      );
      const hasLocationDefaults = (
        !parsed.deliveryLocation || parsed.deliveryLocation.trim() === "" ||
        !parsed.restitutionLocation || parsed.restitutionLocation.trim() === ""
      );
      
      if (hasDateCorrections || hasLocationDefaults) {
        // Save corrected values back to localStorage
        setTimeout(() => searchStorage.save(result), 0);
      }
      
      return result;
    } catch (error) {
      console.warn('Failed to load search data from localStorage:', error);
      return {
        deliveryLocation: DEFAULT_LOCATION,
        restitutionLocation: DEFAULT_LOCATION,
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
  ensureLocationDefault: getDefaultLocationIfEmpty,
}; 
