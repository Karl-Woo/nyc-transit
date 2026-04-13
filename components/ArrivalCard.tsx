"use client";

import { useStyletron } from "baseui";
import { Block } from "baseui/block";
import { LabelMedium, LabelSmall } from "baseui/typography";
import RouteTag from "./RouteTag";
import type { ArrivalDisplay } from "@/lib/types";

interface ArrivalCardProps {
  arrival: ArrivalDisplay;
}

export default function ArrivalCard({ arrival }: ArrivalCardProps) {
  const [css, theme] = useStyletron();

  const minutesDisplay =
    arrival.minutesAway <= 0
      ? "NOW"
      : arrival.minutesAway === 1
        ? "1 min"
        : `${arrival.minutesAway} min`;

  return (
    <Block
      display="flex"
      alignItems="center"
      paddingTop="scale500"
      paddingBottom="scale500"
      paddingLeft="scale600"
      paddingRight="scale600"
      backgroundColor={theme.colors.backgroundPrimary}
      overrides={{
        Block: {
          style: {
            borderLeft: `4px solid ${arrival.routeColor}`,
            gap: theme.sizing.scale500,
          },
        },
      }}
    >
      <RouteTag
        route={arrival.route}
        color={arrival.routeColor}
        textColor={arrival.routeTextColor}
      />

      <Block flex="1" minWidth="0">
        <LabelMedium
          color={theme.colors.contentPrimary}
          overrides={{
            Block: {
              style: {
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              },
            },
          }}
        >
          {arrival.destination}
        </LabelMedium>
        {arrival.status !== "On Time" && (
          <LabelSmall color={theme.colors.contentNegative} marginTop="scale0">
            {arrival.status}
          </LabelSmall>
        )}
      </Block>

      <Block
        className={css({
          fontSize: arrival.minutesAway <= 1 ? theme.typography.HeadingXSmall.fontSize : theme.typography.HeadingXSmall.fontSize,
          fontWeight: 700,
          color: arrival.minutesAway <= 1 ? theme.colors.contentNegative : theme.colors.contentPrimary,
          whiteSpace: "nowrap",
          minWidth: "50px",
          textAlign: "right",
        })}
      >
        {minutesDisplay}
      </Block>
    </Block>
  );
}
