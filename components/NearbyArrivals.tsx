"use client";

import { useState, useEffect } from "react";
import { useStyletron } from "baseui";
import { Block } from "baseui/block";
import { LabelMedium, LabelSmall, ParagraphSmall } from "baseui/typography";
import { Spinner } from "baseui/spinner";
import { Notification, KIND as NOTIFICATION_KIND } from "baseui/notification";
// Tag has React type conflicts with baseui's bundled @types/react, using styled Block instead
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
  const [css, theme] = useStyletron();
  const [stationArrivals, setStationArrivals] = useState<Map<string, StationArrivals>>(new Map());

  useEffect(() => {
    if (stations.length === 0) return;

    const nearbyToFetch = stations.slice(0, 3);
    const subwayIds = nearbyToFetch.filter((s) => s.system === "subway").map((s) => s.stationId);
    const pathStations = nearbyToFetch.filter((s) => s.system === "path");

    async function fetchAll() {
      const newMap = new Map<string, StationArrivals>();
      for (const s of nearbyToFetch) {
        newMap.set(s.stationId, {
          stationName: "name" in s.station ? s.station.name : "",
          arrivals: [],
          loading: true,
          error: null,
        });
      }
      setStationArrivals(new Map(newMap));

      if (subwayIds.length > 0) {
        try {
          const res = await fetch(`/api/subway/nearby-arrivals?stations=${subwayIds.join(",")}`);
          const data = await res.json();
          for (const [id, info] of Object.entries(data) as [string, { stationName: string; arrivals: ArrivalDisplay[] }][]) {
            newMap.set(id, { stationName: info.stationName, arrivals: info.arrivals.slice(0, 4), loading: false, error: null });
          }
        } catch {
          for (const id of subwayIds) {
            newMap.set(id, { ...newMap.get(id)!, loading: false, error: "Failed to load" });
          }
        }
      }

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
            arrivals: [], loading: false, error: "Failed to load",
          });
        }
      }
      setStationArrivals(new Map(newMap));
    }

    fetchAll();
    const interval = setInterval(fetchAll, 30_000);
    return () => clearInterval(interval);
  }, [stations]);

  if (loading) {
    return (
      <Block display="flex" justifyContent="center" paddingTop="scale1200" paddingBottom="scale1200">
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

  return (
    <Block paddingBottom="scale800">
      {stations.slice(0, 3).map((nearby) => {
        const data = stationArrivals.get(nearby.stationId);
        const stationName = data?.stationName || ("name" in nearby.station ? nearby.station.name : "");
        const routes = nearby.system === "subway" && "routes" in nearby.station ? nearby.station.routes : [];

        return (
          <Block key={nearby.stationId} marginBottom="scale500">
            {/* Station header */}
            <Block
              paddingTop="scale400"
              paddingBottom="scale400"
              paddingLeft="scale600"
              paddingRight="scale600"
              backgroundColor={theme.colors.backgroundPrimary}
              overrides={{
                Block: {
                  style: {
                    borderBottom: `1px solid ${theme.colors.borderOpaque}`,
                  },
                },
              }}
            >
              <Block display="flex" alignItems="center" overrides={{ Block: { style: { gap: theme.sizing.scale200, flexWrap: "wrap" } } }}>
                <LabelMedium color={theme.colors.contentPrimary} overrides={{ Block: { style: { fontWeight: 600 } } }}>
                  {stationName}
                </LabelMedium>
                {routes.slice(0, 6).map((r) => (
                  <RouteTag key={r} route={r} size="small" />
                ))}
                {nearby.system === "path" && (
                  <LabelSmall
                    color={theme.colors.accent}
                    overrides={{
                      Block: {
                        style: {
                          backgroundColor: theme.colors.backgroundLightAccent,
                          paddingTop: "2px",
                          paddingBottom: "2px",
                          paddingLeft: theme.sizing.scale200,
                          paddingRight: theme.sizing.scale200,
                          borderRadius: theme.borders.radius200,
                          fontWeight: 600,
                        },
                      },
                    }}
                  >
                    PATH
                  </LabelSmall>
                )}
              </Block>
              <ParagraphSmall color={theme.colors.contentTertiary} marginTop="scale0">
                {nearby.distanceDisplay} · {nearby.walkMinutes} min walk
              </ParagraphSmall>
            </Block>

            {/* Arrivals */}
            {data?.loading ? (
              <Block display="flex" justifyContent="center" paddingTop="scale600" paddingBottom="scale600" backgroundColor={theme.colors.backgroundPrimary}>
                <Spinner $size={24} />
              </Block>
            ) : data?.error ? (
              <Block paddingTop="scale300" paddingBottom="scale300" paddingLeft="scale600" backgroundColor={theme.colors.backgroundPrimary}>
                <ParagraphSmall color={theme.colors.contentNegative}>{data.error}</ParagraphSmall>
              </Block>
            ) : data?.arrivals && data.arrivals.length > 0 ? (
              <Block display="flex" flexDirection="column" overrides={{ Block: { style: { gap: "1px", backgroundColor: theme.colors.borderOpaque } } }}>
                {data.arrivals.map((a) => (
                  <ArrivalCard key={a.id} arrival={a} />
                ))}
              </Block>
            ) : (
              <Block paddingTop="scale500" paddingBottom="scale500" paddingLeft="scale600" backgroundColor={theme.colors.backgroundPrimary}>
                <ParagraphSmall color={theme.colors.contentTertiary}>No upcoming trains</ParagraphSmall>
              </Block>
            )}
          </Block>
        );
      })}
    </Block>
  );
}
