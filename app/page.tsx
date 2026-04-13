"use client";

import { useState, useCallback } from "react";
import { useStyletron } from "baseui";
import { Block } from "baseui/block";
import { Tabs, Tab, FILL } from "baseui/tabs-motion";
import StationSearch from "@/components/StationSearch";
import SubwayRouteFilter from "@/components/SubwayRouteFilter";
import TrainList from "@/components/TrainList";
import LocationInput from "@/components/LocationInput";
import DestinationInput from "@/components/DestinationInput";
import NearbyArrivals from "@/components/NearbyArrivals";
import TripResults from "@/components/TripResults";
import { useArrivals } from "@/lib/hooks/useArrivals";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { useNearbyStations } from "@/lib/hooks/useNearbyStations";
import { useRoutePlanner } from "@/lib/hooks/useRoutePlanner";
import { findNearbyStations } from "@/lib/geo";
import { PATH_STATIONS } from "@/lib/constants";
import type { GeoCoordinates, NearbyStation, SubwayStation } from "@/lib/types";

const tabStyle = ({ $isActive }: { $isActive: boolean }) => ({
  fontWeight: $isActive ? 600 : 400,
  color: $isActive ? "#000000" : "#666666",
  fontSize: "14px",
});

let cachedSubwayStations: SubwayStation[] | null = null;

async function loadSubwayStations(): Promise<SubwayStation[]> {
  if (!cachedSubwayStations) {
    const res = await fetch("/api/subway/stations");
    cachedSubwayStations = await res.json();
  }
  return cachedSubwayStations!;
}

export default function Home() {
  const [css] = useStyletron();
  const [activeTab, setActiveTab] = useState<string>("0");

  // Geolocation (shared across tabs)
  const geo = useGeolocation();

  // Near Me state
  const [nearMeLocation, setNearMeLocation] = useState<GeoCoordinates | null>(null);
  const [nearMeDisplayName, setNearMeDisplayName] = useState<string>("");
  const nearbyStations = useNearbyStations(nearMeLocation, 5);

  // Trip state
  const [tripOrigin, setTripOrigin] = useState<{ location: GeoCoordinates; nearbyStations: NearbyStation[]; source: "gps" | "address"; displayName: string } | null>(null);
  const [tripDestination, setTripDestination] = useState<{ location: GeoCoordinates; nearbyStations: NearbyStation[]; displayName: string } | null>(null);
  const routePlanner = useRoutePlanner(tripOrigin, tripDestination);

  // Stations tab state (existing)
  const [subwayStation, setSubwayStation] = useState<string | null>(null);
  const [subwayStationName, setSubwayStationName] = useState("");
  const [routeFilter, setRouteFilter] = useState<string | null>(null);
  const [pathStation, setPathStation] = useState<string | null>(null);
  const [pathStationName, setPathStationName] = useState("");
  const [stationsSubTab, setStationsSubTab] = useState<string>("0");

  const subway = useArrivals("subway", subwayStation);
  const path = useArrivals("path", pathStation);

  // --- Handlers ---

  const handleNearMeLocation = useCallback(
    (coords: GeoCoordinates, displayName: string) => {
      setNearMeLocation(coords);
      setNearMeDisplayName(displayName);
    },
    []
  );

  const handleTripOriginSet = useCallback(
    async (coords: GeoCoordinates, displayName: string, source: "gps" | "address") => {
      const stations = await loadSubwayStations();
      const nearby = findNearbyStations(coords, stations, PATH_STATIONS, 3);
      setTripOrigin({ location: coords, nearbyStations: nearby, source, displayName });
    },
    []
  );

  const handleTripDestinationSet = useCallback(
    (coords: GeoCoordinates, nearbyStations: NearbyStation[], displayName: string) => {
      setTripDestination({ location: coords, nearbyStations, displayName });
    },
    []
  );

  return (
    <Block
      minHeight="100vh"
      maxWidth="600px"
      marginLeft="auto"
      marginRight="auto"
      backgroundColor="#F6F6F6"
    >
      {/* Header */}
      <Block
        backgroundColor="#000000"
        paddingTop="scale600"
        paddingBottom="scale500"
        paddingLeft={["scale600", "scale800"]}
        paddingRight={["scale600", "scale800"]}
        position="sticky"
        top="0px"
        overrides={{ Block: { style: { zIndex: 10 } } }}
      >
        <Block font="font550" color="white" overrides={{ Block: { style: { fontSize: "20px", fontWeight: 700, letterSpacing: "-0.3px" } } }}>
          NYC Transit
        </Block>
        <Block font="font100" marginTop="scale0" overrides={{ Block: { style: { fontSize: "13px", color: "#999999" } } }}>
          Real-time subway & PATH schedules
        </Block>
      </Block>

      {/* Main Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={({ activeKey }) => setActiveTab(String(activeKey))}
        fill={FILL.fixed}
        overrides={{
          TabList: {
            style: {
              backgroundColor: "#FFFFFF",
              borderBottomWidth: "1px",
              borderBottomStyle: "solid",
              borderBottomColor: "#E2E2E2",
            },
          },
          TabHighlight: { style: { backgroundColor: "#000000" } },
        }}
      >
        {/* Tab 0: Near Me */}
        <Tab title="Near Me" overrides={{ Tab: { style: tabStyle } }}>
          <Block paddingTop="scale500">
            <LocationInput
              onLocationSet={handleNearMeLocation}
              geoLocation={geo.location}
              geoLoading={geo.loading}
              geoError={geo.error}
              onRequestGeo={geo.requestLocation}
              label="Your location"
              value={nearMeDisplayName || undefined}
            />
          </Block>
          <Block paddingTop="scale600">
            <NearbyArrivals
              stations={nearbyStations.stations}
              loading={nearbyStations.loading}
            />
          </Block>
        </Tab>

        {/* Tab 1: Trip */}
        <Tab title="Trip" overrides={{ Tab: { style: tabStyle } }}>
          <Block paddingTop="scale500">
            <LocationInput
              onLocationSet={handleTripOriginSet}
              geoLocation={geo.location}
              geoLoading={geo.loading}
              geoError={geo.error}
              onRequestGeo={geo.requestLocation}
              label="From"
              value={tripOrigin?.displayName || undefined}
            />
          </Block>
          <Block paddingTop="scale500">
            <DestinationInput onDestinationSet={handleTripDestinationSet} />
          </Block>
          <Block paddingTop="scale600">
            <TripResults
              routes={routePlanner.routes}
              loading={routePlanner.loading}
              error={routePlanner.error}
              hasOrigin={!!tripOrigin}
              hasDestination={!!tripDestination}
            />
          </Block>
        </Tab>

        {/* Tab 2: Stations (existing functionality) */}
        <Tab title="Stations" overrides={{ Tab: { style: tabStyle } }}>
          <Tabs
            activeKey={stationsSubTab}
            onChange={({ activeKey }) => setStationsSubTab(String(activeKey))}
            fill={FILL.fixed}
            overrides={{
              TabList: {
                style: {
                  backgroundColor: "#FFFFFF",
                  borderBottomWidth: "1px",
                  borderBottomStyle: "solid",
                  borderBottomColor: "#E2E2E2",
                },
              },
              TabHighlight: { style: { backgroundColor: "#000000" } },
            }}
          >
            <Tab title="NYC Subway" overrides={{ Tab: { style: tabStyle } }}>
              <SubwayRouteFilter
                selectedRoute={routeFilter}
                onRouteSelect={setRouteFilter}
              />
              <StationSearch
                system="subway"
                routeFilter={routeFilter}
                onStationSelect={(id, name) => {
                  setSubwayStation(id);
                  setSubwayStationName(name);
                }}
              />
              <Block paddingTop="scale600">
                <TrainList
                  arrivals={subway.arrivals}
                  loading={subway.loading}
                  error={subway.error}
                  stationName={subwayStationName}
                  system="subway"
                  lastUpdated={subway.lastUpdated}
                />
              </Block>
            </Tab>

            <Tab title="PATH" overrides={{ Tab: { style: tabStyle } }}>
              <Block paddingTop="scale500">
                <StationSearch
                  system="path"
                  onStationSelect={(id, name) => {
                    setPathStation(id);
                    setPathStationName(name);
                  }}
                />
              </Block>
              <Block paddingTop="scale600">
                <TrainList
                  arrivals={path.arrivals}
                  loading={path.loading}
                  error={path.error}
                  stationName={pathStationName}
                  system="path"
                  lastUpdated={path.lastUpdated}
                />
              </Block>
            </Tab>
          </Tabs>
        </Tab>
      </Tabs>
    </Block>
  );
}
