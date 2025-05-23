export interface SearchData {
  deliveryLocation?: string;
  pickupDate?: Date;
  pickupTime?: string | null;
  restitutionLocation?: string;
  returnDate?: Date;
  returnTime?: string | null;
}

const SEARCH_STORAGE_KEY = "carRentalSearchData";

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

  // Load search data from localStorage
  load: (): SearchData => {
    if (typeof window === 'undefined') return {};
    
    try {
      const stored = localStorage.getItem(SEARCH_STORAGE_KEY);
      if (!stored) return {};
      
      const parsed = JSON.parse(stored);
      
      // Convert ISO strings back to dates
      return {
        ...parsed,
        pickupDate: parsed.pickupDate ? new Date(parsed.pickupDate) : undefined,
        returnDate: parsed.returnDate ? new Date(parsed.returnDate) : undefined,
      };
    } catch (error) {
      console.warn('Failed to load search data from localStorage:', error);
      return {};
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
}; 