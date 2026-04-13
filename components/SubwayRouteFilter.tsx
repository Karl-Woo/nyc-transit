"use client";

import { useStyletron } from "baseui";
import { ALL_SUBWAY_ROUTES, ROUTE_COLORS } from "@/lib/constants";

interface SubwayRouteFilterProps {
  selectedRoute: string | null;
  onRouteSelect: (route: string | null) => void;
}

const ROUTE_GROUPS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7"],
  ["A", "C", "E"],
  ["B", "D", "F", "M"],
  ["G"],
  ["J", "Z"],
  ["L"],
  ["N", "Q", "R", "W"],
  ["S"],
];

export default function SubwayRouteFilter({
  selectedRoute,
  onRouteSelect,
}: SubwayRouteFilterProps) {
  const [css] = useStyletron();

  return (
    <div
      className={css({
        padding: "12px 16px",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        "::-webkit-scrollbar": { display: "none" },
      })}
    >
      <div
        className={css({
          display: "flex",
          gap: "6px",
          alignItems: "center",
        })}
      >
        {/* All button */}
        <button
          onClick={() => onRouteSelect(null)}
          className={css({
            border: "none",
            borderRadius: "14px",
            padding: "6px 14px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
            backgroundColor: !selectedRoute ? "#000000" : "#E2E2E2",
            color: !selectedRoute ? "#FFFFFF" : "#545454",
            transition: "all 0.15s ease",
            ":hover": {
              opacity: 0.85,
            },
          })}
        >
          All
        </button>

        {ROUTE_GROUPS.map((group, gi) => (
          <div key={gi} className={css({ display: "flex", gap: "3px" })}>
            {group.map((route) => {
              const colors = ROUTE_COLORS[route];
              const isSelected = selectedRoute === route;
              return (
                <button
                  key={route}
                  onClick={() =>
                    onRouteSelect(isSelected ? null : route)
                  }
                  className={css({
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    border: isSelected
                      ? "2px solid #000000"
                      : "2px solid transparent",
                    backgroundColor: colors.bg,
                    color: colors.text,
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    transition: "all 0.15s ease",
                    outline: "none",
                    boxShadow: isSelected
                      ? "0 0 0 2px #FFFFFF, 0 0 0 4px #000000"
                      : "none",
                    ":hover": {
                      transform: "scale(1.1)",
                    },
                  })}
                >
                  {route}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
