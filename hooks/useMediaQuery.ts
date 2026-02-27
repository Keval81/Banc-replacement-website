"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect media query matches
 * Useful for responsive design in JavaScript
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Create event listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener (with backwards compatibility)
    if (media.addEventListener) {
      media.addEventListener("change", listener);
    } else {
      // Fallback for older browsers
      media.addListener(listener);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}

// Predefined breakpoints matching Tailwind defaults
export const breakpoints = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
} as const;

/**
 * Hook to check if current viewport is mobile
 */
export function useIsMobile(): boolean {
  return !useMediaQuery(breakpoints.lg);
}

/**
 * Hook to check if current viewport is tablet or larger
 */
export function useIsTablet(): boolean {
  return useMediaQuery(breakpoints.md);
}

/**
 * Hook to check if current viewport is desktop
 */
export function useIsDesktop(): boolean {
  return useMediaQuery(breakpoints.lg);
}

/**
 * Hook to check if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/**
 * Hook to check if user prefers dark mode
 */
export function usePrefersDarkMode(): boolean {
  return useMediaQuery("(prefers-color-scheme: dark)");
}

/**
 * Hook to check if device supports hover
 */
export function useHoverSupported(): boolean {
  return useMediaQuery("(hover: hover)");
}

/**
 * Hook to check if device is touch device
 */
export function useIsTouchDevice(): boolean {
  return useMediaQuery("(pointer: coarse)");
}
