"use client";

import { useStyletron } from "baseui";
import RouteTag from "./RouteTag";
import type { RouteOption } from "@/lib/types";

interface RouteOptionCardProps {
  option: RouteOption;
  isFastest: boolean;
}

export default function RouteOptionCard({ option, isFastest }: RouteOptionCardProps) {
  const [css] = useStyletron();

  return (
    <div
      className={css({
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "8px",
        borderLeft: isFastest ? "4px solid #000000" : "4px solid #E2E2E2",
        boxShadow: isFastest ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
      })}
    >
      {/* Header */}
      <div className={css({ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" })}>
        <div className={css({ display: "flex", alignItems: "center", gap: "8px" })}>
          <span className={css({ fontSize: "20px", fontWeight: 700, color: "#000000" })}>
            ~{option.totalEstimatedMinutes} min
          </span>
          {isFastest && (
            <span
              className={css({
                fontSize: "11px",
                fontWeight: 700,
                color: "#FFFFFF",
                backgroundColor: "#000000",
                padding: "2px 8px",
                borderRadius: "4px",
                textTransform: "uppercase",
              })}
            >
              Fastest
            </span>
          )}
        </div>
        <div className={css({ display: "flex", gap: "4px" })}>
          {option.legs.map((leg, i) => (
            <RouteTag key={i} route={leg.route} color={leg.routeColor} textColor={leg.routeTextColor} size="small" />
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className={css({ paddingLeft: "12px", borderLeft: "2px solid #E2E2E2" })}>
        {/* Walk to station */}
        {option.walkToOriginMinutes > 0 && (
          <TimelineStep
            icon="walk"
            text={`Walk ${option.walkToOriginMinutes} min`}
            subtle
          />
        )}

        {option.legs.map((leg, i) => (
          <div key={i}>
            {/* Board */}
            <TimelineStep
              icon="board"
              text={
                <span>
                  Board at <strong>{leg.boardStationName}</strong>
                </span>
              }
              route={leg.route}
              routeColor={leg.routeColor}
              routeTextColor={leg.routeTextColor}
            />

            {/* Ride */}
            <TimelineStep
              icon="ride"
              text={`${leg.numStops} stops · ${leg.estimatedMinutes} min`}
              subtle
            />

            {/* Alight */}
            <TimelineStep
              icon="alight"
              text={
                <span>
                  Exit at <strong>{leg.alightStationName}</strong>
                </span>
              }
            />

            {/* Transfer (if not last leg) */}
            {i < option.legs.length - 1 && (
              <TimelineStep
                icon="transfer"
                text={`Transfer · ~${option.transferPenaltyMinutes} min`}
                subtle
              />
            )}
          </div>
        ))}

        {/* Walk to destination */}
        {option.walkFromDestMinutes > 0 && (
          <TimelineStep
            icon="walk"
            text={`Walk ${option.walkFromDestMinutes} min to destination`}
            subtle
          />
        )}
      </div>
    </div>
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
  const [css] = useStyletron();

  return (
    <div
      className={css({
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "4px 0",
        marginLeft: "-19px", // Align dots with border
      })}
    >
      {/* Dot */}
      <div
        className={css({
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: subtle ? "#CCCCCC" : "#000000",
          flexShrink: 0,
        })}
      />

      {route && routeColor && (
        <RouteTag route={route} color={routeColor} textColor={routeTextColor} size="small" />
      )}

      <span
        className={css({
          fontSize: "13px",
          color: subtle ? "#666666" : "#000000",
          lineHeight: "1.4",
        })}
      >
        {text}
      </span>
    </div>
  );
}
