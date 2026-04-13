"use client";

import { useState, useEffect, useMemo } from "react";
import { Select, TYPE } from "baseui/select";
import { Block } from "baseui/block";
import type { SubwayStation } from "@/lib/types";
import { PATH_STATIONS } from "@/lib/constants";
import RouteTag from "./RouteTag";
import { useStyletron } from "baseui";

interface StationSearchProps {
  system: "subway" | "path";
  routeFilter?: string | null;
  onStationSelect: (stationId: string, stationName: string) => void;
}

export default function StationSearch({
  system,
  routeFilter,
  onStationSelect,
}: StationSearchProps) {
  const [css] = useStyletron();
  const [stations, setStations] = useState<SubwayStation[]>([]);
  const [value, setValue] = useState<Array<{ id: string; label: string; routes?: string[] }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (system === "subway") {
      setLoading(true);
      fetch("/api/subway/stations")
        .then((r) => r.json())
        .then((data) => setStations(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [system]);

  // Reset selection when route filter changes
  useEffect(() => {
    setValue([]);
  }, [routeFilter]);

  const options = useMemo(() => {
    if (system === "path") {
      return PATH_STATIONS.map((s) => ({
        id: s.station,
        label: s.name,
      }));
    }

    let filtered = stations;
    if (routeFilter) {
      filtered = stations.filter((s) => s.routes.includes(routeFilter));
    }

    return filtered.map((s) => ({
      id: s.stopId,
      label: s.name,
      routes: s.routes,
    }));
  }, [system, stations, routeFilter]);

  return (
    <Block paddingLeft="scale600" paddingRight="scale600">
      <Select
        options={options}
        value={value}
        placeholder={
          system === "subway"
            ? "Search subway stations..."
            : "Search PATH stations..."
        }
        type={TYPE.search}
        onChange={(params) => {
          const selected = params.value as Array<{ id: string; label: string }>;
          setValue(selected);
          if (selected.length > 0) {
            onStationSelect(selected[0].id as string, selected[0].label);
          }
        }}
        isLoading={loading}
        getOptionLabel={({ option }) => {
          if (system === "subway" && option?.routes) {
            return (
              <div className={css({ display: "flex", alignItems: "center", gap: "8px" })}>
                <span>{String(option.label)}</span>
                <div className={css({ display: "flex", gap: "3px", flexWrap: "wrap" })}>
                  {(option.routes as string[]).map((r: string) => (
                    <RouteTag key={r} route={r} size="small" />
                  ))}
                </div>
              </div>
            ) as unknown as React.ReactNode;
          }
          return String(option?.label || "") as unknown as React.ReactNode;
        }}
        overrides={{
          ControlContainer: {
            style: {
              backgroundColor: "#FFFFFF",
              borderTopWidth: "2px",
              borderBottomWidth: "2px",
              borderLeftWidth: "2px",
              borderRightWidth: "2px",
              borderTopColor: "#E2E2E2",
              borderBottomColor: "#E2E2E2",
              borderLeftColor: "#E2E2E2",
              borderRightColor: "#E2E2E2",
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
              borderBottomLeftRadius: "12px",
              borderBottomRightRadius: "12px",
            },
          },
        }}
      />
    </Block>
  );
}
