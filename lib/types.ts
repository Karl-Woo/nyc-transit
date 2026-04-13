export interface SubwayStation {
  stopId: string;
  name: string;
  routes: string[];
  lat: number;
  lon: number;
}

export interface SubwayArrival {
  routeId: string;
  destination: string;
  arrivalTime: number; // unix timestamp in seconds
  direction: "N" | "S";
}

export interface PathStation {
  station: string;
  name: string;
  lat: number;
  lon: number;
}

export interface PathTrain {
  lineName: string;
  lineColors: string[];
  projectedArrival: string;
  lastUpdated: string;
  status: string;
  headsign: string;
  route: string;
  routeDisplayName: string;
  direction: string;
}

export interface ArrivalDisplay {
  id: string;
  route: string;
  routeColor: string;
  routeTextColor: string;
  destination: string;
  arrivalTime: number; // unix timestamp in seconds
  minutesAway: number;
  status: string;
  direction: string;
  system: "subway" | "path";
}

// --- Trip Planner types ---

export interface GeoCoordinates {
  lat: number;
  lon: number;
}

export interface NearbyStation {
  station: SubwayStation | PathStation;
  distanceMeters: number;
  distanceDisplay: string;
  walkMinutes: number;
  system: "subway" | "path";
  stationId: string; // stopId for subway, station slug for PATH
}

export interface TripOrigin {
  location: GeoCoordinates;
  nearbyStations: NearbyStation[];
  source: "gps" | "address";
  displayName: string;
}

export interface TripDestination {
  location: GeoCoordinates;
  nearbyStations: NearbyStation[];
  displayName: string;
}

export interface RouteLeg {
  route: string;
  routeColor: string;
  routeTextColor: string;
  system: "subway" | "path";
  boardStationName: string;
  boardStationId: string;
  alightStationName: string;
  alightStationId: string;
  numStops: number;
  estimatedMinutes: number;
  direction: string;
}

export interface RouteOption {
  id: string;
  legs: RouteLeg[];
  transfers: number;
  totalStops: number;
  walkToOriginMinutes: number;
  walkFromDestMinutes: number;
  rideMinutes: number;
  transferPenaltyMinutes: number;
  totalEstimatedMinutes: number;
}

export type RouteGraph = Record<string, { N: string[]; S: string[] }>;
