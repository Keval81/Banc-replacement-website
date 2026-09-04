export type TeamMemberName =
  | "Nitesh Bheda"
  | "Andrew Crump"
  | "Vicki Glashier"
  | "Kay Stanley";

export interface TeamPortrait {
  src: string;
}

const TEAM_PORTRAITS: Record<TeamMemberName, TeamPortrait> = {
  "Nitesh Bheda": {
    src: "/images/team/nitesh-bheda-clay.jpg",
  },
  "Andrew Crump": {
    src: "/images/team/andrew-crump-clay.jpg",
  },
  "Vicki Glashier": {
    src: "/images/team/vicki-glashier-clay.jpg",
  },
  "Kay Stanley": {
    src: "/images/team/kay-stanley-clay.jpg",
  },
};

export function getTeamPortrait(name: TeamMemberName): TeamPortrait {
  return TEAM_PORTRAITS[name];
}
