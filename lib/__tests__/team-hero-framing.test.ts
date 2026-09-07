import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  TEAM_HERO_BOTTOM_NAV_PX,
  TEAM_HERO_COPY_BLOCK_PX,
  TEAM_HERO_MOBILE_MIN_HEIGHT_PX,
  TEAM_HERO_SOURCE,
  TEAM_HERO_SUBJECT,
  getHeroBox,
  getMobileFraming,
  getSubjectScreenBox,
  getVisibleSourceWindow,
} from "../team-media.ts";

// Layout viewports as Safari actually reports them, not screen sizes: the
// small viewport (URL bar and tab bar showing) is what 100svh and height
// media queries see. An iPhone 14 is 844 tall but lands around 664 here.
const PHONES = [
  { name: "iPhone SE / mini, bars shown", width: 375, height: 548 },
  { name: "iPhone 13 mini, bars shown", width: 375, height: 629 },
  { name: "iPhone 14, bars shown", width: 390, height: 664 },
  { name: "iPhone 14, bars collapsed", width: 390, height: 750 },
  { name: "iPhone 14 Pro Max, bars shown", width: 430, height: 746 },
  { name: "iPhone 14 Pro Max, bars collapsed", width: 430, height: 840 },
] as const;

// Below this the four figures read as specks. 770px of hero on a 390px phone
// renders them 156px tall, which Keval read as "the right size"; 1.285× of
// that read as "too zoomed in", twice.
const MIN_SUBJECT_HEIGHT_PX = 150;

function heroBox(phone: { width: number; height: number }) {
  return getHeroBox({ width: phone.width, height: phone.height });
}

test("never zooms the film on a phone — the still and the film show at cover scale", () => {
  for (const phone of PHONES) {
    assert.equal(getMobileFraming(phone).scale, 1, phone.name);
  }
});

test("runs the hero taller than a short viewport so the figures still clear the copy", () => {
  assert.equal(TEAM_HERO_MOBILE_MIN_HEIGHT_PX, 770);
  assert.equal(heroBox({ width: 390, height: 664 }).height, 770);
  assert.equal(heroBox({ width: 430, height: 840 }).height, 784);
});

test("keeps all four clay figures inside the mobile hero on every phone", () => {
  for (const phone of PHONES) {
    const window = getVisibleSourceWindow({
      source: TEAM_HERO_SOURCE.portrait,
      container: heroBox(phone),
      framing: getMobileFraming(phone),
    });
    assert.ok(
      window.left <= TEAM_HERO_SUBJECT.left && window.right >= TEAM_HERO_SUBJECT.right,
      `${phone.name}: figures cropped horizontally — window ${window.left.toFixed(3)}–${window.right.toFixed(3)}`,
    );
    assert.ok(
      window.top <= TEAM_HERO_SUBJECT.top && window.bottom >= TEAM_HERO_SUBJECT.bottom,
      `${phone.name}: figures cropped vertically — window ${window.top.toFixed(3)}–${window.bottom.toFixed(3)}`,
    );
  }
});

test("keeps the clay figures large enough to read on every phone", () => {
  for (const phone of PHONES) {
    const box = getSubjectScreenBox({
      source: TEAM_HERO_SOURCE.portrait,
      container: heroBox(phone),
      framing: getMobileFraming(phone),
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
    const box = getSubjectScreenBox({
      source: TEAM_HERO_SOURCE.portrait,
      container: heroBox(phone),
      framing: getMobileFraming(phone),
      subject: TEAM_HERO_SUBJECT,
    });
    assert.ok(
      box.top >= TEAM_HERO_COPY_BLOCK_PX,
      `${phone.name}: figures start ${box.top.toFixed(0)}px into the hero, behind the copy block that ends at ${TEAM_HERO_COPY_BLOCK_PX}px`,
    );
  }
});

test("keeps the figures' feet above the fixed bottom navigation wherever the hero fits the viewport", () => {
  for (const phone of PHONES) {
    const hero = heroBox(phone);
    const visible = phone.height - 56;
    if (visible < hero.height) continue; // a short phone scrolls the tall hero; the heads are what must be on screen
    const box = getSubjectScreenBox({
      source: TEAM_HERO_SOURCE.portrait,
      container: hero,
      framing: getMobileFraming(phone),
      subject: TEAM_HERO_SUBJECT,
    });
    assert.ok(
      box.bottom <= visible - TEAM_HERO_BOTTOM_NAV_PX,
      `${phone.name}: feet at ${box.bottom.toFixed(0)}px sit under the bottom nav`,
    );
  }
});

test("ships the mobile stills in the server-rendered stylesheet and never a transform", () => {
  const css = fs.readFileSync(
    path.join(process.cwd(), "components/team/TeamHeroMedia.module.css"),
    "utf8",
  );
  assert.ok(!css.includes("scale("), "no zoom on phones");
  assert.ok(!css.includes("display: none"), "phones play the film too");
  assert.ok(css.includes("banc-team-clay-portrait.jpg"), "phones keep the portrait still under the film");
  assert.ok(css.includes("banc-team-clay.jpg"), "wider screens get the landscape still under the film");
});
