export interface PropertyMapControls {
  defaultMapType: "hybrid";
  mapTypeControl: true;
  streetViewControl: true;
  rotateControl: true;
  fullscreenControl: true;
  zoomControl: true;
  keyboardShortcuts: true;
  gestureHandling: "cooperative";
  heading: 0;
  tilt: 45;
}

export type PropertyMapPresentation =
  | { provider: "openstreetmap" }
  | {
      provider: "google";
      mapId?: string;
      controls: PropertyMapControls;
    };

export type GoogleMapLoadState = "loading" | "initializing" | "ready" | "fallback";

export const GOOGLE_MAP_INITIALIZATION_TIMEOUT_MS = 10_000;

const GOOGLE_CONTROLS: PropertyMapControls = {
  defaultMapType: "hybrid",
  mapTypeControl: true,
  streetViewControl: true,
  rotateControl: true,
  fullscreenControl: true,
  zoomControl: true,
  keyboardShortcuts: true,
  gestureHandling: "cooperative",
  heading: 0,
  tilt: 45,
};

export function getPropertyMapPresentation(
  apiKey: string | undefined,
  mapId: string | undefined
): PropertyMapPresentation {
  if (!apiKey?.trim()) return { provider: "openstreetmap" };

  const cleanedMapId = mapId?.trim() || undefined;

  return {
    provider: "google",
    ...(cleanedMapId ? { mapId: cleanedMapId } : {}),
    controls: GOOGLE_CONTROLS,
  };
}

export function getGoogleMapLoadState(
  isMapsLibraryLoaded: boolean,
  hasMapInitialized: boolean,
  initializationWatchdogExpired: boolean
): GoogleMapLoadState {
  if (!isMapsLibraryLoaded) return "loading";
  if (initializationWatchdogExpired) return "fallback";
  return hasMapInitialized ? "ready" : "initializing";
}

export function getOpenStreetMapEmbedUrl(
  latitude: number,
  longitude: number
): string {
  const params = new URLSearchParams({
    bbox: `${longitude - 0.012},${latitude - 0.006},${longitude + 0.012},${latitude + 0.006}`,
    layer: "mapnik",
  });

  return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`;
}

interface PropertyWithCoordinates {
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export function getPropertyMapPoints<T extends PropertyWithCoordinates>(
  properties: ReadonlyArray<T>,
): Array<T & { position: { lat: number; lng: number } }> {
  return properties.flatMap((property) => {
    const latitude = property.coordinates?.latitude;
    const longitude = property.coordinates?.longitude;
    if (
      typeof latitude !== "number" ||
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90 ||
      typeof longitude !== "number" ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      return [];
    }

    return [{ ...property, position: { lat: latitude, lng: longitude } }];
  });
}
