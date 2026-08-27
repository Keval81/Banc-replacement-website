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
    getLocationInput: () => "  Cuffley  ",
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
    getLocationInput: () => "   ",
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
    getLocationInput: () => "Cuffley",
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

test("immediate click and Enter submission read the latest input event value", () => {
  const pathways = [
    { name: "click", trigger: (submit: () => boolean) => submit() },
    { name: "Enter", trigger: (submit: () => boolean) => submit() },
  ] as const;

  for (const pathway of pathways) {
    const latestInput = { current: "Potters Bar" };
    const committed: Array<string | undefined> = [];
    let searches = 0;
    const onChange = (value: string) => {
      latestInput.current = value;
    };
    const submit = () => submitPropertyLocation({
      isLoading: false,
      getLocationInput: () => latestInput.current,
      flush: (commit) => commit(),
      commitLocation: (location) => committed.push(location),
      getLatestSearch: () => () => {
        searches += 1;
      },
    });

    onChange("Cuffley");
    const submitted = pathway.trigger(submit);

    assert.equal(submitted, true, `${pathway.name} should submit`);
    assert.deepEqual(committed, ["Cuffley"], `${pathway.name} should commit latest input`);
    assert.equal(searches, 1, `${pathway.name} should search once`);
  }
});

test("searches once before closing mobile results", () => {
  const events: string[] = [];

  searchThenClose(
    () => events.push("search"),
    () => events.push("close"),
  );

  assert.deepEqual(events, ["search", "close"]);
});
