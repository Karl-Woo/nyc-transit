"use client";

import { useStyletron } from "baseui";
import { Block } from "baseui/block";
import { HeadingXSmall, LabelSmall, ParagraphSmall } from "baseui/typography";
import RouteTag from "./RouteTag";
import type { RouteOption } from "@/lib/types";

interface RouteOptionCardProps {
  option: RouteOption;
  isFastest: boolean;
}

export default function RouteOptionCard({ option, isFastest }: RouteOptionCardProps) {
  const [css, theme] = useStyletron();

  return (
    <Block
      backgroundColor={theme.colors.backgroundPrimary}
      padding="scale600"
      marginBottom="scale300"
      overrides={{
        Block: {
          style: {
            borderRadius: theme.borders.radius400,
            borderLeft: `4px solid ${isFastest ? theme.colors.contentPrimary : theme.colors.borderOpaque}`,
            boxShadow: isFastest ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
          },
        },
      }}
    >
      {/* Header */}
      <Block display="flex" alignItems="center" justifyContent="space-between" marginBottom="scale500">
        <Block display="flex" alignItems="center" overrides={{ Block: { style: { gap: theme.sizing.scale300 } } }}>
          <HeadingXSmall margin={0} color={theme.colors.contentPrimary}>
            ~{option.totalEstimatedMinutes} min
          </HeadingXSmall>
          {isFastest && (
            <LabelSmall
              color={theme.colors.contentOnColor}
              overrides={{
                Block: {
                  style: {
                    backgroundColor: theme.colors.contentPrimary,
                    paddingTop: "2px",
                    paddingBottom: "2px",
                    paddingLeft: theme.sizing.scale300,
                    paddingRight: theme.sizing.scale300,
                    borderRadius: theme.borders.radius200,
                    fontWeight: 700,
                    fontSize: "11px",
                  },
                },
              }}
            >
              FASTEST
            </LabelSmall>
          )}
        </Block>
        <Block display="flex" overrides={{ Block: { style: { gap: theme.sizing.scale100 } } }}>
          {option.legs.map((leg, i) => (
            <RouteTag key={i} route={leg.route} color={leg.routeColor} textColor={leg.routeTextColor} size="small" />
          ))}
        </Block>
      </Block>

      {/* Timeline */}
      <Block
        paddingLeft="scale500"
        overrides={{
          Block: {
            style: {
              borderLeft: `2px solid ${theme.colors.borderOpaque}`,
            },
          },
        }}
      >
        {option.walkToOriginMinutes > 0 && (
          <TimelineStep icon="subtle" text={`Walk ${option.walkToOriginMinutes} min`} subtle />
        )}

        {option.legs.map((leg, i) => (
          <div key={i}>
            <TimelineStep
              icon="primary"
              text={<>Board at <strong>{leg.boardStationName}</strong></>}
              route={leg.route}
              routeColor={leg.routeColor}
              routeTextColor={leg.routeTextColor}
            />
            <TimelineStep icon="subtle" text={`${leg.numStops} stops · ${leg.estimatedMinutes} min`} subtle />
            <TimelineStep icon="primary" text={<>Exit at <strong>{leg.alightStationName}</strong></>} />
            {i < option.legs.length - 1 && (
              <TimelineStep icon="subtle" text={`Transfer · ~${option.transferPenaltyMinutes} min`} subtle />
            )}
          </div>
        ))}

        {option.walkFromDestMinutes > 0 && (
          <TimelineStep icon="subtle" text={`Walk ${option.walkFromDestMinutes} min to destination`} subtle />
        )}
      </Block>
    </Block>
  );
}

function TimelineStep({
  icon,
  text,
  subtle,
  route,
  routeColor,
  routeTextColor,
}: {
  icon: string;
  text: React.ReactNode;
  subtle?: boolean;
  route?: string;
  routeColor?: string;
  routeTextColor?: string;
}) {
  const [css, theme] = useStyletron();

  return (
    <Block
      display="flex"
      alignItems="center"
      overrides={{
        Block: {
          style: {
            gap: theme.sizing.scale300,
            padding: `${theme.sizing.scale100} 0`,
            marginLeft: "-19px",
          },
        },
      }}
    >
      <Block
        overrides={{
          Block: {
            style: {
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: subtle ? theme.colors.contentTertiary : theme.colors.contentPrimary,
              flexShrink: 0,
            },
          },
        }}
      />
      {route && routeColor && (
        <RouteTag route={route} color={routeColor} textColor={routeTextColor} size="small" />
      )}
      <ParagraphSmall color={subtle ? theme.colors.contentSecondary : theme.colors.contentPrimary} margin={0}>
        {text}
      </ParagraphSmall>
    </Block>
  );
}
