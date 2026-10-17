import { useEffect, useState } from "react";

export function usePeriodicNow(intervalMs = 60_000): number | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const refreshNow = () =>
      setNow(Math.floor(Date.now() / intervalMs) * intervalMs);
    refreshNow();

    const interval = window.setInterval(refreshNow, intervalMs);
    return () => window.clearInterval(interval);
  }, [intervalMs]);

  return now;
}
