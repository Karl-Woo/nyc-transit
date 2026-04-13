import { NextResponse } from "next/server";
import { PATH_STATIONS } from "@/lib/constants";

export async function GET() {
  return NextResponse.json(PATH_STATIONS, {
    headers: { "Cache-Control": "public, s-maxage=3600" },
  });
}
