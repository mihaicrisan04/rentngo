"use client";

import { useEffect, useState } from "react";

// Start of the current day, set after hydration only. Reading the clock during
// render would be baked into the prerendered shell under `cacheComponents`
// (next errors on it at build time), so callers get `undefined` during
// SSR/prerender and the real date once mounted. Date pickers using this as
// `minDate` simply don't restrict past dates until hydration — selecting a
// date requires interaction, which implies the value is set by then.
export function useToday(): Date | undefined {
  const [today, setToday] = useState<Date>();

  useEffect(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    setToday(now);
  }, []);

  return today;
}
