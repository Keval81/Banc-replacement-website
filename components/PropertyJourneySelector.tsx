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
      className={`grid grid-cols-2 overflow-hidden rounded-[18px] border border-white/30 bg-banc-dark-deep/72 p-1 shadow-[0_18px_46px_rgba(0,0,0,0.32)] backdrop-blur-xl ${className}`}
    >
      {landingUi.heroActions.map((action) => {
        const isPrimary = action.tone === "primary";

        return (
          <Link
            key={action.href}
            href={action.href}
            className={`group flex min-h-14 items-center justify-between gap-3 rounded-[14px] px-4 py-2.5 transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-banc-dark-deep motion-reduce:transition-none ${
              isPrimary
                ? "bg-[#F6F2EA] text-banc-dark-deep shadow-[0_7px_20px_rgba(0,0,0,0.18)] hover:bg-white"
                : "text-white hover:bg-white/10"
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
              <span className="mt-0.5 block font-serif text-[19px] leading-none">
                {action.label}
              </span>
            </span>
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none ${
                isPrimary
                  ? "border-banc-dark-deep/15 bg-banc-sky text-banc-dark-deep"
                  : "border-white/20 bg-white/10 text-banc-sky"
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
