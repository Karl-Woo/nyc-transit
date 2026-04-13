"use client";

import { useState, useEffect } from "react";
import { useStyletron } from "baseui";
import { Block } from "baseui/block";
import { Spinner } from "baseui/spinner";
import { Notification, KIND as NOTIFICATION_KIND } from "baseui/notification";
import ArrivalCard from "./ArrivalCard";
import RouteTag from "./RouteTag";
import type { NearbyStation, ArrivalDisplay } from "@/lib/types";

interface NearbyArrivalsProps {
  stations: NearbyStation[];
  loading: boolean;
}

interface StationArrivals {
  stationName: string;
  arrivals: ArrivalDisplay[];
  loading: boolean;
  error: string | null;
}

export default function NearbyArrivals({ stations, loading }: NearbyArrivalsProps) {
  const [css] = useStyletron();
  const [stationArrivals, setStationArrivals] = useState<Map<string, StationArrivals>>(new Map());

  useEffect(() => {
    if (stations.length === 0) return;

    const nearbyToFetch = stations.slice(0, 3);

    // Fetch subway stations via batch endpoint
    const subwayIds = nearbyToFetch
      .filter((s) => s.system === "subway")
      .map((s) => s.stationId);

    const pathStations = nearbyToFetch.filter((s) => s.system === "path");

    async function fetchAll() {
      const newMap = new Map<string, StationArrivals>();

      // Initialize loading state
      for (const s of nearbyToFetch) {
        newMap.set(s.stationId, {
          stationName: "name" in s.station ? s.station.name : "",
          arrivals: [],
          loading: true,
          error: null,
        });
      }
      setStationArrivals(new Map(newMap));

      // Fetch subway batch
      if (subwayIds.length > 0) {
        try {
          const res = await fetch(`/api/subway/nearby-arrivals?stations=${subwayIds.join(",")}`);
          const data = await res.json();
          for (const [id, info] of Object.entries(data) as [string, { stationName: string; arrivals: ArrivalDisplay[] }][]) {
            newMap.set(id, {
              stationName: info.stationName,
              arrivals: info.arrivals.slice(0, 4),
              loading: false,
              error: null,
            });
          }
        } catch {
          for (const id of subwayIds) {
            newMap.set(id, { ...newMap.get(id)!, loading: false, error: "Failed to load" });
          }
        }
      }

      // Fetch PATH individually
      for (const ps of pathStations) {
        try {
          const res = await fetch(`/api/path/realtime?station=${ps.stationId}`);
          const data = await res.json();
          newMap.set(ps.stationId, {
            stationName: "name" in ps.station ? ps.station.name : ps.stationId,
            arrivals: (data.arrivals || []).slice(0, 4),
            loading: false,
            error: null,
          });
        } catch {
          newMap.set(ps.stationId, {
            stationName: "name" in ps.station ? ps.station.name : ps.stationId,
            arrivals: [],
            loading: false,
            error: "Failed to load",
          });
        }
      }

      setStationArrivals(new Map(newMap));
    }

    fetchAll();

    // Auto-refresh every 30s
    const interval = setInterval(fetchAll, 30_000);
    return () => clearInterval(interval);
  }, [stations]);

  if (loading) {
    return (
      <Block display="flex" justifyContent="center" padding="scale1200 scale600">
        <Spinner $size={40} />
      </Block>
    );
  }

  if (stations.length === 0) {
    return (
      <Block padding="scale600">
        <Notification kind={NOTIFICATION_KIND.info} closeable={false}>
          Tap the location button or enter an address to find trains near you
        </Notification>
      </Block>
    );
  }

  const displayStations = stations.slice(0, 3);

  return (
    <div className={css({ paddingBottom: "24px" })}>
      {displayStations.map((nearby) => {
        const data = stationArrivals.get(nearby.stationId);
        const stationName = data?.stationName || ("name" in nearby.station ? nearby.station.name : "");
        const routes = nearby.system === "subway" && "routes" in nearby.station ? nearby.station.routes : [];

        return (
          <div key={nearby.stationId} className={css({ marginBottom: "12px" })}>
            {/* Station header */}
            <div
              className={css({
                padding: "10px 16px",
                backgroundColor: "#FFFFFF",
                borderBottom: "1px solid #E2E2E2",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              })}
            >
              <div>
                <div className={css({ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" })}>
                  <span className={css({ fontSize: "15px", fontWeight: 600, color: "#000000" })}>
                    {stationName}
                  </span>
                  {routes.slice(0, 6).map((r) => (
                    <RouteTag key={r} route={r} size="small" />
                  ))}
                  {nearby.system === "path" && (
                    <span
                      className={css({
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#0039A6",
                        backgroundColor: "#E8F0FE",
                        padding: "2px 6px",
                        borderRadius: "4px",
                      })}
                    >
                      PATH
                    </span>
                  )}
                </div>
                <div className={css({ fontSize: "12px", color: "#666666", marginTop: "2px" })}>
                  {nearby.distanceDisplay} · {nearby.walkMinutes} min walk
                </div>
              </div>
            </div>

            {/* Arrivals */}
            {data?.loading ? (
              <div className={css({ display: "flex", justifyContent: "center", padding: "16px", backgroundColor: "#FFFFFF" })}>
                <Spinner $size={24} />
              </div>
            ) : data?.error ? (
              <div className={css({ padding: "8px 16px", fontSize: "13px", color: "#E11900", backgroundColor: "#FFFFFF" })}>
                {data.error}
              </div>
            ) : data?.arrivals && data.arrivals.length > 0 ? (
              <div className={css({ display: "flex", flexDirection: "column", gap: "1px", backgroundColor: "#E2E2E2" })}>
                {data.arrivals.map((a) => (
                  <ArrivalCard key={a.id} arrival={a} />
                ))}
              </div>
            ) : (
              <div className={css({ padding: "12px 16px", fontSize: "13px", color: "#666666", backgroundColor: "#FFFFFF" })}>
                No upcoming trains
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
