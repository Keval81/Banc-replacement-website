/**
 * Colour-backed carousel card surfaces.
 *
 * Nitesh asked for colour-backed cards rather than plain text blocks. Every
 * surface here pairs a background with the ink that belongs on it, so a card
 * cannot be given a colour without also being given readable text — which is
 * exactly how the site accumulated 488 AA failures before the contrast pass.
 *
 * Surfaces stay inside DESIGN.md: solid fills, no gradients, one accent moment
 * per card, and the hairline rather than a shadow.
 */
export interface CarouselSurface {
  /** Tailwind background utility. */
  background: string;
  /** Ink that reaches AA on that background. */
  ink: string;
  /** Muted ink for the supporting line, still AA. */
  mutedInk: string;
  /** Hairline that reads against the fill. */
  border: string;
  /**
   * The colours as they actually composite, so a test asserts the contrast
   * rather than trusting the class names. Alpha inks must be given as the
   * blended result: `text-white/70` on the dark card is #BABAB9, not white.
   */
  hex: { background: string; ink: string; mutedInk: string };
}

export const CAROUSEL_SURFACES: readonly CarouselSurface[] = [
  {
    background: "bg-banc-dark-deep",
    ink: "text-white",
    mutedInk: "text-white/70",
    border: "border-white/15",
    hex: { background: "#1A1917", ink: "#FFFFFF", mutedInk: "#BABAB9" },
  },
  {
    background: "bg-banc-sky",
    ink: "text-banc-dark-deep",
    mutedInk: "text-banc-dark-deep/80",
    border: "border-banc-dark-deep/15",
    hex: { background: "#4AC8E8", ink: "#1A1917", mutedInk: "#243C41" },
  },
  {
    background: "bg-banc-grey-pale",
    ink: "text-banc-dark",
    mutedInk: "text-banc-muted-readable",
    border: "border-banc-line",
    hex: { background: "#F4F3F1", ink: "#2C2A27", mutedInk: "#5F5D57" },
  },
  {
    background: "bg-banc-sky-light",
    ink: "text-banc-dark-deep",
    mutedInk: "text-banc-muted-readable",
    border: "border-banc-dark-deep/10",
    hex: { background: "#E8F8FC", ink: "#1A1917", mutedInk: "#5F5D57" },
  },
] as const;

/** Cycles the palette so a track of any length keeps its rhythm. */
export function surfaceFor(index: number): CarouselSurface {
  return CAROUSEL_SURFACES[index % CAROUSEL_SURFACES.length];
}
