"use client";

import { useStyletron } from "baseui";
import { Spinner } from "baseui/spinner";
import { Notification, KIND as NOTIFICATION_KIND } from "baseui/notification";
import ArrivalCard from "./ArrivalCard";
import type { ArrivalDisplay } from "@/lib/types";

interface TrainListProps {
  arrivals: ArrivalDisplay[];
  loading: boolean;
  error: string | null;
  stationName?: string;
  system: "subway" | "path";
  lastUpdated?: Date | null;
}

export default function TrainList({
  arrivals,
  loading,
  error,
  stationName,
  system,
  lastUpdated,
}: TrainListProps) {
  const [css] = useStyletron();

  if (loading && arrivals.length === 0) {
    return (
      <div
        className={css({
          display: "flex",
          justifyContent: "center",
          padding: "48px 16px",
        })}
      >
        <Spinner $size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={css({ padding: "16px" })}>
        <Notification kind={NOTIFICATION_KIND.negative} closeable={false}>
          {error}
        </Notification>
      </div>
    );
  }

  if (arrivals.length === 0) {
    return (
      <div className={css({ padding: "16px" })}>
        <Notification kind={NOTIFICATION_KIND.info} closeable={false}>
          {stationName
            ? `No upcoming trains at ${stationName}`
            : "Select a station to view arrivals"}
        </Notification>
      </div>
    );
  }

  // Group by direction
  const groups: Record<string, ArrivalDisplay[]> = {};
  for (const a of arrivals) {
    if (!groups[a.direction]) groups[a.direction] = [];
    groups[a.direction].push(a);
  }

  // Sort direction keys
  const directionOrder =
    system === "subway"
      ? ["Uptown", "Downtown"]
      : ["To NY", "To NJ"];

  const sortedDirs = Object.keys(groups).sort(
    (a, b) => directionOrder.indexOf(a) - directionOrder.indexOf(b)
  );

  return (
    <div className={css({ paddingBottom: "24px" })}>
      {lastUpdated && (
        <div
          className={css({
            padding: "8px 16px",
            fontSize: "12px",
            color: "#666666",
            textAlign: "right",
          })}
        >
          Updated {formatTimeAgo(lastUpdated)}
        </div>
      )}

      {sortedDirs.map((dir) => (
        <div key={dir} className={css({ marginBottom: "8px" })}>
          <div
            className={css({
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: 700,
              color: "#545454",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              backgroundColor: "#EEEEEE",
            })}
          >
            {dir}
          </div>
          <div
            className={css({
              display: "flex",
              flexDirection: "column",
              gap: "1px",
              backgroundColor: "#E2E2E2",
            })}
          >
            {groups[dir].slice(0, 8).map((arrival) => (
              <ArrivalCard key={arrival.id} arrival={arrival} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.floor(seconds / 60)}m ago`;
}
