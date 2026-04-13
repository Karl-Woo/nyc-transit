"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ArrivalDisplay } from "../types";

export function useArrivals(
  system: "subway" | "path",
  stationId: string | null
) {
  const [arrivals, setArrivals] = useState<ArrivalDisplay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const fetchArrivals = useCallback(async () => {
    if (!stationId) return;

    setLoading(true);
    setError(null);

    try {
      const url =
        system === "subway"
          ? `/api/subway/arrivals?station=${stationId}`
          : `/api/path/realtime?station=${stationId}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`API returned ${res.status}`);

      const data = await res.json();
      setArrivals(data.arrivals || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch arrivals");
    } finally {
      setLoading(false);
    }
  }, [system, stationId]);

  // Fetch on station change
  useEffect(() => {
    if (!stationId) {
      setArrivals([]);
      setError(null);
      return;
    }

    fetchArrivals();

    // Auto-refresh every 30 seconds
    intervalRef.current = setInterval(fetchArrivals, 30_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [stationId, fetchArrivals]);

  // Update minutes countdown every 15 seconds
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setArrivals((prev) => {
        const now = Math.floor(Date.now() / 1000);
        return prev
          .map((a) => ({
            ...a,
            minutesAway: Math.max(0, Math.round((a.arrivalTime - now) / 60)),
          }))
          .filter((a) => a.arrivalTime > now - 30);
      });
    }, 15_000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  return { arrivals, loading, error, lastUpdated, refresh: fetchArrivals };
}
