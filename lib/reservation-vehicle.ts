// Per-tab storage for the vehicle currently being reserved.
//
// sessionStorage (not localStorage) is deliberate: the selection is scoped to
// the tab, so it survives a ro↔en locale switch (same tab, path rewritten,
// query params dropped) without leaking between tabs or lingering after the
// tab closes. That keeps two concurrent reservation tabs from clobbering each
// other's car and avoids a bookmarked /reservation reloading a stale pick.
import type { Id } from "@/convex/_generated/dataModel";

const KEY = "reservationVehicleId";

export const reservationVehicle = {
  set(vehicleId: Id<"vehicles">) {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(KEY, vehicleId);
    } catch {
      // storage unavailable (private mode / quota) — non-fatal
    }
  },

  get(): Id<"vehicles"> | null {
    if (typeof window === "undefined") return null;
    try {
      return sessionStorage.getItem(KEY) as Id<"vehicles"> | null;
    } catch {
      return null;
    }
  },

  clear() {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  },
};
