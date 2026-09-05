export type TeamMemberName =
  | "Nitesh Bheda"
  | "Andrew Crump"
  | "Vicki Glashier"
  | "Kay Stanley";

export interface TeamPortrait {
  src: string;
}

export const TEAM_HERO_MEDIA = {
  landscapeImage: "/images/team/banc-team-clay.jpg",
  portraitImage: "/images/team/banc-team-clay-portrait.jpg",
  landscapeVideo: "/videos/team/banc-team-clay-landscape-seamless.mp4",
  portraitVideo: "/videos/team/banc-team-clay-portrait-seamless.mp4",
} as const;

export interface Size {
  width: number;
  height: number;
}

export interface HeroFraming {
  minHeightSvh: number;
  headerOffsetPx: number;
  scale: number;
  originX: number;
  originY: number;
}

export interface SubjectBand {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export const TEAM_HERO_SOURCE: { portrait: Size; landscape: Size } = {
  portrait: { width: 810, height: 1440 },
  landscape: { width: 1440, height: 810 },
};

// Where the four figures actually stand, measured off frame 1 of the portrait
// cut: x 235-624, y 668-960 of 810x1440. They sit mid-frame with roughly a
// third of the height as empty pavement below them — that pavement, not the
// roof, is what a mobile crop should be spending.
export const TEAM_HERO_SUBJECT: SubjectBand = {
  left: 235 / 810,
  right: 624 / 810,
  top: 668 / 1440,
  bottom: 960 / 1440,
};

// Measured in Chrome at 375x667, 390x844 and 430x932: the eyebrow, the
// two-line h1, the standfirst and the "Meet the team" link end this far below
// the top of the hero, identically on all three, because none of the type
// changes size or wrapping between them. Re-measure if the hero copy changes.
export const TEAM_HERO_COPY_BLOCK_PX = 355;

// The mobile bottom navigation is fixed over the hero and measured 68px tall on
// all three phones. It is opaque, so anything under it is simply not on screen —
// the figures' feet have to clear it, not merely fit the hero box.
export const TEAM_HERO_BOTTOM_NAV_PX = 68;

// Scaling about the TOP edge, not the middle: the figures stand mid-frame with
// a third of the film as empty pavement beneath them, so cropping from the
// bottom is what pushes them down clear of the copy while keeping the roof.
// A full-height hero is what makes the three constraints — below the copy,
// above the nav, still large enough to read — simultaneously satisfiable on a
// 667px phone, where they otherwise contradict each other.
export const TEAM_HERO_FRAMING: { mobile: HeroFraming } = {
  mobile: {
    minHeightSvh: 100,
    // The hero starts below the 56px header, so a plain 100svh box would end
    // 56px past the bottom of the screen and hide the figures' feet there.
    headerOffsetPx: 56,
    scale: 1.285,
    originX: 0.5,
    originY: 0,
  },
};

/** The hero box as it actually lands on screen, header and all. */
export function getHeroBox(
  viewport: Size,
  framing: HeroFraming = TEAM_HERO_FRAMING.mobile,
): Size {
  return {
    width: viewport.width,
    height:
      (framing.minHeightSvh / 100) * viewport.height - framing.headerOffsetPx,
  };
}

// object-cover scales the film until it covers the box, so the larger of the
// two ratios wins and the other axis is what gets cropped.
function coverScale(source: Size, container: Size): number {
  return Math.max(
    container.width / source.width,
    container.height / source.height,
  );
}

// Where the displayed film sits inside the element box before any transform.
function coverOffset(source: Size, container: Size) {
  const scale = coverScale(source, container);
  return {
    x: (container.width - source.width * scale) / 2,
    y: (container.height - source.height * scale) / 2,
    scale,
  };
}

/**
 * The slice of the source film a viewer can actually see, as fractions of the
 * source. A CSS `scale` about a transform-origin moves the element under a
 * fixed clipping box, so the visible slice is the box mapped back through both
 * the transform and object-cover.
 */
export function getVisibleSourceWindow({
  source,
  container,
  framing,
}: {
  source: Size;
  container: Size;
  framing: HeroFraming;
}): SubjectBand {
  const { x: offsetX, y: offsetY, scale } = coverOffset(source, container);
  const originPx = {
    x: framing.originX * container.width,
    y: framing.originY * container.height,
  };

  const unproject = (screen: number, origin: number) =>
    origin + (screen - origin) / framing.scale;

  const elementLeft = unproject(0, originPx.x);
  const elementRight = unproject(container.width, originPx.x);
  const elementTop = unproject(0, originPx.y);
  const elementBottom = unproject(container.height, originPx.y);

  return {
    left: (elementLeft - offsetX) / scale / source.width,
    right: (elementRight - offsetX) / scale / source.width,
    top: (elementTop - offsetY) / scale / source.height,
    bottom: (elementBottom - offsetY) / scale / source.height,
  };
}

/**
 * Where the subject lands on screen, in pixels relative to the top of the hero
 * box — so a caller can ask both "is it cropped?" and "is it big enough?".
 */
export function getSubjectScreenBox({
  source,
  container,
  framing,
  subject,
}: {
  source: Size;
  container: Size;
  framing: HeroFraming;
  subject: SubjectBand;
}): { top: number; bottom: number; height: number } {
  const { y: offsetY, scale } = coverOffset(source, container);
  const originY = framing.originY * container.height;

  const project = (fraction: number) => {
    const element = offsetY + fraction * source.height * scale;
    return originY + (element - originY) * framing.scale;
  };

  const top = project(subject.top);
  const bottom = project(subject.bottom);

  return { top, bottom, height: bottom - top };
}

const TEAM_PORTRAITS: Record<TeamMemberName, TeamPortrait> = {
  "Nitesh Bheda": {
    src: "/images/team/nitesh-bheda-headshot-clay.jpg",
  },
  "Andrew Crump": {
    src: "/images/team/andrew-crump-headshot-clay.jpg",
  },
  "Vicki Glashier": {
    src: "/images/team/vicki-glashier-headshot-source-clay.jpg",
  },
  "Kay Stanley": {
    src: "/images/team/kay-stanley-headshot-source-clay.jpg",
  },
};

export function getTeamPortrait(name: TeamMemberName): TeamPortrait {
  return TEAM_PORTRAITS[name];
}

export function shouldRenderTeamHeroVideo(prefersReducedMotion: boolean): boolean {
  return !prefersReducedMotion;
}
