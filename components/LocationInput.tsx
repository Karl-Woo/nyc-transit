"use client";

import { useState, useCallback, useEffect } from "react";
import { useStyletron } from "baseui";
import { Block } from "baseui/block";
import { Button, KIND, SIZE } from "baseui/button";
import { Select, TYPE } from "baseui/select";
import { Spinner } from "baseui/spinner";
import type { GeoCoordinates } from "@/lib/types";

interface LocationInputProps {
  onLocationSet: (coords: GeoCoordinates, displayName: string, source: "gps" | "address") => void;
  geoLocation: GeoCoordinates | null;
  geoLoading: boolean;
  geoError: string | null;
  onRequestGeo: () => void;
  label?: string;
  value?: string;
}

export default function LocationInput({
  onLocationSet,
  geoLocation,
  geoLoading,
  geoError,
  onRequestGeo,
  label = "Your location",
  value,
}: LocationInputProps) {
  const [css] = useStyletron();
  const [addressOptions, setAddressOptions] = useState<Array<{ id: string; label: string; lat: number; lon: number }>>([]);
  const [selectedValue, setSelectedValue] = useState<Array<{ id: string; label: string }>>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [waitingForGps, setWaitingForGps] = useState(false);

  // When GPS resolves after button click, propagate to parent
  useEffect(() => {
    if (waitingForGps && geoLocation && !geoLoading) {
      onLocationSet(geoLocation, "Current Location", "gps");
      setSelectedValue([]);
      setWaitingForGps(false);
    }
  }, [waitingForGps, geoLocation, geoLoading, onLocationSet]);

  const handleInputChange = useCallback(async (inputValue: string) => {
    if (inputValue.length < 3) {
      setAddressOptions([]);
      return;
    }

    setSearchLoading(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(inputValue)}`);
      const data = await res.json();
      setAddressOptions(
        (data.results || []).map((r: { displayName: string; lat: number; lon: number }, i: number) => ({
          id: `addr-${i}`,
          label: r.displayName.split(",").slice(0, 3).join(","),
          lat: r.lat,
          lon: r.lon,
        }))
      );
    } catch {
      setAddressOptions([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleGpsClick = useCallback(() => {
    if (geoLocation) {
      // Already have location, use immediately
      onLocationSet(geoLocation, "Current Location", "gps");
      setSelectedValue([]);
    } else {
      // Request location and wait for it
      setWaitingForGps(true);
      onRequestGeo();
    }
  }, [geoLocation, onLocationSet, onRequestGeo]);

  const isLocated = !!value && value === "Current Location";

  return (
    <Block paddingLeft="scale600" paddingRight="scale600">
      <Block
        font="font100"
        color="contentSecondary"
        marginBottom="scale200"
        overrides={{
          Block: {
            style: {
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            },
          },
        }}
      >
        {label}
      </Block>
      <Block display="flex" gridGap="scale300" alignItems="flex-start">
        <Button
          kind={KIND.secondary}
          size={SIZE.compact}
          onClick={handleGpsClick}
          isLoading={geoLoading || waitingForGps}
          overrides={{
            BaseButton: {
              style: {
                flexShrink: 0,
                minWidth: "48px",
                height: "48px",
                borderTopLeftRadius: "12px",
                borderTopRightRadius: "12px",
                borderBottomLeftRadius: "12px",
                borderBottomRightRadius: "12px",
                backgroundColor: isLocated ? "#000000" : "#E2E2E2",
                color: isLocated ? "#FFFFFF" : "#000000",
                ":hover": {
                  backgroundColor: isLocated ? "#333333" : "#CCCCCC",
                },
              },
            },
          }}
        >
          {geoLoading || waitingForGps ? (
            <Spinner $size={18} $borderWidth={2} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            </svg>
          )}
        </Button>

        <Block flex="1">
          <Select
            options={addressOptions}
            value={
              value
                ? [{ id: "current", label: value }]
                : selectedValue
            }
            placeholder="Enter an address..."
            type={TYPE.search}
            isLoading={searchLoading}
            filterOptions={(options) => options}
            onInputChange={(e) => {
              const target = e.target as HTMLInputElement;
              handleInputChange(target.value);
            }}
            onChange={(params) => {
              const sel = params.value as Array<{ id: string; label: string; lat?: number; lon?: number }>;
              setSelectedValue(sel);
              if (sel.length > 0 && sel[0].lat && sel[0].lon) {
                onLocationSet(
                  { lat: sel[0].lat, lon: sel[0].lon },
                  sel[0].label,
                  "address"
                );
              }
            }}
            overrides={{
              ControlContainer: {
                style: {
                  backgroundColor: "#FFFFFF",
                  borderTopWidth: "2px",
                  borderBottomWidth: "2px",
                  borderLeftWidth: "2px",
                  borderRightWidth: "2px",
                  borderTopColor: "#E2E2E2",
                  borderBottomColor: "#E2E2E2",
                  borderLeftColor: "#E2E2E2",
                  borderRightColor: "#E2E2E2",
                  borderTopLeftRadius: "12px",
                  borderTopRightRadius: "12px",
                  borderBottomLeftRadius: "12px",
                  borderBottomRightRadius: "12px",
                  minHeight: "48px",
                },
              },
            }}
          />
        </Block>
      </Block>
      {geoError && (
        <Block font="font100" color="contentNegative" marginTop="scale100">
          <span className={css({ fontSize: "12px" })}>{geoError}. Enter an address instead.</span>
        </Block>
      )}
    </Block>
  );
}
