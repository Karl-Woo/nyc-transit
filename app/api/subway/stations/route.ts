import { NextRequest, NextResponse } from "next/server";
import stationsData from "@/lib/data/stations.json";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const routeFilter = searchParams.get("route");

  let stations = stationsData;

  if (routeFilter) {
    stations = stations.filter((s) => s.routes.includes(routeFilter));
  }

  return NextResponse.json(stations, {
    headers: { "Cache-Control": "public, s-maxage=3600" },
  });
}
