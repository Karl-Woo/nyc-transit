import type { RouteGraph, RouteOption, RouteLeg, NearbyStation, SubwayStation } from "./types";
import { ROUTE_COLORS, PATH_ROUTE_GRAPH, PATH_ROUTE_COLORS, CROSS_SYSTEM_TRANSFERS, PATH_STATIONS } from "./constants";

interface StationLookup {
  subway: Map<string, SubwayStation>;
  pathNames: Map<string, string>; // station slug -> display name
}

function buildLookup(subwayStations: SubwayStation[]): StationLookup {
  const subway = new Map<string, SubwayStation>();
  for (const s of subwayStations) subway.set(s.stopId, s);

  const pathNames = new Map<string, string>();
  for (const s of PATH_STATIONS) pathNames.set(s.station, s.name);

  return { subway, pathNames };
}

function getRouteColors(route: string, system: "subway" | "path") {
  if (system === "subway") return ROUTE_COLORS[route] || { bg: "#808080", text: "#FFFFFF" };
  return PATH_ROUTE_COLORS[route] || { bg: "#0039A6", text: "#FFFFFF" };
}

function findStopIndex(stops: string[], stopId: string): number {
  return stops.indexOf(stopId);
}

/** Find direct subway routes between two stations */
function findDirectSubwayRoutes(
  originStopId: string,
  destStopId: string,
  routeGraph: RouteGraph,
  lookup: StationLookup
): RouteLeg[] {
  const legs: RouteLeg[] = [];

  for (const [route, dirs] of Object.entries(routeGraph)) {
    for (const [dir, stops] of Object.entries(dirs) as [string, string[]][]) {
      const oi = findStopIndex(stops, originStopId);
      const di = findStopIndex(stops, destStopId);
      if (oi === -1 || di === -1) continue;
      if (oi >= di) continue; // wrong direction

      const numStops = di - oi;
      const colors = getRouteColors(route, "subway");
      const originStation = lookup.subway.get(originStopId);
      const destStation = lookup.subway.get(destStopId);

      legs.push({
        route,
        routeColor: colors.bg,
        routeTextColor: colors.text,
        system: "subway",
        boardStationName: originStation?.name || originStopId,
        boardStationId: originStopId,
        alightStationName: destStation?.name || destStopId,
        alightStationId: destStopId,
        numStops,
        estimatedMinutes: numStops * 2,
        direction: dir === "N" ? "Uptown" : "Downtown",
      });
    }
  }

  return legs;
}

/** Find direct PATH routes between two stations */
function findDirectPathRoutes(
  originSlug: string,
  destSlug: string,
  lookup: StationLookup
): RouteLeg[] {
  const legs: RouteLeg[] = [];

  for (const [route, stops] of Object.entries(PATH_ROUTE_GRAPH)) {
    const oi = stops.indexOf(originSlug);
    const di = stops.indexOf(destSlug);
    if (oi === -1 || di === -1) continue;

    const forward = oi < di;
    const numStops = Math.abs(di - oi);
    const colors = getRouteColors(route, "path");

    legs.push({
      route,
      routeColor: colors.bg,
      routeTextColor: colors.text,
      system: "path",
      boardStationName: lookup.pathNames.get(originSlug) || originSlug,
      boardStationId: originSlug,
      alightStationName: lookup.pathNames.get(destSlug) || destSlug,
      alightStationId: destSlug,
      numStops,
      estimatedMinutes: numStops * 2,
      direction: forward ? "Outbound" : "Inbound",
    });
  }

  return legs;
}

/** Find one-transfer subway routes */
function findOneTransferSubwayRoutes(
  originStopId: string,
  destStopId: string,
  routeGraph: RouteGraph,
  lookup: StationLookup
): RouteLeg[][] {
  const results: RouteLeg[][] = [];

  // Get routes that serve origin and dest
  const originRoutes = new Set<string>();
  const destRoutes = new Set<string>();

  for (const [route, dirs] of Object.entries(routeGraph)) {
    for (const stops of Object.values(dirs)) {
      if ((stops as string[]).includes(originStopId)) originRoutes.add(route);
      if ((stops as string[]).includes(destStopId)) destRoutes.add(route);
    }
  }

  // For each origin route, find stations where it intersects with a dest route
  for (const oRoute of originRoutes) {
    for (const dRoute of destRoutes) {
      if (oRoute === dRoute) continue;

      // Find common stations (transfer points)
      for (const [oDir, oStops] of Object.entries(routeGraph[oRoute] || {})) {
        const oi = (oStops as string[]).indexOf(originStopId);
        if (oi === -1) continue;

        for (const [dDir, dStops] of Object.entries(routeGraph[dRoute] || {})) {
          const di = (dStops as string[]).indexOf(destStopId);
          if (di === -1) continue;

          // Find common transfer stations
          const oStopsSet = new Set(oStops as string[]);
          for (let ti = 0; ti < (dStops as string[]).length; ti++) {
            const transferId = (dStops as string[])[ti];
            if (!oStopsSet.has(transferId)) continue;

            const oTransferIdx = (oStops as string[]).indexOf(transferId);
            if (oTransferIdx <= oi) continue; // Must be after origin on first leg
            if (ti >= di) continue; // Must be before dest on second leg

            const leg1Stops = oTransferIdx - oi;
            const leg2Stops = di - ti;
            const oColors = getRouteColors(oRoute, "subway");
            const dColors = getRouteColors(dRoute, "subway");
            const transferStation = lookup.subway.get(transferId);
            const originStation = lookup.subway.get(originStopId);
            const destStation = lookup.subway.get(destStopId);

            results.push([
              {
                route: oRoute,
                routeColor: oColors.bg,
                routeTextColor: oColors.text,
                system: "subway",
                boardStationName: originStation?.name || originStopId,
                boardStationId: originStopId,
                alightStationName: transferStation?.name || transferId,
                alightStationId: transferId,
                numStops: leg1Stops,
                estimatedMinutes: leg1Stops * 2,
                direction: oDir === "N" ? "Uptown" : "Downtown",
              },
              {
                route: dRoute,
                routeColor: dColors.bg,
                routeTextColor: dColors.text,
                system: "subway",
                boardStationName: transferStation?.name || transferId,
                boardStationId: transferId,
                alightStationName: destStation?.name || destStopId,
                alightStationId: destStopId,
                numStops: leg2Stops,
                estimatedMinutes: leg2Stops * 2,
                direction: dDir === "N" ? "Uptown" : "Downtown",
              },
            ]);
          }
        }
      }
    }
  }

  return results;
}

/** Find cross-system routes (subway ↔ PATH) */
function findCrossSystemRoutes(
  originStation: NearbyStation,
  destStation: NearbyStation,
  routeGraph: RouteGraph,
  lookup: StationLookup
): RouteLeg[][] {
  const results: RouteLeg[][] = [];

  if (originStation.system === "subway" && destStation.system === "path") {
    // Subway → walk → PATH
    for (const transfer of CROSS_SYSTEM_TRANSFERS) {
      // Find subway leg: origin → transfer subway station
      const subwayLegs = findDirectSubwayRoutes(originStation.stationId, transfer.subwayStopId, routeGraph, lookup);
      // Find PATH leg: transfer PATH station → dest
      const pathLegs = findDirectPathRoutes(transfer.pathStation, destStation.stationId, lookup);

      for (const sLeg of subwayLegs) {
        for (const pLeg of pathLegs) {
          results.push([sLeg, pLeg]);
        }
      }
    }
  } else if (originStation.system === "path" && destStation.system === "subway") {
    // PATH → walk → Subway
    for (const transfer of CROSS_SYSTEM_TRANSFERS) {
      const pathLegs = findDirectPathRoutes(originStation.stationId, transfer.pathStation, lookup);
      const subwayLegs = findDirectSubwayRoutes(transfer.subwayStopId, destStation.stationId, routeGraph, lookup);

      for (const pLeg of pathLegs) {
        for (const sLeg of subwayLegs) {
          results.push([pLeg, sLeg]);
        }
      }
    }
  }

  return results;
}

export function findRouteOptions(
  originStations: NearbyStation[],
  destStations: NearbyStation[],
  routeGraph: RouteGraph,
  subwayStations: SubwayStation[]
): RouteOption[] {
  const lookup = buildLookup(subwayStations);
  const options: RouteOption[] = [];
  const seen = new Set<string>();
  let idCounter = 0;

  for (const origin of originStations.slice(0, 3)) {
    for (const dest of destStations.slice(0, 3)) {
      // Same system direct routes
      if (origin.system === "subway" && dest.system === "subway") {
        const directLegs = findDirectSubwayRoutes(origin.stationId, dest.stationId, routeGraph, lookup);
        for (const leg of directLegs) {
          const key = `direct-${leg.route}-${leg.boardStationId}-${leg.alightStationId}`;
          if (seen.has(key)) continue;
          seen.add(key);

          options.push(buildOption(`route-${idCounter++}`, [leg], 0, origin.walkMinutes, dest.walkMinutes));
        }

        // One-transfer subway routes
        const transferRoutes = findOneTransferSubwayRoutes(origin.stationId, dest.stationId, routeGraph, lookup);
        for (const legs of transferRoutes) {
          const key = `transfer-${legs.map((l) => `${l.route}-${l.boardStationId}`).join("-")}`;
          if (seen.has(key)) continue;
          seen.add(key);

          options.push(buildOption(`route-${idCounter++}`, legs, 1, origin.walkMinutes, dest.walkMinutes));
        }
      }

      if (origin.system === "path" && dest.system === "path") {
        const directLegs = findDirectPathRoutes(origin.stationId, dest.stationId, lookup);
        for (const leg of directLegs) {
          const key = `path-direct-${leg.route}-${origin.stationId}-${dest.stationId}`;
          if (seen.has(key)) continue;
          seen.add(key);

          options.push(buildOption(`route-${idCounter++}`, [leg], 0, origin.walkMinutes, dest.walkMinutes));
        }
      }

      // Cross-system routes
      if (origin.system !== dest.system) {
        const crossRoutes = findCrossSystemRoutes(origin, dest, routeGraph, lookup);
        for (const legs of crossRoutes) {
          const key = `cross-${legs.map((l) => `${l.route}-${l.boardStationId}`).join("-")}`;
          if (seen.has(key)) continue;
          seen.add(key);

          // Cross-system transfer has a walk penalty already in CROSS_SYSTEM_TRANSFERS
          const transfer = CROSS_SYSTEM_TRANSFERS.find((t) => {
            if (origin.system === "subway") {
              return t.subwayStopId === legs[0].alightStationId && t.pathStation === legs[1].boardStationId;
            }
            return t.pathStation === legs[0].alightStationId && t.subwayStopId === legs[1].boardStationId;
          });
          const crossWalk = transfer?.walkMinutes || 5;

          options.push(buildOption(`route-${idCounter++}`, legs, 1, origin.walkMinutes, dest.walkMinutes, crossWalk));
        }
      }
    }
  }

  options.sort((a, b) => a.totalEstimatedMinutes - b.totalEstimatedMinutes);
  return options.slice(0, 5);
}

function buildOption(
  id: string,
  legs: RouteLeg[],
  transfers: number,
  walkToMinutes: number,
  walkFromMinutes: number,
  transferPenalty?: number
): RouteOption {
  const totalStops = legs.reduce((sum, l) => sum + l.numStops, 0);
  const rideMinutes = legs.reduce((sum, l) => sum + l.estimatedMinutes, 0);
  const transferPenaltyMinutes = transferPenalty ?? transfers * 5;

  return {
    id,
    legs,
    transfers,
    totalStops,
    walkToOriginMinutes: walkToMinutes,
    walkFromDestMinutes: walkFromMinutes,
    rideMinutes,
    transferPenaltyMinutes,
    totalEstimatedMinutes: walkToMinutes + rideMinutes + transferPenaltyMinutes + walkFromMinutes,
  };
}
