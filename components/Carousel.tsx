"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface CarouselProps {
  /** Names the carousel for assistive tech. Required — an unlabelled one is unusable. */
  label: string;
  /** One node per slide. */
  children: ReactNode[];
  /**
   * Slide width per breakpoint. Slides are flex items, so this is a basis, and
   * the default shows roughly one on a phone and four on a wide screen.
   */
  slideClassName?: string;
  className?: string;
}

/**
 * A horizontal, scroll-snapping carousel.
 *
 * Deliberately does NOT autoplay. The site already carried a rotating review
 * ticker and it was removed in the first batch; motion that moves content out
 * from under a reader is also the classic carousel accessibility failure. The
 * track is a real scroll container, so it works by touch, trackpad and
 * keyboard whether or not the arrow buttons are used — and it still works if
 * the JavaScript never runs.
 */
export function Carousel({
  label,
  children,
  slideClassName = "basis-[85%] sm:basis-[46%] lg:basis-[31%] xl:basis-[23.5%]",
  className,
}: CarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const headingId = useId();

  const syncEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    // A fractional scrollWidth can leave a pixel of slack at the far end.
    const remaining = track.scrollWidth - track.clientWidth - track.scrollLeft;
    setAtStart(track.scrollLeft <= 1);
    setAtEnd(remaining <= 1);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    syncEdges();
    track.addEventListener("scroll", syncEdges, { passive: true });
    window.addEventListener("resize", syncEdges);
    return () => {
      track.removeEventListener("scroll", syncEdges);
      window.removeEventListener("resize", syncEdges);
    };
    // Re-measure when the slide count changes, or the arrows lie about the ends.
  }, [syncEdges, children.length]);

  const scrollBySlide = useCallback((direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.firstElementChild as HTMLElement | null;
    // Fall back to most of the viewport if there is no slide to measure.
    const step = slide ? slide.getBoundingClientRect().width + 24 : track.clientWidth * 0.8;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({ left: step * direction, behavior: reduced ? "auto" : "smooth" });
  }, []);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLUListElement>) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollBySlide(1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollBySlide(-1);
      }
    },
    [scrollBySlide],
  );

  const arrow =
    "flex h-11 w-11 items-center justify-center rounded-full border border-banc-dark/20 text-banc-dark transition-colors hover:border-banc-dark disabled:opacity-30 disabled:hover:border-banc-dark/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2";

  return (
    <div
      className={className}
      role="group"
      aria-roledescription="carousel"
      aria-labelledby={headingId}
    >
      <span id={headingId} className="sr-only">
        {label}
      </span>

      <ul
        ref={trackRef}
        onKeyDown={onKeyDown}
        tabIndex={0}
        // The track is focusable so the arrow keys have somewhere to land.
        aria-label={`${label} — use the arrow keys to move between slides`}
        className="banc-carousel-track flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-4"
      >
        {children.map((slide, index) => (
          <li
            key={index}
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${children.length}`}
            className={`shrink-0 snap-start ${slideClassName}`}
          >
            {slide}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => scrollBySlide(-1)}
          disabled={atStart}
          aria-label={`Previous ${label.toLowerCase()}`}
          className={arrow}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => scrollBySlide(1)}
          disabled={atEnd}
          aria-label={`Next ${label.toLowerCase()}`}
          className={arrow}
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
