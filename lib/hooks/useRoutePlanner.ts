"use client";

import { useState, useEffect } from "react";
import type { TripOrigin, TripDestination, RouteOption, RouteGraph, SubwayStation } from "../types";
import { findRouteOptions } from "../routing";

let cachedRouteGraph: RouteGraph | null = null;
let cachedSubwayStations: SubwayStation[] | null = null;

export function useRoutePlanner(
  origin: TripOrigin | null,
  destination: TripDestination | null
) {
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!origin || !destination) {
      setRoutes([]);
      return;
    }

    async function compute() {
      setLoading(true);
      setError(null);

      try {
        if (!cachedRouteGraph) {
          const mod = await import("../data/route-graph.json");
          cachedRouteGraph = mod.default as RouteGraph;
        }
        if (!cachedSubwayStations) {
          const res = await fetch("/api/subway/stations");
          cachedSubwayStations = await res.json();
        }

        const options = findRouteOptions(
          origin!.nearbyStations,
          destination!.nearbyStations,
          cachedRouteGraph!,
          cachedSubwayStations!
        );

        setRoutes(options);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to find routes");
      } finally {
        setLoading(false);
      }
    }

    compute();
  }, [origin, destination]);

  return { routes, loading, error };
}
