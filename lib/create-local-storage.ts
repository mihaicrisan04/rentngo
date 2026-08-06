export const validateAndFixDate = (
  date: Date | undefined,
): Date | undefined => {
  if (!date) return undefined;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date.getTime() < today.getTime()) {
    return today;
  }

  return date;
};

interface LocalStorageConfig<T extends object> {
  key: string;
  label: string;
  dateFields: readonly (keyof T)[];
  fallback: () => T;
  applyDefaults: (parsed: T) => T;
}

export interface LocalStorageApi<T extends object> {
  save: (data: Partial<T>) => void;
  load: () => T;
  clear: () => void;
  updateField: <K extends keyof T>(field: K, value: T[K]) => void;
  validateDate: (date: Date | undefined) => Date | undefined;
}

export function createLocalStorage<T extends object>(
  config: LocalStorageConfig<T>,
): LocalStorageApi<T> {
  const { key, label, dateFields, fallback, applyDefaults } = config;

  const save = (data: Partial<T>) => {
    if (typeof window === "undefined") return;

    try {
      let existing: Record<string, unknown> = {};
      const stored = localStorage.getItem(key);
      if (stored) {
        existing = JSON.parse(stored);
      }

      const dataToMerge: Record<string, unknown> = { ...data };
      for (const field of dateFields) {
        const value = data[field];
        if (value instanceof Date) {
          dataToMerge[field as string] = value.toISOString();
        }
      }

      localStorage.setItem(key, JSON.stringify({ ...existing, ...dataToMerge }));
    } catch (error) {
      console.warn(`Failed to save ${label} data to localStorage:`, error);
    }
  };

  const load = (): T => {
    if (typeof window === "undefined") return fallback();

    try {
      const stored = localStorage.getItem(key);
      const parsed: T = stored ? JSON.parse(stored) : {};

      for (const field of dateFields) {
        const value = parsed[field];
        parsed[field] = validateAndFixDate(
          value ? new Date(value as string) : undefined,
        ) as T[typeof field];
      }

      return applyDefaults(parsed);
    } catch (error) {
      console.warn(`Failed to load ${label} data from localStorage:`, error);
      return fallback();
    }
  };

  const clear = () => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to clear ${label} data from localStorage:`, error);
    }
  };

  const updateField = <K extends keyof T>(field: K, value: T[K]) => {
    save({ ...load(), [field]: value });
  };

  return { save, load, clear, updateField, validateDate: validateAndFixDate };
}
