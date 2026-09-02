"use client";

import { useEffect, useState } from "react";

import type { LivePropertyDetail } from "@/lib/property-view";

export type LivePropertyState =
  | { phase: "loading" }
  | { phase: "notfound" }
  | { phase: "ready"; property: LivePropertyDetail };

interface LoadedProperty {
  id: string;
  state: Exclude<LivePropertyState, { phase: "loading" }>;
}

const LOADING: LivePropertyState = { phase: "loading" };
const NOT_FOUND: LivePropertyState = { phase: "notfound" };

// Loads a single live listing by reference from the canonical property API
// (`{ property: LivePropertyDetail | null }`). Missing, unavailable and
// malformed responses all collapse into a not-found state so the caller can
// render one honest fallback. The result is keyed by id, so switching
// property shows "loading" again without a synchronous state reset.
export function useLiveProperty(propertyId: string): LivePropertyState {
  const [loaded, setLoaded] = useState<LoadedProperty | null>(null);

  useEffect(() => {
    if (!propertyId) return;

    const controller = new AbortController();

    fetch(`/api/properties/${encodeURIComponent(propertyId)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<{ property?: LivePropertyDetail | null }>;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        setLoaded({
          id: propertyId,
          state: data?.property
            ? { phase: "ready", property: data.property }
            : { phase: "notfound" },
        });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setLoaded({ id: propertyId, state: { phase: "notfound" } });
        }
      });

    return () => {
      controller.abort();
    };
  }, [propertyId]);

  if (!propertyId) return NOT_FOUND;
  return loaded?.id === propertyId ? loaded.state : LOADING;
}
