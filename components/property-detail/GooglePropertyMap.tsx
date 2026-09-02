"use client";

import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import * as React from "react";

import { AREA_MAP_ZOOM } from "@/lib/property-privacy";
import {
  GOOGLE_MAP_INITIALIZATION_TIMEOUT_MS,
  getGoogleMapLoadState,
  getOpenStreetMapEmbedUrl,
  getPropertyMapPresentation,
  type PropertyMapPresentation,
} from "@/lib/property-map-view";

interface GooglePropertyMapProps {
  latitude: number;
  longitude: number;
  postcode: string;
}

const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };
const FALLBACK_NOTICE = "Satellite map unavailable. Showing a standard area map.";

export function GooglePropertyMap({
  latitude,
  longitude,
  postcode,
}: GooglePropertyMapProps): React.ReactElement {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const presentation = getPropertyMapPresentation(
    apiKey,
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID
  );

  if (presentation.provider === "openstreetmap") {
    return (
      <OpenStreetMapPropertyMap
        latitude={latitude}
        longitude={longitude}
        postcode={postcode}
        notice={FALLBACK_NOTICE}
      />
    );
  }

  return (
    <GooglePropertyMapLoader
      apiKey={apiKey?.trim() ?? ""}
      latitude={latitude}
      longitude={longitude}
      postcode={postcode}
      presentation={presentation}
    />
  );
}

function GooglePropertyMapLoader({
  apiKey,
  latitude,
  longitude,
  postcode,
  presentation,
}: GooglePropertyMapProps & {
  apiKey: string;
  presentation: Extract<PropertyMapPresentation, { provider: "google" }>;
}): React.ReactElement {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "banc-google-maps",
    googleMapsApiKey: apiKey,
  });
  const [hasMapInitialized, setHasMapInitialized] = React.useState(false);
  const [initializationWatchdogExpired, setInitializationWatchdogExpired] =
    React.useState(false);

  React.useEffect(() => {
    if (!isLoaded || hasMapInitialized || initializationWatchdogExpired) return;

    const timeoutId = window.setTimeout(() => {
      setInitializationWatchdogExpired(true);
    }, GOOGLE_MAP_INITIALIZATION_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [hasMapInitialized, initializationWatchdogExpired, isLoaded]);

  if (loadError) {
    return (
      <OpenStreetMapPropertyMap
        latitude={latitude}
        longitude={longitude}
        postcode={postcode}
        notice={FALLBACK_NOTICE}
      />
    );
  }

  const loadState = getGoogleMapLoadState(
    isLoaded,
    hasMapInitialized,
    initializationWatchdogExpired
  );

  if (loadState === "fallback") {
    return (
      <OpenStreetMapPropertyMap
        latitude={latitude}
        longitude={longitude}
        postcode={postcode}
        notice={FALLBACK_NOTICE}
      />
    );
  }

  if (loadState === "loading") {
    return (
      <div
        className="flex aspect-[4/3] items-center justify-center bg-banc-grey-pale sm:aspect-[16/9]"
        role="status"
      >
        <p className="text-sm text-banc-muted-readable">Loading satellite map…</p>
      </div>
    );
  }

  const { controls } = presentation;
  const options: google.maps.MapOptions = {
    mapId: presentation.mapId,
    mapTypeId: google.maps.MapTypeId.HYBRID,
    mapTypeControl: controls.mapTypeControl,
    streetViewControl: controls.streetViewControl,
    rotateControl: controls.rotateControl,
    fullscreenControl: controls.fullscreenControl,
    zoomControl: controls.zoomControl,
    keyboardShortcuts: controls.keyboardShortcuts,
    gestureHandling: controls.gestureHandling,
    heading: controls.heading,
    tilt: controls.tilt,
  };

  return (
    <MapFrame postcode={postcode}>
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={{ lat: latitude, lng: longitude }}
        zoom={AREA_MAP_ZOOM}
        options={options}
        onLoad={(map) => {
          map.setMapTypeId(google.maps.MapTypeId.HYBRID);
          map.setHeading(controls.heading);
          map.setTilt(controls.tilt);
          setHasMapInitialized(true);
        }}
      />
    </MapFrame>
  );
}

function OpenStreetMapPropertyMap({
  latitude,
  longitude,
  postcode,
  notice,
}: GooglePropertyMapProps & { notice: string }): React.ReactElement {
  return (
    <div>
      <p className="mb-3 text-sm text-banc-muted-readable" role="status">
        {notice}
      </p>
      <MapFrame postcode={postcode}>
        <iframe
          title={mapFrameTitle(postcode)}
          src={getOpenStreetMapEmbedUrl(latitude, longitude)}
          className="h-full w-full border-0"
          loading="lazy"
        />
      </MapFrame>
    </div>
  );
}

// `postcode` carries the outward area code only ("EN6"), never a full
// postcode — see lib/property-privacy.ts.
function mapFrameTitle(postcode: string): string {
  return postcode ? `Map of the ${postcode} area` : "Map of the surrounding area";
}

function MapFrame({
  postcode,
  children,
}: {
  postcode: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div>
      <div className="aspect-[4/3] overflow-hidden rounded-lg border border-banc-grey/20 bg-banc-grey-pale sm:aspect-[16/9]">
        {children}
      </div>
      <div className="mt-3 rounded-lg bg-banc-grey-pale px-4 py-3">
        <p className="text-sm font-semibold text-banc-dark">Approximate area</p>
        <p className="mt-1 text-sm text-banc-muted-readable">
          {postcode
            ? `Map shows the ${postcode} area, not the property's exact position.`
            : "Map shows the surrounding area, not the property's exact position."}
        </p>
      </div>
    </div>
  );
}
