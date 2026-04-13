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
  small: { wh: "22px", fs: "12px" },
  default: { wh: "28px", fs: "14px" },
  large: { wh: "36px", fs: "18px" },
};

export default function RouteTag({ route, color, textColor, size = "default" }: RouteTagProps) {
  const [css, theme] = useStyletron();
  const colors = ROUTE_COLORS[route] || { bg: color || theme.colors.contentTertiary, text: textColor || theme.colors.contentOnColor };
  const bg = color || colors.bg;
  const fg = textColor || colors.text;
  const s = SIZES[size];

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
      {route.replace("X", "")}
    </span>
  );
}
