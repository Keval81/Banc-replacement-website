"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Maximize2, X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const EPC_RATING_COLOURS: Record<string, string> = {
  A: "bg-emerald-100",
  B: "bg-emerald-100",
  C: "bg-lime-100",
  D: "bg-yellow-100",
  E: "bg-orange-100",
  F: "bg-orange-200",
  G: "bg-red-100",
};

interface PropertyEpcViewerProps {
  epcImageUrl: string;
  epcRating?: string;
}

export function PropertyEpcViewer({
  epcImageUrl,
  epcRating,
}: PropertyEpcViewerProps): React.ReactElement {
  const rating = epcRating?.trim().toUpperCase();
  const certificateAlt = `Energy performance certificate graph${
    rating ? `, current rating ${rating}` : ""
  }`;

  return (
    <Dialog.Root>
      {/* A supporting panel, not a second hero: the full certificate is one
          tap away in the dialog. */}
      <div className="max-w-md rounded-lg border border-banc-grey/20 bg-white p-4">
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
            className="group relative mt-4 flex min-h-11 w-full cursor-zoom-in justify-center overflow-hidden rounded-md bg-banc-grey-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-banc-focus"
          >
            {/* The EPC URL is supplied by the property API, so Next/Image cannot know its dimensions. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={epcImageUrl}
              alt={certificateAlt}
              loading="lazy"
              className="max-h-[280px] w-full object-contain"
            />
            <span className="absolute bottom-2 right-2 inline-flex min-h-11 items-center gap-2 rounded-full bg-banc-dark px-3 text-xs font-medium text-white shadow-lg">
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
              Expand
            </span>
          </button>
        </Dialog.Trigger>
      </div>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/95" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-[101] flex items-center justify-center overflow-auto bg-black p-[calc(env(safe-area-inset-top)+0.75rem)] pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pl-[calc(env(safe-area-inset-left)+0.75rem)] pr-[calc(env(safe-area-inset-right)+0.75rem)]"
        >
          <Dialog.Title className="sr-only">Energy performance certificate</Dialog.Title>
          {/* The EPC URL is supplied by the property API, so Next/Image cannot know its dimensions. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={epcImageUrl} alt={certificateAlt} className="max-h-full max-w-full object-contain" />
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
