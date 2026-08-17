"use client";

import * as React from "react";

import { FloorplanViewer } from "@/components/FloorplanViewer";
import { GooglePropertyMap } from "@/components/property-detail/GooglePropertyMap";
import { PropertyHeroGallery } from "@/components/property-detail/PropertyHeroGallery";
import {
  getAvailablePropertyMediaModes,
  getNextPropertyMediaMode,
  type PropertyMediaMode,
  type PropertyMediaNavigationKey,
} from "@/lib/property-detail-view";
import type { LivePropertyDetail } from "@/lib/property-view";
import { cn } from "@/lib/utils";

type PropertyMediaStageData = Pick<
  LivePropertyDetail,
  | "id"
  | "department"
  | "gallery"
  | "floorplans"
  | "latitude"
  | "longitude"
  | "postcode"
>;

const MODE_LABELS: Record<Exclude<PropertyMediaMode, "photos">, string> = {
  floorplan: "Floorplan",
  map: "Map",
};

export function PropertyMediaStage({
  property,
}: {
  property: PropertyMediaStageData;
}): React.ReactElement {
  return (
    <PropertyMediaStageContent
      key={`${property.department}:${property.id}`}
      property={property}
    />
  );
}

function PropertyMediaStageContent({
  property,
}: {
  property: PropertyMediaStageData;
}): React.ReactElement {
  const modes = getAvailablePropertyMediaModes({
    images: property.gallery,
    floorplans: property.floorplans,
    latitude: property.latitude,
    longitude: property.longitude,
  });
  const [activeMode, setActiveMode] = React.useState<PropertyMediaMode | null>(
    modes[0] ?? null
  );

  if (!activeMode) return <PropertyHeroGallery images={[]} />;

  const selectAndFocus = (mode: PropertyMediaMode): void => {
    setActiveMode(mode);
    requestAnimationFrame(() => {
      document.getElementById(`property-media-stage-tab-${mode}`)?.focus();
    });
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    mode: PropertyMediaMode
  ): void => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    selectAndFocus(
      getNextPropertyMediaMode(
        modes,
        mode,
        event.key as PropertyMediaNavigationKey
      )
    );
  };

  return (
    <section aria-label="Property media">
      <div
        role="tablist"
        aria-label="Property media"
        className={cn(
          "grid gap-2 bg-white px-4 py-3 lg:px-0",
          modes.length === 3
            ? "grid-cols-3"
            : modes.length === 2
              ? "grid-cols-2"
              : "grid-cols-1"
        )}
      >
        {modes.map((mode) => {
          const selected = mode === activeMode;
          const visibleLabel =
            mode === "photos" ? `Photos ${property.gallery.length}` : MODE_LABELS[mode];
          const accessibleLabel =
            mode === "photos" ? `Photos, ${property.gallery.length} images` : MODE_LABELS[mode];

          return (
            <button
              key={mode}
              id={`property-media-stage-tab-${mode}`}
              type="button"
              role="tab"
              aria-label={accessibleLabel}
              aria-selected={selected}
              aria-controls={`property-media-stage-panel-${mode}`}
              tabIndex={selected ? 0 : -1}
              className={cn(
                "min-h-11 rounded-full border px-2 text-xs font-semibold transition-colors sm:px-4 sm:text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-banc-focus",
                selected
                  ? "border-banc-dark bg-banc-dark text-white"
                  : "border-banc-grey/30 bg-white text-banc-dark hover:border-banc-dark"
              )}
              onClick={() => setActiveMode(mode)}
              onKeyDown={(event) => handleKeyDown(event, mode)}
            >
              {mode === "floorplan" ? (
                <><span className="sm:hidden">Plan</span><span className="hidden sm:inline">Floorplan</span></>
              ) : (
                visibleLabel
              )}
            </button>
          );
        })}
      </div>

      {modes.map((mode) => (
        <div
          key={mode}
          id={`property-media-stage-panel-${mode}`}
          role="tabpanel"
          aria-labelledby={`property-media-stage-tab-${mode}`}
          hidden={mode !== activeMode}
        >
          {mode === "photos" && <PropertyHeroGallery images={property.gallery} />}
          {mode === activeMode && mode === "floorplan" && (
            <div className="px-4 pb-4 lg:px-0"><FloorplanViewer floorplans={property.floorplans} /></div>
          )}
          {mode === activeMode && mode === "map" &&
            typeof property.latitude === "number" &&
            typeof property.longitude === "number" && (
              <div className="px-4 pb-4 lg:px-0">
                <GooglePropertyMap
                  latitude={property.latitude}
                  longitude={property.longitude}
                  postcode={property.postcode}
                />
              </div>
            )}
        </div>
      ))}
    </section>
  );
}
