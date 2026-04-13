import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "5");
    url.searchParams.set("countrycodes", "us");
    // Bounding box for NYC metro area
    url.searchParams.set("viewbox", "-74.3,40.9,-73.7,40.5");
    url.searchParams.set("bounded", "1");

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "NYCTransitApp/1.0",
      },
    });

    if (!res.ok) throw new Error(`Nominatim returned ${res.status}`);

    const data = await res.json();
    const results = data.map((item: { display_name: string; lat: string; lon: string }) => ({
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    }));

    return NextResponse.json(
      { results },
      { headers: { "Cache-Control": "public, s-maxage=3600" } }
    );
  } catch (error) {
    console.error("Geocoding error:", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
