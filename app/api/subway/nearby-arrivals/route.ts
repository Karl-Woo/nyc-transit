import { NextRequest, NextResponse } from "next/server";
import stationsData from "@/lib/data/stations.json";
import { fetchSubwayFeed, extractArrivalsForStation, getFeedKeysForRoutes } from "@/lib/mta";
import { ROUTE_COLORS } from "@/lib/constants";
import type { ArrivalDisplay } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const stationIds = searchParams.get("stations")?.split(",").filter(Boolean);

  if (!stationIds || stationIds.length === 0) {
    return NextResponse.json({ error: "stations parameter required" }, { status: 400 });
  }

  try {
    // Find all stations and their routes
    const stations = stationIds
      .map((id) => stationsData.find((s) => s.stopId === id))
      .filter(Boolean) as typeof stationsData;

    // Collect all unique feed keys needed
    const allRoutes = new Set<string>();
    for (const s of stations) {
      for (const r of s.routes) allRoutes.add(r);
    }

    const feedKeys = getFeedKeysForRoutes(Array.from(allRoutes));
    const feeds = await Promise.all(feedKeys.map((key) => fetchSubwayFeed(key)));

    const now = Math.floor(Date.now() / 1000);
    const result: Record<string, { stationName: string; arrivals: ArrivalDisplay[] }> = {};

    for (const station of stations) {
      const allArrivals = feeds.flatMap((feed) =>
        extractArrivalsForStation(feed, station.stopId)
      );

      const display: ArrivalDisplay[] = allArrivals
        .filter((a) => a.arrivalTime > now)
        .sort((a, b) => a.arrivalTime - b.arrivalTime)
        .slice(0, 8)
        .map((a, i) => {
          const colors = ROUTE_COLORS[a.routeId] || { bg: "#808080", text: "#FFFFFF" };
          return {
            id: `${station.stopId}-${a.routeId}-${a.arrivalTime}-${i}`,
            route: a.routeId,
            routeColor: colors.bg,
            routeTextColor: colors.text,
            destination: a.destination || (a.direction === "N" ? "Uptown" : "Downtown"),
            arrivalTime: a.arrivalTime,
            minutesAway: Math.max(0, Math.round((a.arrivalTime - now) / 60)),
            status: "On Time",
            direction: a.direction === "N" ? "Uptown" : "Downtown",
            system: "subway" as const,
          };
        });

      result[station.stopId] = { stationName: station.name, arrivals: display };
    }

    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=15" },
    });
  } catch (error) {
    console.error("Error fetching nearby arrivals:", error);
    return NextResponse.json({ error: "Failed to fetch arrivals" }, { status: 500 });
  }
}
