"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, Download, Maximize, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import type { Floorplan } from "@/lib/types/property";
import { cn } from "@/lib/utils";

interface FloorplanViewerProps {
  floorplans: Floorplan[];
  className?: string;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_INCREMENT = 0.5;

export function FloorplanViewer({ floorplans, className }: FloorplanViewerProps): React.ReactElement {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [zoom, setZoom] = React.useState(MIN_ZOOM);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const fullscreenTriggerRef = React.useRef<HTMLButtonElement | null>(null);

  if (floorplans.length === 0) {
    return (
      <div className={cn("rounded-lg bg-banc-grey-pale p-8 text-center", className)}>
        <p className="text-banc-grey">No floorplans available</p>
      </div>
    );
  }

  const safeCurrentIndex = Math.min(currentIndex, floorplans.length - 1);
  const currentFloorplan = floorplans[safeCurrentIndex];

  const resetZoom = (): void => setZoom(MIN_ZOOM);

  const selectFloorplan = (index: number): void => {
    setCurrentIndex(index);
    resetZoom();
  };

  const moveFloorplan = (delta: -1 | 1): void => {
    selectFloorplan((safeCurrentIndex + delta + floorplans.length) % floorplans.length);
  };

  const toolbar = (fullscreen = false): React.ReactElement => (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-banc-grey/20 px-3 py-3 sm:px-4",
        fullscreen ? "border-white/20 bg-banc-dark-deep text-white" : "bg-banc-grey-pale"
      )}
    >
      <div className="min-w-0">
        <p className="truncate font-semibold">{currentFloorplan.title}</p>
        {floorplans.length > 1 && (
          <p className={cn("text-sm", fullscreen ? "text-white/80" : "text-banc-grey")}>
            {safeCurrentIndex + 1} of {floorplans.length}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {floorplans.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous floorplan"
              className={iconButtonClassName(fullscreen)}
              onClick={() => moveFloorplan(-1)}
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Next floorplan"
              className={iconButtonClassName(fullscreen)}
              onClick={() => moveFloorplan(1)}
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        )}
        <button
          type="button"
          aria-label="Zoom out floorplan"
          className={iconButtonClassName(fullscreen)}
          disabled={zoom <= MIN_ZOOM}
          onClick={() => setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_INCREMENT))}
        >
          <ZoomOut className="h-5 w-5" aria-hidden="true" />
        </button>
        <span
          className={cn(
            "flex h-11 min-w-12 items-center justify-center px-1 text-sm tabular-nums",
            fullscreen ? "text-white" : "text-banc-grey"
          )}
          aria-label={`Floorplan zoom ${Math.round(zoom * 100)} percent`}
        >
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          aria-label="Zoom in floorplan"
          className={iconButtonClassName(fullscreen)}
          disabled={zoom >= MAX_ZOOM}
          onClick={() => setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_INCREMENT))}
        >
          <ZoomIn className="h-5 w-5" aria-hidden="true" />
        </button>
        {zoom > MIN_ZOOM && (
          <button
            type="button"
            aria-label="Reset floorplan zoom"
            className={iconButtonClassName(fullscreen)}
            onClick={resetZoom}
          >
            <RotateCcw className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
        <a
          href={currentFloorplan.url}
          download={`${currentFloorplan.title.replace(/\s+/g, "_")}.pdf`}
          className={iconButtonClassName(fullscreen)}
          aria-label="Download floorplan"
        >
          <Download className="h-5 w-5" aria-hidden="true" />
        </a>
        {fullscreen ? (
          <Dialog.Close
            type="button"
            aria-label="Close floorplan fullscreen"
            className={iconButtonClassName(true)}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Dialog.Close>
        ) : (
          <button
            ref={fullscreenTriggerRef}
            type="button"
            aria-label="View floorplan fullscreen"
            className={iconButtonClassName(false)}
            onClick={() => setIsFullscreen(true)}
          >
            <Maximize className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );

  const floorplanImage = (fullscreen = false): React.ReactElement => (
    <div
      className={cn(
        "relative overflow-hidden bg-banc-grey-pale",
        fullscreen ? "h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-7rem)] min-h-56" : "h-[360px] sm:h-[500px]"
      )}
    >
      <Image
        src={currentFloorplan.url}
        alt={currentFloorplan.title}
        fill
        priority={fullscreen}
        sizes={fullscreen ? "100vw" : "(max-width: 768px) 100vw, 800px"}
        className="object-contain p-4 motion-reduce:transition-none"
        style={{ transform: `scale(${zoom})` }}
      />
    </div>
  );

  return (
    <Dialog.Root open={isFullscreen} onOpenChange={setIsFullscreen}>
      <div className={cn("overflow-hidden rounded-lg border border-banc-grey/20 bg-white", className)}>
        {toolbar()}
        {floorplanImage()}
      </div>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/95" />
        <Dialog.Content
          className="fixed inset-0 z-[101] flex flex-col bg-black p-[calc(env(safe-area-inset-top)+0.75rem)] pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pl-[calc(env(safe-area-inset-left)+0.75rem)] pr-[calc(env(safe-area-inset-right)+0.75rem)] text-white sm:p-[calc(env(safe-area-inset-top)+1.5rem)] sm:pb-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:pl-[calc(env(safe-area-inset-left)+1.5rem)] sm:pr-[calc(env(safe-area-inset-right)+1.5rem)]"
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            fullscreenTriggerRef.current?.focus();
          }}
        >
          <Dialog.Title className="sr-only">Floorplan viewer</Dialog.Title>
          <div className="mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-lg border border-white/25 bg-banc-dark-deep shadow-2xl">
            {toolbar(true)}
            <div className="min-h-0 flex-1">{floorplanImage(true)}</div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function iconButtonClassName(fullscreen: boolean): string {
  return cn(
    "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40",
    fullscreen
      ? "border border-white/60 bg-black/70 text-white hover:bg-white hover:text-banc-dark focus-visible:outline-white"
      : "border border-banc-grey/30 bg-white text-banc-dark hover:border-banc-dark hover:bg-banc-grey-pale focus-visible:outline-banc-dark"
  );
}
