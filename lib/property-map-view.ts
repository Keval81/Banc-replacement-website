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
