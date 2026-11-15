import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { OWNED_FILMS } from "../owned-film.ts";

const root = join(import.meta.dirname, "..", "..");
const read = (file: string) => readFileSync(join(root, file), "utf8");

test("the terrace and kitchen films ship with a poster and stay light enough for a phone", () => {
  for (const film of [OWNED_FILMS.premierTerrace, OWNED_FILMS.salesKitchen]) {
    const video = join(root, "public", film.src);
    assert.ok(existsSync(video), `${film.src} exists`);
    assert.ok(existsSync(join(root, "public", film.poster)), `${film.poster} exists`);
    assert.ok(statSync(video).size < 2.5 * 1024 * 1024, `${film.src} is under 2.5MB`);
    assert.ok(film.focus, "says where the subject sits, so a portrait crop keeps the people in frame");
  }
});

test("Premier Homes opens on the terrace film and Sales on the kitchen film", () => {
  assert.match(read("app/premier-homes/page.tsx"), /film=\{OWNED_FILMS\.premierTerrace\}/);
  assert.match(read("app/sales/SalesPageClient.tsx"), /film=\{OWNED_FILMS\.salesKitchen\}/);
  // The Sales opener used to hotlink a stock photo.
  assert.doesNotMatch(read("app/sales/SalesPageClient.tsx"), /images\.unsplash\.com\/photo-1732983989209/);
});

test("a film opener uses the ambient player, so it never shows a play button", () => {
  const band = read("components/PageBand.tsx");
  assert.match(band, /<AmbientVideo/);
  assert.match(read("components/AmbientVideo.tsx"), /objectPosition: film\.focus/);
});
