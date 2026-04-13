"use client";

import { useState, useEffect, useCallback } from "react";
import type { GeoCoordinates } from "../types";

export function useGeolocation() {
  const [location, setLocation] = useState<GeoCoordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<"prompt" | "granted" | "denied" | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions) return;

    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        setPermissionState(result.state as "prompt" | "granted" | "denied");
        result.addEventListener("change", () => {
          setPermissionState(result.state as "prompt" | "granted" | "denied");
        });
      })
      .catch(() => {
        // permissions API not supported, leave as null
      });
  }, []);

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLoading(false);
        setPermissionState("granted");
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Location access denied");
            setPermissionState("denied");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Location unavailable");
            break;
          case err.TIMEOUT:
            setError("Location request timed out");
            break;
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Auto-request if previously granted
  useEffect(() => {
    if (permissionState === "granted" && !location && !loading) {
      requestLocation();
    }
  }, [permissionState, location, loading, requestLocation]);

  return { location, loading, error, permissionState, requestLocation };
}
