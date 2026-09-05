import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  OWNED_FILMS,
  SERVICE_FILMS,
  getServiceFilm,
  shouldPlayAmbientVideo,
} from "../owned-film.ts";

const PUBLIC_DIR = join(import.meta.dirname, "..", "..", "public");

test("ships every configured film and poster as a real file in public/", () => {
  for (const [name, film] of Object.entries(OWNED_FILMS)) {
    assert.ok(
      existsSync(join(PUBLIC_DIR, film.src)),
      `${name}: missing video ${film.src}`,
    );
    assert.ok(
      existsSync(join(PUBLIC_DIR, film.poster)),
      `${name}: missing poster ${film.poster}`,
    );
  }
});

test("serves every film from Banc's own footage, never a stock host", () => {
  for (const [name, film] of Object.entries(OWNED_FILMS)) {
    for (const path of [film.src, film.poster]) {
      assert.ok(
        path.startsWith("/"),
        `${name}: ${path} is not a local path — owned footage is the whole point of these clips`,
      );
      assert.doesNotMatch(
        path,
        /unsplash|pexels|shutterstock|gettyimages/i,
        `${name}: ${path} points at a stock library`,
      );
    }
  }
});

test("gives three of the four service cards a film and leaves the fourth a still", () => {
  assert.deepEqual(Object.keys(SERVICE_FILMS).sort(), [
    "/lettings",
    "/premier-homes",
    "/sales",
  ]);

  assert.ok(getServiceFilm("/sales"));
  assert.ok(getServiceFilm("/lettings"));
  assert.ok(getServiceFilm("/premier-homes"));
  assert.equal(getServiceFilm("/lettings/landlords-guide"), undefined);
});

test("ships no film the site does not actually use", () => {
  // The drone moves are candidates for the landing film, not shipped assets.
  // Anything in OWNED_FILMS must be on a card, or it is 8MB a deploy for nothing.
  const used = new Set(Object.values(SERVICE_FILMS).map((film) => film.src));
  for (const [name, film] of Object.entries(OWNED_FILMS)) {
    assert.ok(used.has(film.src), `${name} is configured but nothing renders it`);
  }
});

test("holds the poster until the card is on screen and motion is allowed", () => {
  assert.equal(shouldPlayAmbientVideo({ prefersReducedMotion: false, inView: true }), true);
  assert.equal(shouldPlayAmbientVideo({ prefersReducedMotion: false, inView: false }), false);
  assert.equal(shouldPlayAmbientVideo({ prefersReducedMotion: true, inView: true }), false);
  assert.equal(shouldPlayAmbientVideo({ prefersReducedMotion: true, inView: false }), false);
});
