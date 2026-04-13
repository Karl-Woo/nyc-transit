import { NextRequest, NextResponse } from "next/server";
import stationsData from "@/lib/data/stations.json";
import { fetchSubwayFeed, extractArrivalsForStation, getFeedKeysForRoutes } from "@/lib/mta";
import { ROUTE_COLORS } from "@/lib/constants";
import type { ArrivalDisplay } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const stationId = searchParams.get("station");

  if (!stationId) {
    return NextResponse.json({ error: "station parameter required" }, { status: 400 });
  }

  const station = stationsData.find((s) => s.stopId === stationId);
  if (!station) {
    return NextResponse.json({ error: "Station not found" }, { status: 404 });
  }

  try {
    const feedKeys = getFeedKeysForRoutes(station.routes);
    const feeds = await Promise.all(feedKeys.map((key) => fetchSubwayFeed(key)));

    const allArrivals = feeds.flatMap((feed) =>
      extractArrivalsForStation(feed, stationId)
    );

    const now = Math.floor(Date.now() / 1000);
    const display: ArrivalDisplay[] = allArrivals
      .filter((a) => a.arrivalTime > now)
      .sort((a, b) => a.arrivalTime - b.arrivalTime)
      .slice(0, 20)
      .map((a, i) => {
        const colors = ROUTE_COLORS[a.routeId] || { bg: "#808080", text: "#FFFFFF" };
        return {
          id: `${a.routeId}-${a.arrivalTime}-${i}`,
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

    return NextResponse.json(
      { station: station.name, arrivals: display },
      { headers: { "Cache-Control": "public, s-maxage=15" } }
    );
  } catch (error) {
    console.error("Error fetching subway arrivals:", error);
    return NextResponse.json(
      { error: "Failed to fetch arrivals" },
      { status: 500 }
    );
  }
}
