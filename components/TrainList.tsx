"use client";

import { useStyletron } from "baseui";
import { Block } from "baseui/block";
import { LabelSmall, ParagraphSmall } from "baseui/typography";
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
  const [css, theme] = useStyletron();

  if (loading && arrivals.length === 0) {
    return (
      <Block display="flex" justifyContent="center" paddingTop="scale1200" paddingBottom="scale1200">
        <Spinner $size={40} />
      </Block>
    );
  }

  if (error) {
    return (
      <Block padding="scale600">
        <Notification kind={NOTIFICATION_KIND.negative} closeable={false}>
          {error}
        </Notification>
      </Block>
    );
  }

  if (arrivals.length === 0) {
    return (
      <Block padding="scale600">
        <Notification kind={NOTIFICATION_KIND.info} closeable={false}>
          {stationName
            ? `No upcoming trains at ${stationName}`
            : "Select a station to view arrivals"}
        </Notification>
      </Block>
    );
  }

  // Group by direction
  const groups: Record<string, ArrivalDisplay[]> = {};
  for (const a of arrivals) {
    if (!groups[a.direction]) groups[a.direction] = [];
    groups[a.direction].push(a);
  }

  const directionOrder =
    system === "subway" ? ["Uptown", "Downtown"] : ["To NY", "To NJ"];
  const sortedDirs = Object.keys(groups).sort(
    (a, b) => directionOrder.indexOf(a) - directionOrder.indexOf(b)
  );

  return (
    <Block paddingBottom="scale800">
      {lastUpdated && (
        <Block paddingTop="scale300" paddingBottom="scale300" paddingRight="scale600">
          <ParagraphSmall color={theme.colors.contentTertiary} overrides={{ Block: { style: { textAlign: "right" } } }}>
            Updated {formatTimeAgo(lastUpdated)}
          </ParagraphSmall>
        </Block>
      )}

      {sortedDirs.map((dir) => (
        <Block key={dir} marginBottom="scale300">
          <Block
            paddingTop="scale300"
            paddingBottom="scale300"
            paddingLeft="scale600"
            paddingRight="scale600"
            backgroundColor={theme.colors.backgroundSecondary}
          >
            <LabelSmall
              color={theme.colors.contentSecondary}
              overrides={{
                Block: {
                  style: {
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontWeight: 700,
                  },
                },
              }}
            >
              {dir}
            </LabelSmall>
          </Block>
          <Block
            display="flex"
            flexDirection="column"
            overrides={{
              Block: {
                style: {
                  gap: "1px",
                  backgroundColor: theme.colors.borderOpaque,
                },
              },
            }}
          >
            {groups[dir].slice(0, 8).map((arrival) => (
              <ArrivalCard key={arrival.id} arrival={arrival} />
            ))}
          </Block>
        </Block>
      ))}
    </Block>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.floor(seconds / 60)}m ago`;
}
