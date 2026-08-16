"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Maximize2, X } from "lucide-react";
import * as React from "react";

import { FloorplanViewer } from "@/components/FloorplanViewer";
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

const EPC_RATING_COLOURS: Record<string, string> = {
  A: "bg-emerald-100",
  B: "bg-emerald-100",
  C: "bg-lime-100",
  D: "bg-yellow-100",
  E: "bg-orange-100",
  F: "bg-orange-200",
  G: "bg-red-100",
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
          {tab === activeTab && tab === "epc" && <EpcPanel property={property} />}
          {tab === activeTab && tab === "map" && <MapPanel property={property} />}
        </div>
      ))}
    </section>
  );
}

function EpcPanel({ property }: { property: PropertyMedia }): React.ReactElement {
  const rating = property.epcRating?.trim().toUpperCase();
  const certificateAlt = `Energy performance certificate graph${
    rating ? `, current rating ${rating}` : ""
  }`;

  return (
    <Dialog.Root>
      <div className="rounded-lg border border-banc-grey/20 bg-white p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          {rating && (
            <span
              className={cn(
                "inline-flex h-12 min-w-12 items-center justify-center rounded-md px-3 text-lg font-bold text-banc-dark",
                EPC_RATING_COLOURS[rating] ?? "bg-banc-grey-pale"
              )}
              aria-label={`Energy performance rating ${rating}`}
            >
              {rating}
            </span>
          )}
          <p className="max-w-xl text-sm text-banc-dark">
            Energy efficiency runs from A (most efficient) to G (least efficient).
          </p>
        </div>
        <Dialog.Trigger asChild>
          <button
            type="button"
            aria-label="Expand EPC certificate"
            className="group relative mt-5 flex min-h-11 w-full cursor-zoom-in justify-center overflow-hidden rounded-md bg-banc-grey-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-banc-focus"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={property.epcImageUrl}
              alt={certificateAlt}
              loading="lazy"
              className="max-h-[620px] w-full object-contain"
            />
            <span className="absolute bottom-3 right-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-banc-dark px-4 text-sm font-medium text-white shadow-lg">
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
              Expand certificate
            </span>
          </button>
        </Dialog.Trigger>
      </div>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/95" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-[101] flex items-center justify-center overflow-auto bg-black p-[calc(env(safe-area-inset-top)+0.75rem)] pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pl-[calc(env(safe-area-inset-left)+0.75rem)] pr-[calc(env(safe-area-inset-right)+0.75rem)] sm:p-[calc(env(safe-area-inset-top)+1.5rem)] sm:pb-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:pl-[calc(env(safe-area-inset-left)+1.5rem)] sm:pr-[calc(env(safe-area-inset-right)+1.5rem)]"
        >
          <Dialog.Title className="sr-only">Energy performance certificate</Dialog.Title>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={property.epcImageUrl}
            alt={certificateAlt}
            className="max-h-full max-w-full object-contain"
          />
          <Dialog.Close
            type="button"
            aria-label="Close EPC certificate"
            className="absolute right-[calc(env(safe-area-inset-right)+1rem)] top-[calc(env(safe-area-inset-top)+1rem)] flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-black/85 text-white shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
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
