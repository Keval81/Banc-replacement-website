import assert from "node:assert/strict";
import test from "node:test";

import { getFilterCtaState } from "../property-search/filter-cta.ts";

test("a known count reads as the number of results you will see", () => {
  assert.deepEqual(getFilterCtaState({ isLoading: false, resultCount: 61 }), {
    label: "Show 61 results",
    disabled: false,
    tone: "primary",
  });
});

test("one match is singular", () => {
  assert.equal(getFilterCtaState({ isLoading: false, resultCount: 1 }).label, "Show 1 result");
});

test("recounting keeps the last number and stays tappable, so a tap is never swallowed", () => {
  const state = getFilterCtaState({ isLoading: true, resultCount: undefined, lastKnownCount: 34 });

  assert.equal(state.label, "Show 34 results");
  assert.equal(state.disabled, false);
});

test("recounting before any count is known still offers the search", () => {
  const state = getFilterCtaState({ isLoading: true, resultCount: undefined });

  assert.equal(state.label, "Show results");
  assert.equal(state.disabled, false);
});

test("no matches says so instead of offering zero results", () => {
  assert.deepEqual(getFilterCtaState({ isLoading: false, resultCount: 0 }), {
    label: "No matches — change a filter",
    disabled: false,
    tone: "muted",
  });
});

test("a fresh count always wins over the remembered one", () => {
  assert.equal(
    getFilterCtaState({ isLoading: false, resultCount: 7, lastKnownCount: 34 }).label,
    "Show 7 results",
  );
});
