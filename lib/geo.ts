import type { GeoCoordinates, NearbyStation, SubwayStation, PathStation } from "./types";

const R = 6371000; // Earth radius in meters

export function haversineDistance(a: GeoCoordinates, b: GeoCoordinates): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h = sinLat * sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLon * sinLon;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(meters: number): string {
  if (meters < 200) return `${Math.round(meters)} m`;
  const miles = meters / 1609.34;
  return `${miles.toFixed(1)} mi`;
}

export function estimateWalkMinutes(meters: number): number {
  return Math.max(1, Math.ceil(meters / 80));
}

export function findNearbyStations(
  location: GeoCoordinates,
  subwayStations: SubwayStation[],
  pathStations: PathStation[],
  limit = 5
): NearbyStation[] {
  const results: NearbyStation[] = [];

  for (const s of subwayStations) {
    const d = haversineDistance(location, { lat: s.lat, lon: s.lon });
    results.push({
      station: s,
      distanceMeters: d,
      distanceDisplay: formatDistance(d),
      walkMinutes: estimateWalkMinutes(d),
      system: "subway",
      stationId: s.stopId,
    });
  }

  for (const s of pathStations) {
    const d = haversineDistance(location, { lat: s.lat, lon: s.lon });
    results.push({
      station: s,
      distanceMeters: d,
      distanceDisplay: formatDistance(d),
      walkMinutes: estimateWalkMinutes(d),
      system: "path",
      stationId: s.station,
    });
  }

  results.sort((a, b) => a.distanceMeters - b.distanceMeters);
  return results.slice(0, limit);
}
