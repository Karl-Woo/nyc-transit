"use client";

import { useStyletron } from "baseui";
import { Block } from "baseui/block";
import { Button, KIND, SIZE, SHAPE } from "baseui/button";
import { ROUTE_COLORS } from "@/lib/constants";

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

export default function SubwayRouteFilter({ selectedRoute, onRouteSelect }: SubwayRouteFilterProps) {
  const [css, theme] = useStyletron();

  return (
    <Block
      paddingTop="scale500"
      paddingBottom="scale500"
      paddingLeft="scale600"
      paddingRight="scale600"
      overrides={{
        Block: {
          style: {
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            "::-webkit-scrollbar": { display: "none" },
          },
        },
      }}
    >
      <Block display="flex" alignItems="center" overrides={{ Block: { style: { gap: theme.sizing.scale200 } } }}>
        {/* All button */}
        <Button
          kind={KIND.secondary}
          size={SIZE.compact}
          onClick={() => onRouteSelect(null)}
          overrides={{
            BaseButton: {
              style: {
                flexShrink: 0,
                borderRadius: theme.borders.radius400,
                backgroundColor: !selectedRoute ? theme.colors.contentPrimary : theme.colors.backgroundTertiary,
                color: !selectedRoute ? theme.colors.contentOnColor : theme.colors.contentSecondary,
                paddingLeft: theme.sizing.scale550,
                paddingRight: theme.sizing.scale550,
                ":hover": {
                  backgroundColor: !selectedRoute ? theme.colors.contentPrimary : theme.colors.backgroundTertiary,
                  opacity: 0.85,
                },
              },
            },
          }}
        >
          All
        </Button>

        {ROUTE_GROUPS.map((group, gi) => (
          <Block key={gi} display="flex" overrides={{ Block: { style: { gap: theme.sizing.scale100 } } }}>
            {group.map((route) => {
              const colors = ROUTE_COLORS[route];
              const isSelected = selectedRoute === route;
              return (
                <Button
                  key={route}
                  kind={KIND.secondary}
                  size={SIZE.mini}
                  shape={SHAPE.circle}
                  onClick={() => onRouteSelect(isSelected ? null : route)}
                  overrides={{
                    BaseButton: {
                      style: {
                        width: "32px",
                        height: "32px",
                        backgroundColor: colors.bg,
                        color: colors.text,
                        fontSize: "14px",
                        fontWeight: 700,
                        borderTopWidth: isSelected ? "2px" : "2px",
                        borderBottomWidth: isSelected ? "2px" : "2px",
                        borderLeftWidth: isSelected ? "2px" : "2px",
                        borderRightWidth: isSelected ? "2px" : "2px",
                        borderTopStyle: "solid",
                        borderBottomStyle: "solid",
                        borderLeftStyle: "solid",
                        borderRightStyle: "solid",
                        borderTopColor: isSelected ? theme.colors.contentPrimary : "transparent",
                        borderBottomColor: isSelected ? theme.colors.contentPrimary : "transparent",
                        borderLeftColor: isSelected ? theme.colors.contentPrimary : "transparent",
                        borderRightColor: isSelected ? theme.colors.contentPrimary : "transparent",
                        boxShadow: isSelected
                          ? `0 0 0 2px ${theme.colors.backgroundPrimary}, 0 0 0 4px ${theme.colors.contentPrimary}`
                          : "none",
                        ":hover": {
                          backgroundColor: colors.bg,
                          transform: "scale(1.1)",
                        },
                      },
                    },
                  }}
                >
                  {route}
                </Button>
              );
            })}
          </Block>
        ))}
      </Block>
    </Block>
  );
}
