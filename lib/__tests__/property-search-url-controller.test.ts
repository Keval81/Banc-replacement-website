import assert from "node:assert/strict";
import test from "node:test";

import { createPropertySearchUrlController } from "../property-search/url-controller.ts";
import { createDefaultPropertySearchQuery } from "../property-search/query.ts";

function createHarness() {
  let nextTimer = 1;
  const timers = new Map<number, () => void>();
  const replacements: string[] = [];
  const controller = createPropertySearchUrlController(
    createDefaultPropertySearchQuery("sales"),
    {
      replace: (href) => replacements.push(href),
      schedule: (callback) => {
        const id = nextTimer++;
        timers.set(id, callback);
        return id;
      },
      cancel: (id) => timers.delete(id),
      debounceMs: 300,
    },
  );

  return {
    controller,
    replacements,
    runTimers() {
      const callbacks = [...timers.values()];
      timers.clear();
      callbacks.forEach((callback) => callback());
    },
  };
}

test("a delayed self-authored URL acknowledgement cannot erase a newer draft", () => {
  const { controller, replacements, runTimers } = createHarness();

  controller.patchFilters({ location: "Cuffley" });
  runTimers();
  const acknowledged = {
    ...createDefaultPropertySearchQuery("sales"),
    location: "Cuffley",
  };
  controller.patchFilters({ minBedrooms: 3 });
  controller.acceptUrl(acknowledged);

  assert.equal(controller.getSnapshot().query.location, "Cuffley");
  assert.equal(controller.getSnapshot().draftQuery.location, "Cuffley");
  assert.equal(controller.getSnapshot().draftQuery.minBedrooms, 3);

  runTimers();
  assert.deepEqual(replacements, [
    "/sales/properties?location=Cuffley",
    "/sales/properties?location=Cuffley&minBedrooms=3",
  ]);
});

test("pagination preserves pending filters and cancels their delayed duplicate", () => {
  const { controller, replacements, runTimers } = createHarness();

  controller.patchFilters({ location: "Potters Bar" });
  controller.setPage(2);
  runTimers();

  assert.deepEqual(replacements, [
    "/sales/properties?location=Potters+Bar&page=2",
  ]);
  assert.equal(controller.getSnapshot().draftQuery.location, "Potters Bar");
  assert.equal(controller.getSnapshot().draftQuery.page, 2);
});

test("immediate submit cancels debounce and navigates exactly once", () => {
  const { controller, replacements, runTimers } = createHarness();

  controller.patchFilters({ minBathrooms: 2 });
  controller.submit();
  runTimers();

  assert.deepEqual(replacements, ["/sales/properties?minBathrooms=2"]);
});

test("external back or forward navigation replaces the committed query and draft", () => {
  const { controller, replacements, runTimers } = createHarness();
  const external = {
    ...createDefaultPropertySearchQuery("sales"),
    location: "Mayfair",
    page: 2,
  };

  controller.patchFilters({ location: "Cuffley" });
  controller.acceptUrl(external);
  runTimers();

  assert.deepEqual(controller.getSnapshot(), {
    query: external,
    draftQuery: external,
  });
  assert.deepEqual(replacements, []);
});
