"use client";

import { useSyncExternalStore } from "react";
import { TEAM_HERO_PHONE_QUERY } from "@/lib/team-media";

function subscribe(onChange: () => void): () => void {
  const mediaQuery = window.matchMedia(TEAM_HERO_PHONE_QUERY);
  mediaQuery.addEventListener("change", onChange);

  return () => mediaQuery.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(TEAM_HERO_PHONE_QUERY).matches;
}

// Only read after hydration; the server never renders the film (see
// usePrefersReducedMotion), so this value never reaches server markup.
function getServerSnapshot(): boolean {
  return false;
}

export function useIsPhoneViewport(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
