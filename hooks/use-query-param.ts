"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Admin view state lives in the URL so a view can be shared, refreshed and
 * walked back through history. Callers must sit under a Suspense boundary
 * because of `useSearchParams`.
 */
export function useQueryParam(key: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setValue = useCallback(
    (next: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === null) {
        params.delete(key);
      } else {
        params.set(key, next);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [key, pathname, router, searchParams],
  );

  return [searchParams.get(key), setValue] as const;
}

export function useBooleanQueryParam(key: string) {
  const [value, setValue] = useQueryParam(key);

  const setEnabled = useCallback(
    (enabled: boolean) => setValue(enabled ? "1" : null),
    [setValue],
  );

  return [value === "1", setEnabled] as const;
}

export function useNumberQueryParam(key: string, fallback: number) {
  const [value, setValue] = useQueryParam(key);
  const parsed = Number(value);
  const current = Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;

  const setNumber = useCallback(
    (next: number) => setValue(next === fallback ? null : String(next)),
    [fallback, setValue],
  );

  return [current, setNumber] as const;
}
