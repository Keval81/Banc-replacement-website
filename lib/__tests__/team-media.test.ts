import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  getTeamPortrait,
  shouldRenderTeamHeroVideo,
  TEAM_HERO_MEDIA,
} from "../team-media.ts";

test("maps each Banc team member to a dedicated clay headshot", () => {
  const expectedPortraits = {
    "Nitesh Bheda": "/images/team/nitesh-bheda-headshot-clay.jpg",
    "Andrew Crump": "/images/team/andrew-crump-headshot-clay.jpg",
    "Vicki Glashier": "/images/team/vicki-glashier-headshot-clay.jpg",
    "Kay Stanley": "/images/team/kay-stanley-headshot-clay.jpg",
  } as const;

  for (const [name, src] of Object.entries(expectedPortraits)) {
    assert.deepEqual(getTeamPortrait(name as keyof typeof expectedPortraits), { src });
    assert.ok(
      fs.existsSync(path.join(process.cwd(), "public", src)),
      `missing Team headshot asset: ${src}`,
    );
  }
});

test("ships responsive local hero media for both motion preferences", () => {
  assert.deepEqual(TEAM_HERO_MEDIA, {
    landscapeImage: "/images/team/banc-team-clay.jpg",
    portraitImage: "/images/team/banc-team-clay-portrait.jpg",
    landscapeVideo: "/videos/team/banc-team-clay-landscape.mp4",
    portraitVideo: "/videos/team/banc-team-clay-portrait.mp4",
  });
  assert.equal(shouldRenderTeamHeroVideo(true), false);
  assert.equal(shouldRenderTeamHeroVideo(false), true);

  for (const source of Object.values(TEAM_HERO_MEDIA)) {
    assert.ok(
      fs.existsSync(path.join(process.cwd(), "public", source)),
      `missing Team hero asset: ${source}`,
    );
  }
});
