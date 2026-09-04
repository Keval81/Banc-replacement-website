import assert from "node:assert/strict";
import test from "node:test";

import { getTeamPortrait } from "../team-media.ts";

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
