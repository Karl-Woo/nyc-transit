/**
 * Extract ordered stop sequences per route per direction from MTA GTFS static data.
 * Run: npx tsx scripts/extract-route-graph.ts
 */
import { writeFileSync, createReadStream } from "fs";
import { execSync } from "child_process";
import { join } from "path";
import { createInterface } from "readline";

const GTFS_URL = "http://web.mta.info/developers/data/nyct/subway/google_transit.zip";
const TMP_DIR = "/tmp/mta-gtfs-routes";
const OUTPUT = join(__dirname, "..", "lib", "data", "route-graph.json");

function parseCsvLine(line: string): string[] {
  return line.split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
}

async function readCsvLines(
  filePath: string,
  callback: (cols: string[], header: string[]) => void
) {
  const rl = createInterface({
    input: createReadStream(filePath),
    crlfDelay: Infinity,
  });
  let header: string[] = [];
  let first = true;
  for await (const line of rl) {
    if (first) {
      header = parseCsvLine(line);
      first = false;
      continue;
    }
    callback(parseCsvLine(line), header);
  }
}

async function main() {
  console.log("Downloading GTFS static feed...");
  execSync(`rm -rf ${TMP_DIR} && mkdir -p ${TMP_DIR}`);
  execSync(`curl -sL "${GTFS_URL}" -o ${TMP_DIR}/gtfs.zip`);
  execSync(`cd ${TMP_DIR} && unzip -o gtfs.zip`);

  // Parse stops.txt for child→parent mapping
  console.log("Parsing stops.txt...");
  const childToParent = new Map<string, string>();
  await readCsvLines(`${TMP_DIR}/stops.txt`, (cols, header) => {
    const stopId = cols[header.indexOf("stop_id")];
    const parent = cols[header.indexOf("parent_station")];
    if (parent) childToParent.set(stopId, parent);
  });

  // Parse trips.txt: trip_id → { route_id, direction_id }
  console.log("Parsing trips.txt...");
  const tripInfo = new Map<string, { routeId: string; directionId: string }>();
  await readCsvLines(`${TMP_DIR}/trips.txt`, (cols, header) => {
    tripInfo.set(cols[header.indexOf("trip_id")], {
      routeId: cols[header.indexOf("route_id")],
      directionId: cols[header.indexOf("direction_id")],
    });
  });

  // Parse stop_times.txt: collect stops per trip
  console.log("Parsing stop_times.txt...");
  const tripStops = new Map<string, { seq: number; stopId: string }[]>();
  await readCsvLines(`${TMP_DIR}/stop_times.txt`, (cols, header) => {
    const tripId = cols[header.indexOf("trip_id")];
    const seq = parseInt(cols[header.indexOf("stop_sequence")], 10);
    const stopId = cols[header.indexOf("stop_id")];
    if (!tripStops.has(tripId)) tripStops.set(tripId, []);
    tripStops.get(tripId)!.push({ seq, stopId });
  });

  // Build route graph: for each route+direction, pick the trip with most stops
  console.log("Building route graph...");
  const bestTrips = new Map<string, { seq: number; stopId: string }[]>();

  for (const [tripId, stops] of tripStops) {
    const info = tripInfo.get(tripId);
    if (!info) continue;

    const dir = info.directionId === "0" ? "S" : "N";
    const key = `${info.routeId}:${dir}`;

    const existing = bestTrips.get(key);
    if (!existing || stops.length > existing.length) {
      bestTrips.set(key, stops);
    }
  }

  // Convert to output format with parent station IDs
  const routeGraph: Record<string, { N: string[]; S: string[] }> = {};

  for (const [key, stops] of bestTrips) {
    const [routeId, dir] = key.split(":");
    if (!routeGraph[routeId]) routeGraph[routeId] = { N: [], S: [] };

    const sorted = stops.sort((a, b) => a.seq - b.seq);
    const parentIds = sorted.map((s) => {
      // Get parent station ID (strip N/S suffix or use child→parent map)
      let parentId = childToParent.get(s.stopId);
      if (!parentId) parentId = s.stopId.replace(/[NS]$/, "");
      return parentId;
    });

    // Deduplicate consecutive same stations
    const deduped: string[] = [];
    for (const id of parentIds) {
      if (deduped.length === 0 || deduped[deduped.length - 1] !== id) {
        deduped.push(id);
      }
    }

    routeGraph[routeId][dir as "N" | "S"] = deduped;
  }

  writeFileSync(OUTPUT, JSON.stringify(routeGraph, null, 2));
  console.log(`Wrote route graph for ${Object.keys(routeGraph).length} routes to ${OUTPUT}`);

  execSync(`rm -rf ${TMP_DIR}`);
}

main().catch(console.error);
