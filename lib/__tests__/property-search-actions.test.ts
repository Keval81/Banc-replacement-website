import assert from "node:assert/strict";
import test from "node:test";

import {
  searchThenClose,
  submitPropertyLocation,
} from "../property-search/search-ui-actions.ts";

test("submits the trimmed location with the callback refreshed by flush", () => {
  const events: string[] = [];
  let oldSearches = 0;
  let newSearches = 0;
  let latestSearch = () => {
    oldSearches += 1;
  };
  let latestReads = 0;

  const submitted = submitPropertyLocation({
    isLoading: false,
    locationInput: "  Cuffley  ",
    flush: (commit) => {
      events.push("flush:start");
      commit();
      latestSearch = () => {
        events.push("search:new");
        newSearches += 1;
      };
      events.push("flush:end");
    },
    commitLocation: (location) => events.push(`commit:${location}`),
    getLatestSearch: () => {
      latestReads += 1;
      return latestSearch;
    },
  });

  assert.equal(submitted, true);
  assert.deepEqual(events, ["flush:start", "commit:Cuffley", "flush:end", "search:new"]);
  assert.equal(oldSearches, 0);
  assert.equal(newSearches, 1);
  assert.equal(latestReads, 1);
});

test("submits blank locations as undefined and searches once", () => {
  const committed: Array<string | undefined> = [];
  let searches = 0;

  const submitted = submitPropertyLocation({
    isLoading: false,
    locationInput: "   ",
    flush: (commit) => commit(),
    commitLocation: (location) => committed.push(location),
    getLatestSearch: () => () => {
      searches += 1;
    },
  });

  assert.equal(submitted, true);
  assert.deepEqual(committed, [undefined]);
  assert.equal(searches, 1);
});

test("skips location submission while loading", () => {
  let effects = 0;

  const submitted = submitPropertyLocation({
    isLoading: true,
    locationInput: "Cuffley",
    flush: () => {
      effects += 1;
    },
    commitLocation: () => {
      effects += 1;
    },
    getLatestSearch: () => () => {
      effects += 1;
    },
  });

  assert.equal(submitted, false);
  assert.equal(effects, 0);
});

test("searches once before closing mobile results", () => {
  const events: string[] = [];

  searchThenClose(
    () => events.push("search"),
    () => events.push("close"),
  );

  assert.deepEqual(events, ["search", "close"]);
});
