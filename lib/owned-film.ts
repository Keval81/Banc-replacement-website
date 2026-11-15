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
  /** CSS object-position for where the subject sits; keeps people in frame when a wide clip is cropped to a phone. */
  focus?: string;
}

const beat = (
  name: string,
  description: string,
  focus?: string,
): OwnedFilm => ({
  src: `/videos/film/${name}.mp4`,
  poster: `/images/film/${name}.jpg`,
  width: 1440,
  height: 810,
  description,
  ...(focus ? { focus } : {}),
});

export const OWNED_FILMS = {
  keysHandover: beat(
    "card-keys",
    "A couple stand on the lawn outside their new home, keys held up",
  ),
  movingIn: beat(
    "card-moving",
    "A family carry boxes and a plant from the van to their new front door",
  ),
  premierElevation: beat(
    "card-premier",
    "A large brick house at dusk, its driveway sweeping past a clipped lawn",
  ),
  maintenanceCall: beat(
    "beat4-maintenance",
    "An engineer knocks at the door of a red-brick house and is welcomed in",
  ),
  // Generated 14 Nov 2026. Only the first 1.4s is used, slowed to two seconds
  // and played forward then back: after that the woman's cup and head move
  // unnaturally (SanSan, 15 Nov).
  premierTerrace: beat(
    "premier-terrace",
    "A couple share a morning coffee on the terrace of a country house, mist over the lawn",
    "22% center",
  ),
} as const satisfies Record<string, OwnedFilm>;

/**
 * Keyed by the service card's href. All four cards carry Banc's own footage as
 * of 7 September — Property Management was the last one on a hotlinked
 * American stock kitchen.
 */
export const SERVICE_FILMS: Record<string, OwnedFilm> = {
  "/sales": OWNED_FILMS.keysHandover,
  "/lettings": OWNED_FILMS.movingIn,
  "/premier-homes": OWNED_FILMS.premierElevation,
  "/lettings/landlords-guide": OWNED_FILMS.maintenanceCall,
};

/** Films that sit behind a page opener, keyed by the page's path. */
export const OPENER_FILMS: Record<string, OwnedFilm> = {
  "/premier-homes": OWNED_FILMS.premierTerrace,
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
