"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { shouldPlayAmbientVideo, type OwnedFilm } from "@/lib/owned-film";

interface AmbientVideoProps {
  film: OwnedFilm;
  /** Sizes hint for the poster, which is the image that always renders. */
  sizes: string;
  priority?: boolean;
  className?: string;
}

/**
 * A poster that becomes a film once it is on screen.
 *
 * The still is the real content: it is server-rendered, it is what a
 * reduced-motion viewer keeps, and it is what shows if the clip never loads.
 * The video is layered over it and only mounts when the card scrolls into view,
 * so the homepage is not decoding five clips at once behind the hero.
 */
export function AmbientVideo({
  film,
  sizes,
  priority = false,
  className = "",
}: AmbientVideoProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "200px" },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const playing = shouldPlayAmbientVideo({ prefersReducedMotion, inView });

  return (
    <div ref={containerRef} className={`relative h-full w-full ${className}`}>
      <Image
        src={film.poster}
        alt={film.description}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
      {playing && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          width={film.width}
          height={film.height}
          poster={film.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          // The poster underneath already carries the description.
          aria-hidden="true"
        >
          <source src={film.src} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
