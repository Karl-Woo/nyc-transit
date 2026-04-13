"use client";

import { useStyletron } from "baseui";
import { Block } from "baseui/block";
import { Spinner } from "baseui/spinner";
import { Notification, KIND as NOTIFICATION_KIND } from "baseui/notification";
import RouteOptionCard from "./RouteOptionCard";
import type { RouteOption } from "@/lib/types";

interface TripResultsProps {
  routes: RouteOption[];
  loading: boolean;
  error: string | null;
  hasOrigin: boolean;
  hasDestination: boolean;
}

export default function TripResults({
  routes,
  loading,
  error,
  hasOrigin,
  hasDestination,
}: TripResultsProps) {
  const [css] = useStyletron();

  if (!hasOrigin || !hasDestination) {
    return (
      <Block padding="scale600">
        <Notification kind={NOTIFICATION_KIND.info} closeable={false}>
          {!hasOrigin
            ? "Set your starting location to plan a trip"
            : "Enter a destination to find routes"}
        </Notification>
      </Block>
    );
  }

  if (loading) {
    return (
      <Block display="flex" justifyContent="center" padding="scale1200 scale600">
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

  if (routes.length === 0) {
    return (
      <Block padding="scale600">
        <Notification kind={NOTIFICATION_KIND.info} closeable={false}>
          No routes found between these locations. Try a different destination.
        </Notification>
      </Block>
    );
  }

  return (
    <Block paddingTop="scale500" paddingLeft="scale600" paddingRight="scale600" paddingBottom="scale600">
      <Block
        font="font100"
        color="contentSecondary"
        marginBottom="scale300"
        overrides={{
          Block: {
            style: {
              fontSize: "13px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            },
          },
        }}
      >
        {routes.length} route{routes.length !== 1 ? "s" : ""} found
      </Block>
      {routes.map((route, i) => (
        <RouteOptionCard key={route.id} option={route} isFastest={i === 0} />
      ))}
    </Block>
  );
}
