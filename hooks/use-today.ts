"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

let cachedToday: Date | undefined;

function getTodaySnapshot(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (!cachedToday || cachedToday.getTime() !== now.getTime()) {
    cachedToday = now;
  }
  return cachedToday;
}

// Start of the current day, `undefined` during SSR/prerender. Reading the
// clock during server render would bake "today" into the prerendered shell
// under `cacheComponents` (next fails the build on it), so the server
// snapshot is empty and the real date appears on the client. Date pickers
// using this as `minDate` don't restrict past dates until then — selecting a
// date requires interaction, which implies the value is set.
export function useToday(): Date | undefined {
  return useSyncExternalStore(subscribe, getTodaySnapshot, () => undefined);
}
