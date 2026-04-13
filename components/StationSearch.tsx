"use client";

import { useState, useEffect, useMemo } from "react";
import { useStyletron } from "baseui";
import { Block } from "baseui/block";
import { Select, TYPE } from "baseui/select";
import { LabelMedium } from "baseui/typography";
import type { SubwayStation } from "@/lib/types";
import { PATH_STATIONS } from "@/lib/constants";
import RouteTag from "./RouteTag";

interface StationSearchProps {
  system: "subway" | "path";
  routeFilter?: string | null;
  onStationSelect: (stationId: string, stationName: string) => void;
}

export default function StationSearch({ system, routeFilter, onStationSelect }: StationSearchProps) {
  const [css, theme] = useStyletron();
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

  useEffect(() => { setValue([]); }, [routeFilter]);

  const options = useMemo(() => {
    if (system === "path") {
      return PATH_STATIONS.map((s) => ({ id: s.station, label: s.name }));
    }
    let filtered = stations;
    if (routeFilter) { filtered = stations.filter((s) => s.routes.includes(routeFilter)); }
    return filtered.map((s) => ({ id: s.stopId, label: s.name, routes: s.routes }));
  }, [system, stations, routeFilter]);

  return (
    <Block paddingLeft="scale600" paddingRight="scale600">
      <Select
        options={options}
        value={value}
        placeholder={system === "subway" ? "Search subway stations..." : "Search PATH stations..."}
        type={TYPE.search}
        onChange={(params) => {
          const selected = params.value as Array<{ id: string; label: string }>;
          setValue(selected);
          if (selected.length > 0) { onStationSelect(selected[0].id as string, selected[0].label); }
        }}
        isLoading={loading}
        getOptionLabel={({ option }) => {
          if (system === "subway" && option?.routes) {
            return (
              <Block display="flex" alignItems="center" overrides={{ Block: { style: { gap: theme.sizing.scale300 } } }}>
                <LabelMedium>{String(option.label)}</LabelMedium>
                <Block display="flex" overrides={{ Block: { style: { gap: theme.sizing.scale100, flexWrap: "wrap" } } }}>
                  {(option.routes as string[]).map((r: string) => (
                    <RouteTag key={r} route={r} size="small" />
                  ))}
                </Block>
              </Block>
            ) as unknown as React.ReactNode;
          }
          return String(option?.label || "") as unknown as React.ReactNode;
        }}
        overrides={{
          ControlContainer: {
            style: {
              backgroundColor: theme.colors.backgroundPrimary,
              borderTopWidth: "2px", borderBottomWidth: "2px", borderLeftWidth: "2px", borderRightWidth: "2px",
              borderTopColor: theme.colors.borderOpaque, borderBottomColor: theme.colors.borderOpaque,
              borderLeftColor: theme.colors.borderOpaque, borderRightColor: theme.colors.borderOpaque,
              borderRadius: theme.borders.radius400,
            },
          },
        }}
      />
    </Block>
  );
}
