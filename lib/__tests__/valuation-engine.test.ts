import assert from "node:assert/strict";
import test from "node:test";

import { estimateHome, indexPrice, type HpiSeries, type Sale } from "../valuation/engine.ts";

// A flat-then-rising index: 100 through 2020, then +1 a month to 2026-08.
const series = (): HpiSeries => {
  const months: HpiSeries = {};
  for (let y = 2010; y <= 2026; y++) {
    for (let m = 1; m <= 12; m++) {
      const key = `${y}-${String(m).padStart(2, "0")}`;
      if (key > "2026-08") break;
      const i = y < 2021 ? 100 : 100 + (y - 2021) * 12 + m;
      months[key] = { detached: i, "semi-detached": i, terraced: i, flat: i, all: i };
    }
  }
  return months;
};
const HPI = { BROXBOURNE: series(), HERTSMERE: series() };
const AS_OF = new Date("2026-11-07T00:00:00Z");

const sale = (over: Partial<Sale>): Sale => ({
  price: 500_000,
  date: "2026-01-15",
  paon: "1",
  saon: "",
  street: "LONGFIELD LANE",
  postcode: "EN7 6AB",
  type: "terraced",
  standard: true,
  newBuild: false,
  district: "BROXBOURNE",
  ...over,
});

const comps = (n: number, over: Partial<Sale> = {}) =>
  Array.from({ length: n }, (_, i) => sale({ paon: String(100 + i), price: 400_000 + i * 2_000, ...over }));

test("brings an old price up to today with the index for its type", () => {
  // 2020 at 100 → 2026-08 at 100 + 5*12 + 8 = 168
  assert.equal(indexPrice(200_000, "2020-06-01", "2026-08", "terraced", series()), 336_000);
  assert.equal(indexPrice(200_000, "2005-06-01", "2026-08", "terraced", series()), null);
});

test("uses this exact home's last sale, matched on number and postcode, brought up to today", () => {
  const history = [sale({ paon: "1", price: 250_000, date: "2020-03-01" }), sale({ paon: "3", price: 900_000, date: "2025-01-01" })];
  const e = estimateHome({
    home: { paon: "1", saon: "", postcode: "EN7 6AB", type: "terraced", majorWork: false },
    history,
    comps: comps(10, { price: 420_000 }),
    hpi: HPI,
    homeDistrict: "BROXBOURNE",
    asOf: AS_OF,
    indexMonth: "2026-08",
  });
  assert.ok(e);
  assert.equal(e.ownSale?.price, 250_000);
  assert.equal(e.ownSale?.indexed, 420_000);
});

test("never prices a house off other property types", () => {
  const e = estimateHome({
    home: { paon: "9", saon: "", postcode: "EN7 6AB", type: "detached", majorWork: false },
    history: [],
    comps: comps(12, { type: "flat" }),
    hpi: HPI,
    homeDistrict: "BROXBOURNE",
    asOf: AS_OF,
    indexMonth: "2026-08",
  });
  assert.equal(e, null);
});

test("leaves out repossessions, company sales and new-builds", () => {
  const e = estimateHome({
    home: { paon: "9", saon: "", postcode: "EN7 6AB", type: "terraced", majorWork: false },
    history: [],
    comps: [...comps(6, { price: 400_000 }), ...comps(5, { price: 2_000_000, standard: false }), ...comps(5, { price: 2_000_000, newBuild: true })],
    hpi: HPI,
    homeDistrict: "BROXBOURNE",
    asOf: AS_OF,
    indexMonth: "2026-08",
  });
  assert.ok(e);
  assert.equal(e.comparableCount, 6);
  assert.ok(e.figure < 500_000);
});

test("ignores sales after the valuation date, so a back-test can't peek", () => {
  const e = estimateHome({
    home: { paon: "1", saon: "", postcode: "EN7 6AB", type: "terraced", majorWork: false },
    history: [sale({ paon: "1", price: 999_000, date: "2026-12-01" })],
    comps: [...comps(8), ...comps(8, { date: "2027-01-01", price: 2_000_000 })],
    hpi: HPI,
    homeDistrict: "BROXBOURNE",
    asOf: AS_OF,
    indexMonth: "2026-08",
  });
  assert.ok(e);
  assert.equal(e.ownSale, null);
  assert.equal(e.comparableCount, 8);
});

test("high confidence when a recent own sale and plenty of comparables agree", () => {
  const e = estimateHome({
    home: { paon: "1", saon: "", postcode: "EN7 6AB", type: "terraced", majorWork: false },
    history: [sale({ paon: "1", price: 250_000, date: "2020-03-01" })],
    comps: comps(10, { price: 415_000 }),
    hpi: HPI,
    homeDistrict: "BROXBOURNE",
    asOf: AS_OF,
    indexMonth: "2026-08",
  });
  assert.ok(e);
  assert.equal(e.confidence, "high");
  assert.ok(e.low < e.figure && e.figure < e.high);
  assert.equal(e.figure % 5000, 0);
});

test("low confidence when the owner has extended or refurbished since buying", () => {
  const e = estimateHome({
    home: { paon: "1", saon: "", postcode: "EN7 6AB", type: "terraced", majorWork: true },
    history: [sale({ paon: "1", price: 250_000, date: "2020-03-01" })],
    comps: comps(10, { price: 415_000 }),
    hpi: HPI,
    homeDistrict: "BROXBOURNE",
    asOf: AS_OF,
    indexMonth: "2026-08",
  });
  assert.equal(e?.confidence, "low");
});

test("low confidence when own sale and comparables disagree by more than 15%", () => {
  const e = estimateHome({
    home: { paon: "1", saon: "", postcode: "EN7 6AB", type: "terraced", majorWork: false },
    history: [sale({ paon: "1", price: 250_000, date: "2020-03-01" })],
    comps: comps(10, { price: 600_000 }),
    hpi: HPI,
    homeDistrict: "BROXBOURNE",
    asOf: AS_OF,
    indexMonth: "2026-08",
  });
  assert.equal(e?.confidence, "low");
});

test("no estimate at all with no own sale and fewer than 3 comparables", () => {
  const e = estimateHome({
    home: { paon: "9", saon: "", postcode: "EN7 6AB", type: "terraced", majorWork: false },
    history: [],
    comps: comps(2),
    hpi: HPI,
    homeDistrict: "BROXBOURNE",
    asOf: AS_OF,
    indexMonth: "2026-08",
  });
  assert.equal(e, null);
});

test("prefers comparables in the same postcode and street over the wider sector", () => {
  const near = comps(4, { postcode: "EN7 6AB", street: "LONGFIELD LANE", price: 400_000 });
  const far = comps(12, { postcode: "EN7 6ZZ", street: "OTHER ROAD", price: 600_000 });
  const e = estimateHome({
    home: { paon: "9", saon: "", postcode: "EN7 6AB", type: "terraced", majorWork: false },
    history: [],
    comps: [...near, ...far],
    hpi: HPI,
    homeDistrict: "BROXBOURNE",
    asOf: AS_OF,
    indexMonth: "2026-08",
  });
  assert.ok(e);
  assert.ok(e.figure < 560_000, `figure ${e.figure} should lean to the same-street sales`);
  assert.equal(e.comparables[0]!.postcode, "EN7 6AB");
});
