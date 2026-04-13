import type { PathTrain } from "./types";

const PATH_API_BASE = "https://path.api.razza.dev/v1";

export async function fetchPathStations() {
  const res = await fetch(`${PATH_API_BASE}/stations`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`PATH stations API returned ${res.status}`);
  return res.json();
}

export async function fetchPathRealtime(
  stationSlug: string
): Promise<PathTrain[]> {
  const res = await fetch(
    `${PATH_API_BASE}/stations/${stationSlug}/realtime`
  );
  if (!res.ok) throw new Error(`PATH realtime API returned ${res.status}`);
  const data = await res.json();
  return data.upcomingTrains || [];
}
