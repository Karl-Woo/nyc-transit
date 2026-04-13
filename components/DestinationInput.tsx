"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useStyletron } from "baseui";
import { Block } from "baseui/block";
import { Select, TYPE } from "baseui/select";
import { LabelSmall, LabelMedium } from "baseui/typography";
import type { GeoCoordinates, NearbyStation, SubwayStation } from "@/lib/types";
import { PATH_STATIONS } from "@/lib/constants";
import { findNearbyStations } from "@/lib/geo";
import RouteTag from "./RouteTag";

interface DestinationInputProps {
  onDestinationSet: (coords: GeoCoordinates, nearbyStations: NearbyStation[], displayName: string) => void;
}

let cachedSubwayStations: SubwayStation[] | null = null;

export default function DestinationInput({ onDestinationSet }: DestinationInputProps) {
  const [css, theme] = useStyletron();
  const [options, setOptions] = useState<Array<{ id: string; label: string; type: string; lat?: number; lon?: number; routes?: string[] }>>([]);
  const [value, setValue] = useState<Array<{ id: string; label: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [subwayStations, setSubwayStations] = useState<SubwayStation[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function load() {
      if (cachedSubwayStations) { setSubwayStations(cachedSubwayStations); return; }
      const res = await fetch("/api/subway/stations");
      const data = await res.json();
      cachedSubwayStations = data;
      setSubwayStations(data);
    }
    load();
  }, []);

  const handleInputChange = useCallback((inputValue: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (inputValue.length < 2) { setOptions([]); return; }

    const query = inputValue.toLowerCase();
    const stationResults: typeof options = [];

    for (const s of subwayStations) {
      if (s.name.toLowerCase().includes(query)) {
        stationResults.push({ id: `subway-${s.stopId}`, label: s.name, type: "station", lat: s.lat, lon: s.lon, routes: s.routes });
      }
      if (stationResults.length >= 8) break;
    }
    for (const s of PATH_STATIONS) {
      if (s.name.toLowerCase().includes(query)) {
        stationResults.push({ id: `path-${s.station}`, label: `${s.name} (PATH)`, type: "station", lat: s.lat, lon: s.lon });
      }
    }
    setOptions(stationResults);

    debounceRef.current = setTimeout(async () => {
      if (inputValue.length < 3) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(inputValue)}`);
        const data = await res.json();
        const addressResults = (data.results || []).map(
          (r: { displayName: string; lat: number; lon: number }, i: number) => ({
            id: `addr-${i}`, label: r.displayName.split(",").slice(0, 3).join(","), type: "address", lat: r.lat, lon: r.lon,
          })
        );
        setOptions((prev) => [...prev.filter((o) => o.type === "station"), ...addressResults]);
      } catch {} finally { setLoading(false); }
    }, 500);
  }, [subwayStations]);

  return (
    <Block paddingLeft="scale600" paddingRight="scale600">
      <LabelSmall
        color={theme.colors.contentSecondary}
        marginBottom="scale200"
        overrides={{ Block: { style: { textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700 } } }}
      >
        Where to?
      </LabelSmall>
      <Select
        options={options}
        value={value}
        placeholder="Station name or address..."
        type={TYPE.search}
        isLoading={loading}
        filterOptions={(options) => options}
        onInputChange={(e) => { const target = e.target as HTMLInputElement; handleInputChange(target.value); }}
        onChange={(params) => {
          const sel = params.value as Array<typeof options[0]>;
          setValue(sel);
          if (sel.length > 0 && sel[0].lat && sel[0].lon) {
            const coords = { lat: sel[0].lat, lon: sel[0].lon };
            const nearby = findNearbyStations(coords, subwayStations, PATH_STATIONS, 3);
            onDestinationSet(coords, nearby, sel[0].label);
          }
        }}
        getOptionLabel={({ option }) => {
          if (option?.type === "station" && option?.routes) {
            return (
              <Block display="flex" alignItems="center" overrides={{ Block: { style: { gap: theme.sizing.scale300 } } }}>
                <LabelMedium>{String(option.label)}</LabelMedium>
                <Block display="flex" overrides={{ Block: { style: { gap: theme.sizing.scale100, flexWrap: "wrap" } } }}>
                  {(option.routes as string[]).slice(0, 6).map((r: string) => (
                    <RouteTag key={r} route={r} size="small" />
                  ))}
                </Block>
              </Block>
            ) as unknown as React.ReactNode;
          }
          if (option?.type === "address") {
            return (
              <Block display="flex" alignItems="center" overrides={{ Block: { style: { gap: theme.sizing.scale300 } } }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={theme.colors.contentSecondary} stroke="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <LabelMedium>{String(option.label)}</LabelMedium>
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
              minHeight: "48px",
            },
          },
        }}
      />
    </Block>
  );
}
