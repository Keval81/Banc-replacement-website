import assert from "node:assert/strict";
import test from "node:test";

import fs from "node:fs";
import path from "node:path";

import {
  TEAM_HERO_BOTTOM_NAV_PX,
  TEAM_HERO_COPY_BLOCK_PX,
  TEAM_HERO_MOBILE_FRAMING_STEPS,
  TEAM_HERO_SOURCE,
  TEAM_HERO_SUBJECT,
  getHeroBox,
  getMobileFraming,
  getSubjectScreenBox,
  getVisibleSourceWindow,
} from "../team-media.ts";

// Phones the site actually sees, smallest first. 100svh minus the header is
// the hero box.
const PHONES = [
  { name: "iPhone SE / mini", width: 375, height: 667 },
  { name: "iPhone 8 Plus", width: 414, height: 736 },
  { name: "iPhone 13 mini", width: 375, height: 812 },
  { name: "iPhone 14", width: 390, height: 844 },
  { name: "iPhone 14 Pro", width: 393, height: 852 },
  { name: "iPhone XR / 11", width: 414, height: 896 },
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
      framing: getMobileFraming(phone),
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
    const hero = heroBox(phone);
    const box = getSubjectScreenBox({
      source: TEAM_HERO_SOURCE.portrait,
      container: hero,
      framing: getMobileFraming(phone),
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
      framing: getMobileFraming(phone),
      subject: TEAM_HERO_SUBJECT,
    });
    const floor = hero.height - TEAM_HERO_BOTTOM_NAV_PX;

    assert.ok(
      box.bottom <= floor,
      `${phone.name}: figures run ${(box.bottom - floor).toFixed(0)}px under the bottom navigation`,
    );
  }
});

test("zooms the still only as far as the copy block forces, and not at all on tall phones", () => {
  // Keval on an iPhone 14: the 1.285 zoom read as "too zoomed in". The copy
  // block only forces a zoom on short phones, so tall ones get (almost) none.
  assert.equal(getMobileFraming({ width: 375, height: 667 }).scale, 1.285);
  assert.ok(getMobileFraming({ width: 390, height: 844 }).scale <= 1.1);
  assert.equal(getMobileFraming({ width: 430, height: 932 }).scale, 1);
  for (let i = 1; i < TEAM_HERO_MOBILE_FRAMING_STEPS.length; i++) {
    assert.ok(
      TEAM_HERO_MOBILE_FRAMING_STEPS[i].scale < TEAM_HERO_MOBILE_FRAMING_STEPS[i - 1].scale,
      "steps must zoom less as phones get taller",
    );
  }
});

test("ships the mobile framing steps in the server-rendered stylesheet, not a client-injected style tag", () => {
  const css = fs.readFileSync(
    path.join(process.cwd(), "components/team/TeamHeroMedia.module.css"),
    "utf8",
  );
  for (const step of TEAM_HERO_MOBILE_FRAMING_STEPS) {
    assert.ok(css.includes(`(max-height: ${step.maxViewportHeight}px)`), `css lacks the ${step.maxViewportHeight}px step`);
    assert.ok(css.includes(`scale(${step.scale})`), `css lacks scale(${step.scale})`);
  }
  assert.ok(css.includes("banc-team-clay-portrait.jpg"), "phones keep the portrait still");
  assert.ok(css.includes("banc-team-clay.jpg"), "wider screens get the landscape still under the film");
});
