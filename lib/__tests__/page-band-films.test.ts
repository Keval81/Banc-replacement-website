import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { OWNED_FILMS } from "../owned-film.ts";

const root = join(import.meta.dirname, "..", "..");
const read = (file: string) => readFileSync(join(root, file), "utf8");

test("the terrace film ships with a poster and stays light enough for a phone", () => {
  for (const film of [OWNED_FILMS.premierTerrace]) {
    const video = join(root, "public", film.src);
    assert.ok(existsSync(video), `${film.src} exists`);
    assert.ok(existsSync(join(root, "public", film.poster)), `${film.poster} exists`);
    assert.ok(statSync(video).size < 2.5 * 1024 * 1024, `${film.src} is under 2.5MB`);
    assert.ok(film.focus, "says where the subject sits, so a portrait crop keeps the people in frame");
  }
});

test("Premier Homes opens on the terrace film", () => {
  assert.match(read("app/premier-homes/page.tsx"), /film=\{OWNED_FILMS\.premierTerrace\}/);
});

test("the landing film ends on the terrace and kitchen shots, on desktop and phone", () => {
  const landing = read("lib/landing-ui.ts");
  assert.match(landing, /src: "\/videos\/hero-properties-life\.mp4"/);
  assert.match(landing, /src: "\/videos\/hero-properties-life-mobile\.mp4"/);
  for (const file of ["hero-properties-life.mp4", "hero-properties-life-mobile.mp4", "hero-properties-life-poster.jpg"]) {
    assert.ok(existsSync(join(root, "public", "videos", file)), file);
  }
  // Phones download this on first load: keep it close to the film it replaces (3.7MB).
  assert.ok(statSync(join(root, "public", "videos", "hero-properties-life-mobile.mp4")).size < 5 * 1024 * 1024);
});

test("a film opener uses the ambient player, so it never shows a play button", () => {
  const band = read("components/PageBand.tsx");
  assert.match(band, /<AmbientVideo/);
  assert.match(read("components/AmbientVideo.tsx"), /objectPosition: film\.focus/);
});
