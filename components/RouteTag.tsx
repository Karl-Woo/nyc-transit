"use client";

import { useStyletron } from "baseui";
import { ROUTE_COLORS } from "@/lib/constants";

interface RouteTagProps {
  route: string;
  color?: string;
  textColor?: string;
  size?: "small" | "default" | "large";
}

export default function RouteTag({
  route,
  color,
  textColor,
  size = "default",
}: RouteTagProps) {
  const [css] = useStyletron();
  const colors = ROUTE_COLORS[route] || { bg: color || "#808080", text: textColor || "#FFFFFF" };
  const bg = color || colors.bg;
  const fg = textColor || colors.text;

  const sizeMap = {
    small: { width: "22px", height: "22px", fontSize: "12px" },
    default: { width: "28px", height: "28px", fontSize: "14px" },
    large: { width: "36px", height: "36px", fontSize: "18px" },
  };

  const s = sizeMap[size];

  return (
    <span
      className={css({
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: s.width,
        height: s.height,
        borderRadius: "50%",
        backgroundColor: bg,
        color: fg,
        fontSize: s.fontSize,
        fontWeight: 700,
        lineHeight: 1,
        flexShrink: 0,
      })}
    >
      {route.replace("X", "")}
    </span>
  );
}
