import assert from "node:assert/strict";
import test from "node:test";

import { geocodeSearchLocation } from "../property-search/geocode.ts";

function stubFetch(routes: Record<string, unknown>, calls: string[] = []) {
  const impl = async (input: RequestInfo | URL) => {
    const url = String(input);
    calls.push(url);
    const body = routes[Object.keys(routes).find((key) => url.includes(key)) ?? ""];
    if (body === undefined) return new Response("", { status: 404 });
    return new Response(JSON.stringify(body), { status: 200 });
  };
  return impl as unknown as typeof fetch;
}

test("resolves a full postcode through the postcodes endpoint", async () => {
  const calls: string[] = [];
  const point = await geocodeSearchLocation("EN6 4ES", {
    fetchImpl: stubFetch({ "/postcodes/": { result: { latitude: 51.71, longitude: -0.108 } } }, calls),
  });
  assert.deepEqual(point, { latitude: 51.71, longitude: -0.108 });
  assert.match(calls[0], /\/postcodes\/EN6%204ES$/);
});

test("resolves a bare outcode through the outcodes endpoint", async () => {
  const calls: string[] = [];
  const point = await geocodeSearchLocation("en6", {
    fetchImpl: stubFetch({ "/outcodes/": { result: { latitude: 51.7, longitude: -0.11 } } }, calls),
  });
  assert.deepEqual(point, { latitude: 51.7, longitude: -0.11 });
  assert.match(calls[0], /\/outcodes\/EN6$/);
});

test("resolves a place name through the places endpoint", async () => {
  const calls: string[] = [];
  const point = await geocodeSearchLocation("Cuffley", {
    fetchImpl: stubFetch({ "/places": { result: [{ latitude: 51.707, longitude: -0.1138 }] } }, calls),
  });
  assert.deepEqual(point, { latitude: 51.707, longitude: -0.1138 });
  assert.match(calls[0], /\/places\?q=Cuffley&limit=1$/);
});

test("returns null rather than throwing when the lookup fails", async () => {
  // A geocode failure must degrade the search to text matching, never break it.
  assert.equal(await geocodeSearchLocation("Nowhere", { fetchImpl: stubFetch({}) }), null);
  assert.equal(
    await geocodeSearchLocation("Cuffley", { fetchImpl: stubFetch({ "/places": { result: [] } }) }),
    null,
  );
  assert.equal(
    await geocodeSearchLocation("boom", {
      fetchImpl: async () => { throw new Error("network down"); },
    }),
    null,
  );
});

test("ignores a blank location and coordinates that are not finite numbers", async () => {
  assert.equal(await geocodeSearchLocation("   ", { fetchImpl: stubFetch({}) }), null);
  assert.equal(
    await geocodeSearchLocation("EN6 4ES", {
      fetchImpl: stubFetch({ "/postcodes/": { result: { latitude: null, longitude: -0.1 } } }),
    }),
    null,
  );
});
