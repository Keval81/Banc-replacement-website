import type { CSSProperties } from "react";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { getLandingUi } from "@/lib/landing-ui";

const landingUi = getLandingUi("aker");

interface PropertyJourneySelectorProps {
  className?: string;
  "data-placement"?: string;
}

export function PropertyJourneySelector({
  className = "",
  "data-placement": dataPlacement,
}: PropertyJourneySelectorProps) {
  return (
    <nav
      aria-label="Browse Banc properties"
      data-presentation={landingUi.heroActionPresentation}
      data-placement={dataPlacement}
      className={`grid grid-cols-2 gap-2 ${className}`}
    >
      {landingUi.heroActions.map((action, index) => {
        const isPrimary = action.tone === "primary";

        return (
          <Link
            key={action.href}
            href={action.href}
            style={
              { "--banc-action-delay": `${3.35 + index * 0.6}s` } as CSSProperties
            }
            className={`banc-action-reveal group relative flex min-h-16 items-center justify-between gap-3 overflow-hidden rounded-[15px] border px-4 py-3 shadow-[0_14px_36px_rgba(0,0,0,0.24)] backdrop-blur-xl transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-banc-dark-deep motion-reduce:transition-none ${
              isPrimary
                ? "border-white/55 bg-banc-cream/95 text-banc-dark-deep hover:-translate-y-0.5 hover:bg-white"
                : "border-white/30 bg-banc-dark-deep/68 text-white hover:-translate-y-0.5 hover:border-white/50 hover:bg-banc-dark-deep/82"
            }`}
          >
            <span className="min-w-0 text-left">
              <span
                className={`block text-[9px] font-semibold uppercase tracking-[0.2em] ${
                  isPrimary ? "text-banc-dark-deep/70" : "text-white/70"
                }`}
              >
                {action.eyebrow}
              </span>
              <span className="mt-1 block font-serif text-[19px] leading-none">
                {action.label}
              </span>
            </span>
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none ${
                isPrimary
                  ? "border-banc-dark-deep/15 bg-banc-sky/85 text-banc-dark-deep"
                  : "border-white/25 bg-white/10 text-banc-focus"
              }`}
              aria-hidden="true"
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
