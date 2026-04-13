"use client";

import { useStyletron } from "baseui";
import RouteTag from "./RouteTag";
import type { ArrivalDisplay } from "@/lib/types";

interface ArrivalCardProps {
  arrival: ArrivalDisplay;
}

export default function ArrivalCard({ arrival }: ArrivalCardProps) {
  const [css] = useStyletron();

  const minutesDisplay =
    arrival.minutesAway <= 0
      ? "NOW"
      : arrival.minutesAway === 1
        ? "1 min"
        : `${arrival.minutesAway} min`;

  return (
    <div
      className={css({
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        backgroundColor: "#FFFFFF",
        borderLeft: `4px solid ${arrival.routeColor}`,
        gap: "12px",
      })}
    >
      <RouteTag
        route={arrival.route}
        color={arrival.routeColor}
        textColor={arrival.routeTextColor}
      />

      <div className={css({ flex: 1, minWidth: 0 })}>
        <div
          className={css({
            fontSize: "15px",
            fontWeight: 600,
            color: "#000000",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          })}
        >
          {arrival.destination}
        </div>
        {arrival.status !== "On Time" && (
          <div
            className={css({
              fontSize: "12px",
              color: "#E11900",
              marginTop: "2px",
            })}
          >
            {arrival.status}
          </div>
        )}
      </div>

      <div
        className={css({
          fontSize: arrival.minutesAway <= 1 ? "16px" : "18px",
          fontWeight: 700,
          color: arrival.minutesAway <= 1 ? "#E11900" : "#000000",
          whiteSpace: "nowrap",
          minWidth: "50px",
          textAlign: "right",
        })}
      >
        {minutesDisplay}
      </div>
    </div>
  );
}
