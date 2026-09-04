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
