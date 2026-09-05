"use client";

import { useSyncExternalStore } from "react";
import {
  TEAM_HERO_FRAMING,
  TEAM_HERO_MEDIA,
  shouldRenderTeamHeroVideo,
} from "@/lib/team-media";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void): () => void {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener("change", onChange);

  return () => mediaQuery.removeEventListener("change", onChange);
}

function getReducedMotionPreference(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getServerReducedMotionPreference(): boolean {
  return true;
}

export function TeamHeroMedia() {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionPreference,
    getServerReducedMotionPreference,
  );

  return (
    <div className="absolute inset-0">
      <div
        role="img"
        aria-label="The Banc Property Group team outside the Cuffley office, recreated in clay"
        className="team-hero-frame team-hero-fallback absolute inset-0 bg-cover bg-center"
      />
      {shouldRenderTeamHeroVideo(prefersReducedMotion) && (
        <video
          // The portrait cut is framed wide — the whole two-storey building and a
          // deep apron of pavement — so on a phone the team end up tiny. The
          // mobile framing in lib/team-media.ts scales about the TOP edge, which
          // spends the crop on that empty pavement and drops the figures below
          // the hero copy instead of behind it. From md up the landscape cut
          // plays untouched.
          className="team-hero-frame absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source
            src={TEAM_HERO_MEDIA.portraitVideo}
            type="video/mp4"
            media="(max-width: 767px)"
          />
          <source src={TEAM_HERO_MEDIA.landscapeVideo} type="video/mp4" />
        </video>
      )}
      <style jsx>{`
        .team-hero-fallback {
          background-image: url("${TEAM_HERO_MEDIA.landscapeImage}");
        }

        @media (max-width: 767px) {
          .team-hero-fallback {
            background-image: url("${TEAM_HERO_MEDIA.portraitImage}");
          }

          .team-hero-frame {
            transform-origin: ${TEAM_HERO_FRAMING.mobile.originX * 100}%
              ${TEAM_HERO_FRAMING.mobile.originY * 100}%;
            transform: scale(${TEAM_HERO_FRAMING.mobile.scale});
          }
        }
      `}</style>
    </div>
  );
}
