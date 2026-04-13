"use client";

import { useState, useEffect } from "react";
import type { GeoCoordinates, NearbyStation, SubwayStation } from "../types";
import { findNearbyStations } from "../geo";
import { PATH_STATIONS } from "../constants";

let cachedStations: SubwayStation[] | null = null;

export function useNearbyStations(location: GeoCoordinates | null, limit = 5) {
  const [stations, setStations] = useState<NearbyStation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!location) {
      setStations([]);
      return;
    }

    async function compute() {
      setLoading(true);

      if (!cachedStations) {
        const res = await fetch("/api/subway/stations");
        cachedStations = await res.json();
      }

      const nearby = findNearbyStations(location!, cachedStations!, PATH_STATIONS, limit);
      setStations(nearby);
      setLoading(false);
    }

    compute();
  }, [location, limit]);

  return { stations, loading };
}
