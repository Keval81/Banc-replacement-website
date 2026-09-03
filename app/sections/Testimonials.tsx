import { SectionHeader } from "@/components/SectionHeader";
import { Carousel } from "@/components/Carousel";
import { surfaceFor } from "@/lib/carousel-surfaces";
import { BANC_REVIEWS } from "@/lib/reviews";
import Link from "next/link";

/**
 * Real Google reviews, presented as typographic pull-quotes on colour-backed
 * cards — no stock faces attached to real reviewers (see DESIGN.md).
 *
 * This used to rotate one quote at a time on a 7-second timer, which showed
 * three of the thirteen reviews and moved the copy out from under anyone still
 * reading it. The carousel shows them all and only moves when asked.
 */
export default function Testimonials() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto w-full max-w-[1400px] px-5 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader number="04" label="Clients" title="In their words" />
        </div>

        <Carousel
          label="Client reviews"
          className="mt-14"
          slideClassName="basis-[85%] sm:basis-[60%] lg:basis-[40%] xl:basis-[31%]"
        >
          {BANC_REVIEWS.map((review, index) => {
            const surface = surfaceFor(index);
            return (
              <figure
                key={`${review.name}-${review.location}`}
                className={`banc-lift flex h-full flex-col rounded-[10px] border p-7 ${surface.background} ${surface.border}`}
              >
                <blockquote
                  className={`font-serif text-xl font-light leading-snug ${surface.ink}`}
                >
                  &ldquo;{review.text}&rdquo;
                </blockquote>
                <figcaption
                  className={`mt-6 flex flex-wrap items-baseline gap-x-5 gap-y-1 border-t pt-4 ${surface.border}`}
                >
                  <span className={`text-[11px] uppercase tracking-[0.18em] ${surface.ink}`}>
                    {review.name}
                  </span>
                  <span
                    className={`text-[11px] uppercase tracking-[0.18em] ${surface.mutedInk}`}
                  >
                    {review.location}
                  </span>
                  <span
                    className={`text-[11px] uppercase tracking-[0.18em] ${surface.mutedInk}`}
                  >
                    Google review &middot; 5.0
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </Carousel>

        <Link
          href="/reviews"
          className="mt-10 inline-flex min-h-11 items-center gap-2 border-b border-banc-dark text-sm font-semibold uppercase tracking-[0.14em] text-banc-dark transition-colors hover:text-banc-focus"
        >
          Read all client reviews
        </Link>
      </div>
    </section>
  );
}
