import assert from "node:assert/strict";
import test from "node:test";

import type { Sale } from "../valuation/engine.ts";
import { addressesFromHistory, describeBasis, headlineFor, homeSaleNote, houseNumberFrom, runInstantValuation, type InstantEstimate } from "../valuation/instant.ts";

const estimate = (over: Partial<InstantEstimate> = {}): InstantEstimate => ({
  figure: 650_000,
  low: 585_000,
  high: 715_000,
  confidence: "high",
  comparableCount: 12,
  ownSale: { date: "2015-06-23", price: 259_995, indexed: 640_000 },
  homeLastSale: { date: "2015-06-23", price: 259_995, used: true },
  comparables: [],
  indexMonth: "2026-08",
  ...over,
});

test("says what the estimate rests on, naming the home's own sale year", () => {
  assert.equal(
    describeBasis(estimate()),
    "Based on this home's 2015 sale, brought up to today with the UK House Price Index, and 12 similar sales nearby, from HM Land Registry.",
  );
  assert.equal(
    describeBasis(estimate({ ownSale: null, comparableCount: 7 })),
    "Based on 7 similar sales nearby, brought up to today with the UK House Price Index, from HM Land Registry.",
  );
});

test("high and medium confidence lead with one figure; low confidence shows the range only", () => {
  assert.deepEqual(headlineFor(estimate()), { figure: "About £650,000", range: "£585,000 – £715,000", label: "High confidence" });
  assert.deepEqual(headlineFor(estimate({ confidence: "low" })), { figure: null, range: "£585,000 – £715,000", label: "Low confidence" });
});

const sale = (paon: string, saon = "", street = "LONGFIELD LANE"): Sale => ({
  price: 1, date: "2020-01-01", paon, saon, street, postcode: "EN7 6AB", type: "terraced", standard: true, newBuild: false, district: "BROXBOURNE",
});

test("lists each address in a postcode once, in house-number order, from its sale history", () => {
  const list = addressesFromHistory([sale("13"), sale("1"), sale("13"), sale("2A"), sale("ROSE COTTAGE"), sale("4", "FLAT 2")]);
  assert.deepEqual(
    list.map((a) => a.label),
    ["1 Longfield Lane", "2A Longfield Lane", "Flat 2, 4 Longfield Lane", "13 Longfield Lane", "Rose Cottage, Longfield Lane"],
  );
  assert.deepEqual(list[0], { paon: "1", saon: "", label: "1 Longfield Lane" });
});

test("reads the house number off a typed address when no address was picked", () => {
  assert.equal(houseNumberFrom("14 The Ridgeway, Cuffley"), "14");
  assert.equal(houseNumberFrom("80a Station Road"), "80A");
  assert.equal(houseNumberFrom("Rose Cottage, Cuffley"), null);
});

test("values a home outside Banc's patch where councils are named differently, with one sales query", async () => {
  const series = { "2025-01": { detached: 100, "semi-detached": 100, terraced: 100, flat: 100, all: 100 }, "2026-08": { detached: 110, "semi-detached": 110, terraced: 110, flat: 110, all: 110 } };
  const flat = (paon: string, price: number): Sale => ({
    price, date: "2025-01-20", paon, saon: "", street: "VICTORIA STREET", postcode: "SW1E 5AA", type: "flat", standard: true, newBuild: false, district: "CITY OF WESTMINSTER",
  });
  const calls: string[] = [];
  const e = await runInstantValuation(
    { postcode: "sw1e 5aa", paon: "9", saon: "", propertyType: "Flat / Apartment", majorWork: false },
    {
      districts: async () => ["WESTMINSTER"],
      history: async () => [],
      areaSales: async (sector, councils) => {
        calls.push(`${sector}:${councils.join(",")}`);
        return [flat("1", 500_000), flat("2", 520_000), flat("3", 540_000), flat("4", 560_000), flat("5", 580_000)];
      },
      hpi: async () => ({ WESTMINSTER: series, "CITY OF WESTMINSTER": series }),
    },
    new Date("2026-11-07T00:00:00Z"),
  );
  assert.equal(calls.length, 1);
  assert.ok(e, "expected an estimate");
  assert.equal(e.comparableCount, 5);
});

test("Mayfair (W1) is always director-led: a range only, never a single figure", async () => {
  const series = { "2025-01": { detached: 100, "semi-detached": 100, terraced: 100, flat: 100, all: 100 }, "2026-08": { detached: 100, "semi-detached": 100, terraced: 100, flat: 100, all: 100 } };
  const flat = (paon: string): Sale => ({
    price: 2_500_000, date: "2025-01-20", paon, saon: "", street: "MOUNT STREET", postcode: "W1K 2AL", type: "flat", standard: true, newBuild: false, district: "CITY OF WESTMINSTER",
  });
  const e = await runInstantValuation(
    { postcode: "W1K 2AL", paon: "99", saon: "", propertyType: "Flat / Apartment", majorWork: false },
    {
      districts: async () => ["WESTMINSTER"],
      history: async () => [],
      areaSales: async () => Array.from({ length: 12 }, (_, i) => flat(String(i + 1))),
      hpi: async () => ({ WESTMINSTER: series, "CITY OF WESTMINSTER": series }),
    },
    new Date("2026-11-07T00:00:00Z"),
  );
  assert.equal(e?.confidence, "low");
  assert.equal(headlineFor(e!).figure, null);
});

test("names the home's own sale row plainly, used or not", () => {
  assert.equal(homeSaleNote({ date: "2025-01-10", price: 347_500, used: true }), "Your home · sold Jan 2025");
  assert.equal(homeSaleNote({ date: "2006-12-01", price: 320_000, used: false }), "Your home · last sold Dec 2006, too long ago to rely on");
});
