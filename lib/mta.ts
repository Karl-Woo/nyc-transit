import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import { MTA_FEEDS, ROUTE_TO_FEED } from "./constants";
import type { SubwayArrival } from "./types";
import stationsData from "./data/stations.json";

const feedCache = new Map<string, { data: GtfsRealtimeBindings.transit_realtime.FeedMessage; timestamp: number }>();
const CACHE_TTL = 15_000; // 15 seconds

// Build a quick stopId -> station name lookup
const stationNameMap = new Map<string, string>();
for (const s of stationsData) {
  stationNameMap.set(s.stopId, s.name);
}

export async function fetchSubwayFeed(feedKey: string) {
  const feedInfo = MTA_FEEDS[feedKey];
  if (!feedInfo) throw new Error(`Unknown feed: ${feedKey}`);

  const cached = feedCache.get(feedKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const res = await fetch(feedInfo.url, {
    headers: { Accept: "application/x-protobuf" },
  });

  if (!res.ok) {
    throw new Error(`MTA feed ${feedKey} returned ${res.status}`);
  }

  const buffer = await res.arrayBuffer();
  const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
    new Uint8Array(buffer)
  );

  feedCache.set(feedKey, { data: feed, timestamp: Date.now() });
  return feed;
}

export function extractArrivalsForStation(
  feed: GtfsRealtimeBindings.transit_realtime.FeedMessage,
  stopId: string
): SubwayArrival[] {
  const now = Math.floor(Date.now() / 1000);
  const arrivals: SubwayArrival[] = [];

  for (const entity of feed.entity) {
    if (!entity.tripUpdate) continue;

    const routeId = entity.tripUpdate.trip?.routeId || "";
    const stopTimeUpdates = entity.tripUpdate.stopTimeUpdate || [];

    // Find the last stop in this trip to use as destination
    const lastStop = stopTimeUpdates.length > 0
      ? stopTimeUpdates[stopTimeUpdates.length - 1]
      : null;
    const lastStopId = lastStop?.stopId?.replace(/[NS]$/, "") || "";
    const terminalName = stationNameMap.get(lastStopId) || "";

    for (const stu of stopTimeUpdates) {
      const stuStopId = stu.stopId || "";

      // Match if the stop ID starts with our station ID (e.g., "101N" matches "101")
      if (!stuStopId.startsWith(stopId)) continue;

      const arrivalTime = Number(
        stu.arrival?.time || stu.departure?.time || 0
      );
      if (arrivalTime <= now) continue;

      const direction = stuStopId.endsWith("N") ? "N" : "S";

      arrivals.push({
        routeId,
        destination: terminalName,
        arrivalTime,
        direction: direction as "N" | "S",
      });
    }
  }

  return arrivals.sort((a, b) => a.arrivalTime - b.arrivalTime);
}

export function getFeedKeysForRoutes(routes: string[]): string[] {
  const feedKeys = new Set<string>();
  for (const route of routes) {
    const key = ROUTE_TO_FEED[route];
    if (key) feedKeys.add(key);
  }
  return Array.from(feedKeys);
}
