import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  getTeamPortrait,
  shouldRenderTeamHeroVideo,
  TEAM_HERO_MEDIA,
} from "../team-media.ts";

test("maps each Banc team member to the matching clay portrait", () => {
  assert.deepEqual(getTeamPortrait("Nitesh Bheda"), {
    src: "/images/team/nitesh-bheda-clay.jpg",
  });
  assert.deepEqual(getTeamPortrait("Andrew Crump"), {
    src: "/images/team/andrew-crump-clay.jpg",
  });
  assert.deepEqual(getTeamPortrait("Vicki Glashier"), {
    src: "/images/team/vicki-glashier-clay.jpg",
  });
  assert.deepEqual(getTeamPortrait("Kay Stanley"), {
    src: "/images/team/kay-stanley-clay.jpg",
  });
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
