import assert from "node:assert/strict";
import test from "node:test";

import {
  TEAM_HERO_BOTTOM_NAV_PX,
  TEAM_HERO_COPY_BLOCK_PX,
  TEAM_HERO_FRAMING,
  TEAM_HERO_SOURCE,
  TEAM_HERO_SUBJECT,
  getHeroBox,
  getSubjectScreenBox,
  getVisibleSourceWindow,
} from "../team-media.ts";

// Phones the site actually sees, smallest first. 88svh of each is the hero box.
const PHONES = [
  { name: "iPhone SE / mini", width: 375, height: 667 },
  { name: "iPhone 14", width: 390, height: 844 },
  { name: "iPhone 14 Pro Max", width: 430, height: 932 },
] as const;

// The figures must begin below the copy block, not behind it — this is the
// "the header covers the characters" complaint, and the copy is what does it.

// Below this the four figures read as specks, which is why the 1.28 zoom was
// added in the first place. The fix has to satisfy both ends, not trade one
// for the other.
const MIN_SUBJECT_HEIGHT_PX = 170;

function heroBox(phone: { width: number; height: number }) {
  return getHeroBox({ width: phone.width, height: phone.height });
}

test("keeps all four clay figures inside the mobile hero on every phone", () => {
  for (const phone of PHONES) {
    const window = getVisibleSourceWindow({
      source: TEAM_HERO_SOURCE.portrait,
      container: heroBox(phone),
      framing: TEAM_HERO_FRAMING.mobile,
    });

    assert.ok(
      window.left <= TEAM_HERO_SUBJECT.left &&
        window.right >= TEAM_HERO_SUBJECT.right,
      `${phone.name}: figures cropped horizontally — window ${window.left.toFixed(3)}–${window.right.toFixed(3)}, figures ${TEAM_HERO_SUBJECT.left.toFixed(3)}–${TEAM_HERO_SUBJECT.right.toFixed(3)}`,
    );
    assert.ok(
      window.top <= TEAM_HERO_SUBJECT.top &&
        window.bottom >= TEAM_HERO_SUBJECT.bottom,
      `${phone.name}: figures cropped vertically — window ${window.top.toFixed(3)}–${window.bottom.toFixed(3)}, figures ${TEAM_HERO_SUBJECT.top.toFixed(3)}–${TEAM_HERO_SUBJECT.bottom.toFixed(3)}`,
    );
  }
});

test("keeps the clay figures large enough to read on every phone", () => {
  for (const phone of PHONES) {
    const box = getSubjectScreenBox({
      source: TEAM_HERO_SOURCE.portrait,
      container: heroBox(phone),
      framing: TEAM_HERO_FRAMING.mobile,
      subject: TEAM_HERO_SUBJECT,
    });

    assert.ok(
      box.height >= MIN_SUBJECT_HEIGHT_PX,
      `${phone.name}: figures render ${box.height.toFixed(0)}px tall, below the ${MIN_SUBJECT_HEIGHT_PX}px floor`,
    );
  }
});

test("drops the clay figures below the hero copy on every phone", () => {
  for (const phone of PHONES) {
    const hero = heroBox(phone);
    const box = getSubjectScreenBox({
      source: TEAM_HERO_SOURCE.portrait,
      container: hero,
      framing: TEAM_HERO_FRAMING.mobile,
      subject: TEAM_HERO_SUBJECT,
    });

    assert.ok(
      box.top >= TEAM_HERO_COPY_BLOCK_PX,
      `${phone.name}: figures start ${box.top.toFixed(0)}px into the hero, behind the copy block that ends at ${TEAM_HERO_COPY_BLOCK_PX}px`,
    );
  }
});

test("keeps the clay figures above the fixed mobile bottom navigation", () => {
  for (const phone of PHONES) {
    const hero = heroBox(phone);
    const box = getSubjectScreenBox({
      source: TEAM_HERO_SOURCE.portrait,
      container: hero,
      framing: TEAM_HERO_FRAMING.mobile,
      subject: TEAM_HERO_SUBJECT,
    });
    const floor = hero.height - TEAM_HERO_BOTTOM_NAV_PX;

    assert.ok(
      box.bottom <= floor,
      `${phone.name}: figures run ${(box.bottom - floor).toFixed(0)}px under the bottom navigation`,
    );
  }
});
