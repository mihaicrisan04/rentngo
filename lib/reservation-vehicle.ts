// Per-tab storage for the vehicle currently being reserved.
//
// sessionStorage (not localStorage) is deliberate: the selection is scoped to
// the tab, so it survives a ro↔en locale switch (same tab, path rewritten,
// query params dropped) without leaking between tabs or lingering after the
// tab closes. That keeps two concurrent reservation tabs from clobbering each
// other's car and avoids a bookmarked /reservation reloading a stale pick.
const KEY = "reservationVehicleId";

export const reservationVehicle = {
  set(vehicleId: string) {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(KEY, vehicleId);
    } catch {
      // storage unavailable (private mode / quota) — non-fatal
    }
  },

  get(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return sessionStorage.getItem(KEY);
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
