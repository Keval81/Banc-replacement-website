"use client";

import * as React from "react";

import { FloorplanViewer } from "@/components/FloorplanViewer";
import { PropertyEpcViewer } from "@/components/property-detail/PropertyEpcViewer";
import {
  getAvailablePropertyMedia,
  type PropertyMediaTabId,
} from "@/lib/property-detail-view";
import type { LivePropertyDetail } from "@/lib/property-view";
import { cn } from "@/lib/utils";

const TAB_LABELS: Record<PropertyMediaTabId, string> = {
  floorplan: "Floorplan",
  epc: "EPC",
  map: "Map",
};

type PropertyMedia = Pick<
  LivePropertyDetail,
  "floorplans" | "epcImageUrl" | "epcRating" | "latitude" | "longitude" | "postcode"
>;

interface PropertyMediaTabsProps {
  property: PropertyMedia;
}

interface TabSelection {
  mediaKey: string;
  activeTab: PropertyMediaTabId | null;
}

export function PropertyMediaTabs({ property }: PropertyMediaTabsProps): React.ReactElement | null {
  const tabs = getAvailablePropertyMedia(property);
  const mediaKey = tabs.join("|");
  const [selection, setSelection] = React.useState<TabSelection>(() => ({
    mediaKey,
    activeTab: tabs[0] ?? null,
  }));

  const activeTab =
    selection.mediaKey === mediaKey && selection.activeTab && tabs.includes(selection.activeTab)
      ? selection.activeTab
      : tabs[0] ?? null;

  React.useEffect(() => {
    setSelection((current) => {
      if (current.mediaKey === mediaKey && current.activeTab === activeTab) return current;
      return { mediaKey, activeTab };
    });
  }, [activeTab, mediaKey]);

  if (!activeTab) return null;

  const selectTab = (tab: PropertyMediaTabId): void => {
    setSelection({ mediaKey, activeTab: tab });
  };

  const moveFocus = (event: React.KeyboardEvent<HTMLButtonElement>, index: number): void => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const next = (index + delta + tabs.length) % tabs.length;
    selectTab(tabs[next]);
    document.getElementById(`property-media-tab-${tabs[next]}`)?.focus();
  };

  return (
    <section aria-label="Property supporting media">
      <div
        role="tablist"
        aria-label="Property media"
        className={cn(
          "grid gap-2",
          tabs.length === 3 ? "grid-cols-3" : tabs.length === 2 ? "grid-cols-2" : "grid-cols-1"
        )}
      >
        {tabs.map((tab, index) => {
          const isActive = tab === activeTab;

          return (
            <button
              key={tab}
              id={`property-media-tab-${tab}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`property-media-panel-${tab}`}
              tabIndex={isActive ? 0 : -1}
              className={cn(
                "min-h-11 rounded-md border px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-banc-focus",
                isActive
                  ? "border-banc-dark bg-banc-dark text-white"
                  : "border-banc-grey/30 bg-white text-banc-dark hover:border-banc-dark hover:bg-banc-grey-pale"
              )}
              onClick={() => selectTab(tab)}
              onKeyDown={(event) => moveFocus(event, index)}
            >
              {TAB_LABELS[tab]}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab}
          id={`property-media-panel-${tab}`}
          role="tabpanel"
          aria-labelledby={`property-media-tab-${tab}`}
          hidden={tab !== activeTab}
          className="mt-4"
        >
          {tab === activeTab && tab === "floorplan" && (
            <FloorplanViewer floorplans={property.floorplans} />
          )}
          {tab === activeTab && tab === "epc" && (
            <PropertyEpcViewer
              epcImageUrl={property.epcImageUrl}
              epcRating={property.epcRating}
            />
          )}
          {tab === activeTab && tab === "map" && <MapPanel property={property} />}
        </div>
      ))}
    </section>
  );
}

function MapPanel({ property }: { property: PropertyMedia }): React.ReactElement | null {
  const { latitude, longitude } = property;
  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  return (
    <div>
      <div className="aspect-[4/3] overflow-hidden rounded-lg border border-banc-grey/20 sm:aspect-[16/9]">
        <iframe
          title={`Map of the ${property.postcode} postcode area`}
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.012}%2C${latitude - 0.006}%2C${longitude + 0.012}%2C${latitude + 0.006}&layer=mapnik&marker=${latitude}%2C${longitude}`}
          className="h-full w-full border-0"
          loading="lazy"
        />
      </div>
      <p className="mt-2 text-sm text-banc-dark">
        Map shows the postcode area, not the property&apos;s precise position.
      </p>
    </div>
  );
}
