import assert from "node:assert/strict";
import test from "node:test";

import { districtVariants, fetchAreaSales, fetchHpiForDistricts, fetchSectorSales, indexMonthAsOf, parseHpiRows, parseSaleRow, regionSlug } from "../valuation/register.ts";

test("turns a register row into a sale, keeping the repossession and new-build flags", () => {
  const sale = parseSaleRow({
    price: { value: "347500" },
    date: { value: "2025-01-10" },
    paon: { value: "1" },
    street: { value: "LONGFIELD LANE" },
    postcode: { value: "EN7 6AB" },
    district: { value: "BROXBOURNE" },
    type: { value: "http://landregistry.data.gov.uk/def/common/terraced" },
    cat: { value: "http://landregistry.data.gov.uk/def/ppi/additionalPricePaidTransaction" },
    nb: { value: "true" },
  });
  assert.deepEqual(sale, {
    price: 347500,
    date: "2025-01-10",
    paon: "1",
    saon: "",
    street: "LONGFIELD LANE",
    postcode: "EN7 6AB",
    type: "terraced",
    standard: false,
    newBuild: true,
    district: "BROXBOURNE",
  });
});

test("drops a row with no price or date rather than inventing one", () => {
  assert.equal(parseSaleRow({ date: { value: "2025-01-10" } }), null);
});

test("names the index region the way the register does", () => {
  assert.equal(regionSlug("WELWYN HATFIELD"), "welwyn-hatfield");
  assert.equal(regionSlug("Broxbourne"), "broxbourne");
});

test("reads the index by month and type", () => {
  const series = parseHpiRows([{ month: { value: "2026-08" }, det: { value: "97.70" }, semi: { value: "100.00" }, ter: { value: "100.50" }, flat: { value: "93.70" }, all: { value: "98.20" } }]);
  assert.deepEqual(series["2026-08"], { detached: 97.7, "semi-detached": 100, terraced: 100.5, flat: 93.7, all: 98.2 });
});

test("uses the latest index month that would have been published by the valuation date", () => {
  const series = { "2026-06": {}, "2026-07": {}, "2026-08": {} } as never;
  assert.equal(indexMonthAsOf(series, new Date("2026-11-07T00:00:00Z")), "2026-08");
  assert.equal(indexMonthAsOf(series, new Date("2026-09-15T00:00:00Z")), "2026-07");
});

test("a sector search matches its postcodes, and an outcode search can't spill into a longer outcode", async () => {
  const sent: string[] = [];
  const fetcher = (async (_url: string, init: RequestInit) => {
    sent.push(decodeURIComponent(String(init.body)));
    return new Response(JSON.stringify({ results: { bindings: [] } }));
  }) as unknown as typeof fetch;
  await fetchSectorSales("EN7 6", "BROXBOURNE", "2021-01-01", fetcher);
  await fetchSectorSales("N1", "ISLINGTON", "2021-01-01", fetcher);
  assert.match(sent[0]!, /STRSTARTS\(STR\(\?postcode\), "EN7 6"\)/);
  assert.match(sent[1]!, /STRSTARTS\(STR\(\?postcode\), "N1 "\)/);
});

test("searches every spelling a council goes by, since postcodes.io and the register name some differently", () => {
  assert.deepEqual(districtVariants("Westminster"), ["WESTMINSTER", "CITY OF WESTMINSTER"]);
  assert.deepEqual(districtVariants("Bristol, City of"), ["BRISTOL, CITY OF", "CITY OF BRISTOL"]);
  assert.deepEqual(districtVariants("Herefordshire, County of"), ["HEREFORDSHIRE, COUNTY OF", "HEREFORDSHIRE"]);
});

test("fetches a sector's sales across all its councils in one query", async () => {
  const sent: string[] = [];
  const fetcher = (async (_url: string, init: RequestInit) => {
    sent.push(decodeURIComponent(String(init.body)));
    return new Response(JSON.stringify({ results: { bindings: [] } }));
  }) as unknown as typeof fetch;
  await fetchAreaSales("SW1A 1", ["Westminster", "Camden"], "2021-01-01", fetcher);
  assert.equal(sent.length, 1);
  assert.match(sent[0]!, /VALUES \?district \{ "WESTMINSTER" "CITY OF WESTMINSTER" "CAMDEN" "CITY OF CAMDEN" \}/);
});

test("waits and retries once when the register says too many requests", async () => {
  let calls = 0;
  const fetcher = (async () => {
    calls += 1;
    return calls === 1 ? new Response("", { status: 429 }) : new Response(JSON.stringify({ results: { bindings: [] } }));
  }) as unknown as typeof fetch;
  assert.deepEqual(await fetchAreaSales("EN6 4", ["Hertsmere"], "2021-01-01", fetcher), []);
  assert.equal(calls, 2);
});

test("reads several councils' price index from one query, filed under every spelling", async () => {
  const fetcher = (async () =>
    new Response(
      JSON.stringify({
        results: {
          bindings: [
            { region: { value: "http://landregistry.data.gov.uk/id/region/city-of-westminster" }, month: { value: "2026-08" }, all: { value: "100" } },
          ],
        },
      }),
    )) as unknown as typeof fetch;
  const hpi = await fetchHpiForDistricts(["Westminster"], fetcher);
  assert.equal(hpi["WESTMINSTER"]?.["2026-08"]?.all, 100);
  assert.equal(hpi["CITY OF WESTMINSTER"]?.["2026-08"]?.all, 100);
});
