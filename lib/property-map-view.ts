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
  | { provider: "keyless-embed" }
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
  if (!apiKey?.trim()) return { provider: "keyless-embed" };

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
  initializationWatchdogExpired: boolean,
  // Google calls window.gm_authFailure for InvalidKey and
  // RefererNotAllowedMapError. The library loads and the map object
  // initializes normally, then paints nothing — so the watchdog never fires
  // and this is the only signal that the key was rejected.
  authenticationFailed = false
): GoogleMapLoadState {
  if (authenticationFailed) return "fallback";
  if (!isMapsLibraryLoaded) return "loading";
  if (initializationWatchdogExpired) return "fallback";
  return hasMapInitialized ? "ready" : "initializing";
}

// Google's keyless embed, not OpenStreetMap: the OSM embed's WebGL renderer
// paints a blank canvas inside this app (verified — the same URL renders on a
// bare page on this origin, and this URL renders in the same slot).
export function getFallbackMapEmbedUrl(
  latitude: number,
  longitude: number
): string {
  const params = new URLSearchParams({
    q: `${latitude},${longitude}`,
    z: "14",
    output: "embed",
  });

  return `https://www.google.com/maps?${params.toString()}`;
}
