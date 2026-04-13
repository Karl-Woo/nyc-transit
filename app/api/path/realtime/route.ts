import { NextRequest, NextResponse } from "next/server";
import { fetchPathRealtime } from "@/lib/path";
import { PATH_ROUTE_COLORS } from "@/lib/constants";
import type { ArrivalDisplay } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const station = searchParams.get("station");

  if (!station) {
    return NextResponse.json(
      { error: "station parameter required" },
      { status: 400 }
    );
  }

  try {
    const trains = await fetchPathRealtime(station);
    const now = Math.floor(Date.now() / 1000);

    const arrivals: ArrivalDisplay[] = trains.map((t, i) => {
      const arrivalTime = Math.floor(
        new Date(t.projectedArrival).getTime() / 1000
      );
      const colors = PATH_ROUTE_COLORS[t.route] || {
        bg: t.lineColors?.[0] ? `#${t.lineColors[0]}` : "#0039A6",
        text: "#FFFFFF",
      };

      return {
        id: `path-${t.route}-${arrivalTime}-${i}`,
        route: t.routeDisplayName || t.route,
        routeColor: colors.bg,
        routeTextColor: colors.text,
        destination: t.headsign || t.lineName,
        arrivalTime,
        minutesAway: Math.max(0, Math.round((arrivalTime - now) / 60)),
        status: t.status === "ON_TIME" ? "On Time" : t.status,
        direction: t.direction === "TO_NY" ? "To NY" : "To NJ",
        system: "path" as const,
      };
    });

    arrivals.sort((a, b) => a.arrivalTime - b.arrivalTime);

    return NextResponse.json(
      { arrivals },
      { headers: { "Cache-Control": "public, s-maxage=15" } }
    );
  } catch (error) {
    console.error("Error fetching PATH realtime:", error);
    return NextResponse.json(
      { error: "Failed to fetch PATH data" },
      { status: 500 }
    );
  }
}
