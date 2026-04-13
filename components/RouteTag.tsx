"use client";

import { useStyletron } from "baseui";
import { ROUTE_COLORS } from "@/lib/constants";

interface RouteTagProps {
  route: string;
  color?: string;
  textColor?: string;
  size?: "small" | "default" | "large";
}

const SIZES = {
  small: { wh: "22px", fs: "11px" },
  default: { wh: "28px", fs: "14px" },
  large: { wh: "36px", fs: "18px" },
};

// Short labels for PATH routes in circular badges
const PATH_SHORT_LABELS: Record<string, string> = {
  "NWK-WTC": "NW",
  "HOB-WTC": "HW",
  "JSQ-33": "J3",
  "HOB-33": "H3",
  "JSQ-33 via HOB": "J3",
};

export default function RouteTag({ route, color, textColor, size = "default" }: RouteTagProps) {
  const [css, theme] = useStyletron();
  const colors = ROUTE_COLORS[route] || { bg: color || theme.colors.contentTertiary, text: textColor || theme.colors.contentOnColor };
  const bg = color || colors.bg;
  const fg = textColor || colors.text;
  const s = SIZES[size];

  // For PATH routes (longer names), use pill shape
  const isLongName = route.length > 2;
  const displayLabel = isLongName ? (PATH_SHORT_LABELS[route] || route.substring(0, 3)) : route.replace("X", "");

  if (isLongName) {
    return (
      <span
        className={css({
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          height: s.wh,
          paddingLeft: theme.sizing.scale300,
          paddingRight: theme.sizing.scale300,
          borderRadius: theme.borders.radius400,
          backgroundColor: bg,
          color: fg,
          ...theme.typography.font150,
          fontSize: size === "small" ? "10px" : "12px",
          fontWeight: 700,
          lineHeight: 1,
          flexShrink: 0,
          whiteSpace: "nowrap",
        })}
      >
        {route}
      </span>
    );
  }

  return (
    <span
      className={css({
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: s.wh,
        height: s.wh,
        borderRadius: "50%",
        backgroundColor: bg,
        color: fg,
        ...theme.typography.font150,
        fontSize: s.fs,
        fontWeight: 700,
        lineHeight: 1,
        flexShrink: 0,
      })}
    >
      {displayLabel}
    </span>
  );
}
