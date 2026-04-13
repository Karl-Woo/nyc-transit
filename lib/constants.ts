import type { PathStation } from "./types";

export const MTA_FEED_BASE = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2F";

export const MTA_FEEDS: Record<string, { url: string; routes: string[] }> = {
  gtfs: {
    url: `${MTA_FEED_BASE}gtfs`,
    routes: ["1", "2", "3", "4", "5", "6", "6X", "7", "7X", "S"],
  },
  "gtfs-ace": {
    url: `${MTA_FEED_BASE}gtfs-ace`,
    routes: ["A", "C", "E"],
  },
  "gtfs-bdfm": {
    url: `${MTA_FEED_BASE}gtfs-bdfm`,
    routes: ["B", "D", "F", "M"],
  },
  "gtfs-g": {
    url: `${MTA_FEED_BASE}gtfs-g`,
    routes: ["G"],
  },
  "gtfs-jz": {
    url: `${MTA_FEED_BASE}gtfs-jz`,
    routes: ["J", "Z"],
  },
  "gtfs-nqrw": {
    url: `${MTA_FEED_BASE}gtfs-nqrw`,
    routes: ["N", "Q", "R", "W"],
  },
  "gtfs-l": {
    url: `${MTA_FEED_BASE}gtfs-l`,
    routes: ["L"],
  },
  "gtfs-si": {
    url: `${MTA_FEED_BASE}gtfs-si`,
    routes: ["SI"],
  },
};

// Reverse map: route -> feed key
export const ROUTE_TO_FEED: Record<string, string> = {};
for (const [feedKey, feed] of Object.entries(MTA_FEEDS)) {
  for (const route of feed.routes) {
    ROUTE_TO_FEED[route] = feedKey;
  }
}

export const ROUTE_COLORS: Record<string, { bg: string; text: string }> = {
  "1": { bg: "#EE352E", text: "#FFFFFF" },
  "2": { bg: "#EE352E", text: "#FFFFFF" },
  "3": { bg: "#EE352E", text: "#FFFFFF" },
  "4": { bg: "#00933C", text: "#FFFFFF" },
  "5": { bg: "#00933C", text: "#FFFFFF" },
  "6": { bg: "#00933C", text: "#FFFFFF" },
  "6X": { bg: "#00933C", text: "#FFFFFF" },
  "7": { bg: "#B933AD", text: "#FFFFFF" },
  "7X": { bg: "#B933AD", text: "#FFFFFF" },
  A: { bg: "#0039A6", text: "#FFFFFF" },
  C: { bg: "#0039A6", text: "#FFFFFF" },
  E: { bg: "#0039A6", text: "#FFFFFF" },
  B: { bg: "#FF6319", text: "#FFFFFF" },
  D: { bg: "#FF6319", text: "#FFFFFF" },
  F: { bg: "#FF6319", text: "#FFFFFF" },
  M: { bg: "#FF6319", text: "#FFFFFF" },
  G: { bg: "#6CBE45", text: "#FFFFFF" },
  J: { bg: "#996633", text: "#FFFFFF" },
  Z: { bg: "#996633", text: "#FFFFFF" },
  L: { bg: "#A7A9AC", text: "#FFFFFF" },
  N: { bg: "#FCCC0A", text: "#000000" },
  Q: { bg: "#FCCC0A", text: "#000000" },
  R: { bg: "#FCCC0A", text: "#000000" },
  W: { bg: "#FCCC0A", text: "#000000" },
  S: { bg: "#808183", text: "#FFFFFF" },
  SI: { bg: "#0039A6", text: "#FFFFFF" },
};

export const PATH_STATIONS: PathStation[] = [
  { station: "newark", name: "Newark", lat: 40.73454, lon: -74.16387 },
  { station: "harrison", name: "Harrison", lat: 40.73942, lon: -74.15587 },
  { station: "journal_square", name: "Journal Square", lat: 40.73301, lon: -74.06289 },
  { station: "grove_street", name: "Grove Street", lat: 40.71966, lon: -74.04324 },
  { station: "exchange_place", name: "Exchange Place", lat: 40.71676, lon: -74.03237 },
  { station: "world_trade_center", name: "World Trade Center", lat: 40.71271, lon: -74.01193 },
  { station: "newport", name: "Newport", lat: 40.72699, lon: -74.03383 },
  { station: "hoboken", name: "Hoboken", lat: 40.73587, lon: -74.02886 },
  { station: "christopher_street", name: "Christopher Street", lat: 40.73294, lon: -74.00707 },
  { station: "ninth_street", name: "9th Street", lat: 40.73424, lon: -73.99895 },
  { station: "fourteenth_street", name: "14th Street", lat: 40.73725, lon: -73.99688 },
  { station: "twenty_third_street", name: "23rd Street", lat: 40.74291, lon: -73.99277 },
  { station: "thirty_third_street", name: "33rd Street", lat: 40.74893, lon: -73.98848 },
];

export const PATH_ROUTE_COLORS: Record<string, { bg: string; text: string }> = {
  NWK_WTC: { bg: "#D93A30", text: "#FFFFFF" },
  HOB_WTC: { bg: "#4D92FB", text: "#FFFFFF" },
  JSQ_33: { bg: "#FF9900", text: "#FFFFFF" },
  HOB_33: { bg: "#65C100", text: "#FFFFFF" },
  JSQ_33_HOB: { bg: "#FF9900", text: "#FFFFFF" },
};

export const PATH_ROUTE_GRAPH: Record<string, string[]> = {
  NWK_WTC: ["newark", "harrison", "journal_square", "grove_street", "exchange_place", "world_trade_center"],
  HOB_WTC: ["hoboken", "newport", "exchange_place", "world_trade_center"],
  JSQ_33: ["journal_square", "grove_street", "newport", "christopher_street", "ninth_street", "fourteenth_street", "twenty_third_street", "thirty_third_street"],
  HOB_33: ["hoboken", "christopher_street", "ninth_street", "fourteenth_street", "twenty_third_street", "thirty_third_street"],
};

// Cross-system transfer points: subway station ↔ PATH station with walk time
export const CROSS_SYSTEM_TRANSFERS: { subwayStopId: string; subwayName: string; pathStation: string; pathName: string; walkMinutes: number }[] = [
  { subwayStopId: "R27", subwayName: "Cortlandt St", pathStation: "world_trade_center", pathName: "World Trade Center", walkMinutes: 3 },
  { subwayStopId: "A36", subwayName: "Chambers St", pathStation: "world_trade_center", pathName: "World Trade Center", walkMinutes: 5 },
  { subwayStopId: "635", subwayName: "Christopher St-Sheridan Sq", pathStation: "christopher_street", pathName: "Christopher Street", walkMinutes: 2 },
  { subwayStopId: "632", subwayName: "14 St", pathStation: "fourteenth_street", pathName: "14th Street", walkMinutes: 3 },
  { subwayStopId: "L03", subwayName: "6 Av", pathStation: "fourteenth_street", pathName: "14th Street", walkMinutes: 4 },
  { subwayStopId: "R20", subwayName: "23 St", pathStation: "twenty_third_street", pathName: "23rd Street", walkMinutes: 3 },
  { subwayStopId: "128", subwayName: "23 St", pathStation: "twenty_third_street", pathName: "23rd Street", walkMinutes: 4 },
  { subwayStopId: "R17", subwayName: "33 St", pathStation: "thirty_third_street", pathName: "33rd Street", walkMinutes: 3 },
  { subwayStopId: "A28", subwayName: "34 St-Penn Station", pathStation: "thirty_third_street", pathName: "33rd Street", walkMinutes: 5 },
];

export const ALL_SUBWAY_ROUTES = [
  "1", "2", "3", "4", "5", "6",
  "7", "A", "C", "E", "B", "D",
  "F", "M", "G", "J", "Z", "L",
  "N", "Q", "R", "W", "S",
];
