/**
 * Banc's own footage, shot and generated for this site in September 2026.
 *
 * The homepage previously leaned on hotlinked Unsplash stills, three of which
 * were visibly American — a Seattle condo and a US kitchen on a Hertfordshire
 * agent's homepage. These clips replace the ones that matter most and drop the
 * external dependency with them.
 *
 * The two drone moves from the Hanyards Lane listings are NOT here. They are
 * candidates for the landing film and stay banked under
 * ~/Desktop/Banc Property/Assets/homepage-video-2026-09/ until Nitesh has
 * reviewed the current landing page — shipping them unused would put 8MB of
 * video on every deploy for nothing.
 */

export interface OwnedFilm {
  src: string;
  poster: string;
  width: number;
  height: number;
  /** Describes the footage for anyone who gets the poster instead of the film. */
  description: string;
}

const beat = (
  name: string,
  description: string,
): OwnedFilm => ({
  src: `/videos/film/${name}.mp4`,
  poster: `/images/film/${name}.jpg`,
  width: 1440,
  height: 810,
  description,
});

export const OWNED_FILMS = {
  walkIn: beat(
    "beat1-walkin",
    "A woman stops dead in the doorway of a home she has just walked into, hand to her mouth, and turns to her partner",
  ),
  kidsGarden: beat(
    "beat2-kids",
    "Two children run out across a striped English lawn with their arms wide",
  ),
  eldersGardenRoom: beat(
    "beat3-elders",
    "An older couple stand in a glazed garden room; she looks up at the roof and her hand finds his",
  ),
} as const satisfies Record<string, OwnedFilm>;

/**
 * Keyed by the service card's href. Property Management is deliberately absent:
 * there are three emotional beats and four cards, and it keeps its still until
 * the wider stock-imagery sweep replaces it with a British one.
 */
export const SERVICE_FILMS: Record<string, OwnedFilm> = {
  "/sales": OWNED_FILMS.walkIn,
  "/lettings": OWNED_FILMS.kidsGarden,
  "/premier-homes": OWNED_FILMS.eldersGardenRoom,
};

export function getServiceFilm(href: string): OwnedFilm | undefined {
  return SERVICE_FILMS[href];
}

/**
 * The poster carries the card until both are true. Mounting every clip at once
 * would have the homepage decoding the hero film plus four more.
 */
export function shouldPlayAmbientVideo({
  prefersReducedMotion,
  inView,
}: {
  prefersReducedMotion: boolean;
  inView: boolean;
}): boolean {
  return !prefersReducedMotion && inView;
}
