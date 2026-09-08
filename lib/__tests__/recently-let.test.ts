import assert from "node:assert/strict";
import test from "node:test";

import { RECENTLY_LET_LIMIT, selectRecentlyLet } from "../recently-let.ts";

const row = (over: Record<string, unknown> = {}) => ({
  source_id: "BPGC881",
  title: "Station Road, Cuffley",
  address: "10a Station Road, Cuffley, Hertfordshire",
  price: 895,
  bedrooms: 1,
  bathrooms: 1,
  images: ["https://med05.expertagent.co.uk/in4glestates/main/a.jpg"],
  source_updated_at: "2025-10-20T09:00:39+00:00",
  ...over,
});

test("shows the most recently updated lettings first", () => {
  const picked = selectRecentlyLet([
    row({ source_id: "older", source_updated_at: "2024-01-01T00:00:00+00:00" }),
    row({ source_id: "newer", source_updated_at: "2026-05-01T00:00:00+00:00" }),
  ]);

  assert.deepEqual(picked.map((p) => p.id), ["newer", "older"]);
});

test("caps the strip at fifteen so the page stays a lettings page", () => {
  const many = Array.from({ length: 40 }, (_, index) =>
    row({ source_id: `p${index}`, source_updated_at: `2026-01-${String((index % 28) + 1).padStart(2, "0")}T00:00:00+00:00` }),
  );

  assert.equal(selectRecentlyLet(many).length, RECENTLY_LET_LIMIT);
  assert.equal(RECENTLY_LET_LIMIT, 15);
});

test("skips anything with no photograph — a blank card is worse than a shorter strip", () => {
  const picked = selectRecentlyLet([row({ source_id: "no-photo", images: [] }), row({ source_id: "ok" })]);

  assert.deepEqual(picked.map((p) => p.id), ["ok"]);
});

test("a row with no update date sorts last rather than being dropped", () => {
  const picked = selectRecentlyLet([
    row({ source_id: "undated", source_updated_at: null }),
    row({ source_id: "dated", source_updated_at: "2020-01-01T00:00:00+00:00" }),
  ]);

  assert.deepEqual(picked.map((p) => p.id), ["dated", "undated"]);
});

test("presents the rent the way the lettings cards do, and marks it let agreed", () => {
  const [card] = selectRecentlyLet([row()]);

  assert.equal(card.price, "£895 pcm");
  assert.equal(card.status, "let_agreed");
  assert.equal(card.department, "lettings");
  assert.equal(card.stats.beds, 1);
});

test("photographs come through the site's safe image path, so they load over https", () => {
  const [card] = selectRecentlyLet([
    row({ images: ["http://med05.expertagent.co.uk/in4glestates/{abc}/main/a.jpg"] }),
  ]);

  assert.equal(
    card.images[0],
    "https://med05.expertagent.co.uk/in4glestates/%7Babc%7D/main/a.jpg",
  );
});

test("a row whose only photograph is not a usable image URL is left out", () => {
  const picked = selectRecentlyLet([
    row({ source_id: "javascript", images: ["javascript:alert(1)"] }),
    row({ source_id: "ok" }),
  ]);

  assert.deepEqual(picked.map((p) => p.id), ["ok"]);
});
