import GtfsRealtimeBindings from "gtfs-realtime-bindings";

const PATH_GTFSRT_URL = "https://path.transitdata.nyc/gtfsrt";

// GTFS stop_id → station slug mapping (from Port Authority GTFS static data)
const GTFS_STOP_TO_SLUG: Record<string, string> = {
  "26722": "fourteenth_street",
  "26723": "twenty_third_street",
  "26724": "thirty_third_street",
  "26725": "ninth_street",
  "26726": "christopher_street",
  "26727": "exchange_place",
  "26728": "grove_street",
  "26729": "harrison",
  "26730": "hoboken",
  "26731": "journal_square",
  "26732": "newport",
  "26733": "newark",
  "26734": "world_trade_center",
};

const SLUG_TO_GTFS_STOP: Record<string, string> = {};
for (const [gtfsId, slug] of Object.entries(GTFS_STOP_TO_SLUG)) {
  SLUG_TO_GTFS_STOP[slug] = gtfsId;
}

// GTFS route_id → route code mapping
const GTFS_ROUTE_TO_CODE: Record<string, string> = {
  "859": "HOB_33",
  "860": "HOB_WTC",
  "861": "JSQ_33",
  "862": "NWK_WTC",
  "1024": "JSQ_33_HOB",
};

const ROUTE_DISPLAY_NAMES: Record<string, string> = {
  HOB_33: "HOB-33",
  HOB_WTC: "HOB-WTC",
  JSQ_33: "JSQ-33",
  NWK_WTC: "NWK-WTC",
  JSQ_33_HOB: "JSQ-33 via HOB",
};

// Terminal stations for headsign
const ROUTE_TERMINALS: Record<string, Record<number, string>> = {
  NWK_WTC: { 0: "World Trade Center", 1: "Newark" },
  HOB_WTC: { 0: "World Trade Center", 1: "Hoboken" },
  JSQ_33: { 0: "33rd Street", 1: "Journal Square" },
  HOB_33: { 0: "33rd Street", 1: "Hoboken" },
  JSQ_33_HOB: { 0: "33rd Street", 1: "Journal Square" },
};

// Station name lookup
const STATION_NAMES: Record<string, string> = {
  fourteenth_street: "14th Street",
  twenty_third_street: "23rd Street",
  thirty_third_street: "33rd Street",
  ninth_street: "9th Street",
  christopher_street: "Christopher Street",
  exchange_place: "Exchange Place",
  grove_street: "Grove Street",
  harrison: "Harrison",
  hoboken: "Hoboken",
  journal_square: "Journal Square",
  newport: "Newport",
  newark: "Newark",
  world_trade_center: "World Trade Center",
};

// NJ-side stations for direction inference
const NJ_STATIONS = new Set(["newark", "harrison", "journal_square", "grove_street", "exchange_place", "newport", "hoboken"]);

export interface PathArrival {
  route: string;
  routeDisplayName: string;
  headsign: string;
  arrivalTime: number; // unix seconds
  direction: string; // "TO_NY" or "TO_NJ"
  stationSlug: string;
}

let feedCache: { data: GtfsRealtimeBindings.transit_realtime.FeedMessage; timestamp: number } | null = null;
const CACHE_TTL = 15_000;

async function fetchPathFeed() {
  if (feedCache && Date.now() - feedCache.timestamp < CACHE_TTL) {
    return feedCache.data;
  }

  const res = await fetch(PATH_GTFSRT_URL, {
    headers: { Accept: "application/x-protobuf" },
  });
  if (!res.ok) throw new Error(`PATH GTFS-RT returned ${res.status}`);

  const buffer = await res.arrayBuffer();
  const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
    new Uint8Array(buffer)
  );

  feedCache = { data: feed, timestamp: Date.now() };
  return feed;
}

export async function fetchPathArrivals(stationSlug: string): Promise<PathArrival[]> {
  const gtfsStopId = SLUG_TO_GTFS_STOP[stationSlug];
  if (!gtfsStopId) throw new Error(`Unknown PATH station: ${stationSlug}`);

  const feed = await fetchPathFeed();
  const now = Math.floor(Date.now() / 1000);
  const arrivals: PathArrival[] = [];

  for (const entity of feed.entity) {
    if (!entity.tripUpdate) continue;

    const routeId = entity.tripUpdate.trip?.routeId || "";
    const directionId = entity.tripUpdate.trip?.directionId ?? 0;
    const routeCode = GTFS_ROUTE_TO_CODE[routeId] || routeId;

    for (const stu of entity.tripUpdate.stopTimeUpdate || []) {
      if (stu.stopId !== gtfsStopId) continue;

      const arrivalTime = Number(stu.arrival?.time || stu.departure?.time || 0);
      if (arrivalTime <= now) continue;

      // Determine terminal/headsign from route + direction
      const terminals = ROUTE_TERMINALS[routeCode];
      const headsign = terminals ? (terminals[directionId] || routeCode) : routeCode;

      // Determine direction based on terminal
      const terminalSlug = Object.entries(STATION_NAMES).find(([, name]) => name === headsign)?.[0];
      const direction = terminalSlug && NJ_STATIONS.has(terminalSlug) ? "TO_NJ" : "TO_NY";

      arrivals.push({
        route: routeCode,
        routeDisplayName: ROUTE_DISPLAY_NAMES[routeCode] || routeCode,
        headsign,
        arrivalTime,
        direction,
        stationSlug,
      });
    }
  }

  return arrivals.sort((a, b) => a.arrivalTime - b.arrivalTime);
}
