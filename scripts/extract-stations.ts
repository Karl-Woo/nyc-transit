/**
 * One-time script to extract station data from MTA GTFS static feed.
 * Run: npx tsx scripts/extract-stations.ts
 */
import { writeFileSync, readFileSync, createReadStream } from "fs";
import { execSync } from "child_process";
import { join } from "path";
import { createInterface } from "readline";

const GTFS_URL = "http://web.mta.info/developers/data/nyct/subway/google_transit.zip";
const TMP_DIR = "/tmp/mta-gtfs";
const OUTPUT = join(__dirname, "..", "lib", "data", "stations.json");

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

  // Parse stops.txt
  console.log("Parsing stops.txt...");
  const parentStations = new Map<
    string,
    { name: string; lat: number; lon: number }
  >();
  const childToParent = new Map<string, string>();

  await readCsvLines(`${TMP_DIR}/stops.txt`, (cols, header) => {
    const stopId = cols[header.indexOf("stop_id")];
    const locType = cols[header.indexOf("location_type")];
    const parent = cols[header.indexOf("parent_station")];

    if (locType === "1") {
      parentStations.set(stopId, {
        name: cols[header.indexOf("stop_name")],
        lat: parseFloat(cols[header.indexOf("stop_lat")]),
        lon: parseFloat(cols[header.indexOf("stop_lon")]),
      });
    }
    if (parent) {
      childToParent.set(stopId, parent);
    }
  });

  console.log(`Found ${parentStations.size} parent stations`);

  // Parse trips.txt
  console.log("Parsing trips.txt...");
  const tripToRoute = new Map<string, string>();

  await readCsvLines(`${TMP_DIR}/trips.txt`, (cols, header) => {
    tripToRoute.set(
      cols[header.indexOf("trip_id")],
      cols[header.indexOf("route_id")]
    );
  });

  console.log(`Found ${tripToRoute.size} trips`);

  // Parse stop_times.txt
  console.log("Parsing stop_times.txt (this may take a moment)...");
  const stationRoutes = new Map<string, Set<string>>();

  await readCsvLines(`${TMP_DIR}/stop_times.txt`, (cols, header) => {
    const tripId = cols[header.indexOf("trip_id")];
    const stopId = cols[header.indexOf("stop_id")];
    const routeId = tripToRoute.get(tripId);
    if (!routeId) return;

    let parentId = childToParent.get(stopId);
    if (!parentId) {
      const base = stopId.replace(/[NS]$/, "");
      if (parentStations.has(base)) parentId = base;
      else parentId = stopId;
    }

    if (!stationRoutes.has(parentId)) {
      stationRoutes.set(parentId, new Set());
    }
    stationRoutes.get(parentId)!.add(routeId);
  });

  // Build final output
  const stations = [];
  for (const [stopId, info] of parentStations) {
    const routes = stationRoutes.get(stopId);
    if (!routes || routes.size === 0) continue;

    stations.push({
      stopId,
      name: info.name,
      routes: Array.from(routes).sort(),
      lat: info.lat,
      lon: info.lon,
    });
  }

  stations.sort((a, b) => a.name.localeCompare(b.name));

  writeFileSync(OUTPUT, JSON.stringify(stations, null, 2));
  console.log(`Wrote ${stations.length} stations to ${OUTPUT}`);

  execSync(`rm -rf ${TMP_DIR}`);
}

main().catch(console.error);
