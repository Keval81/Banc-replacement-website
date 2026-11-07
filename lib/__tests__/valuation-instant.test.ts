import assert from "node:assert/strict";
import test from "node:test";

import type { Sale } from "../valuation/engine.ts";
import { addressesFromHistory, describeBasis, headlineFor, houseNumberFrom, type InstantEstimate } from "../valuation/instant.ts";

const estimate = (over: Partial<InstantEstimate> = {}): InstantEstimate => ({
  figure: 650_000,
  low: 585_000,
  high: 715_000,
  confidence: "high",
  comparableCount: 12,
  ownSale: { date: "2015-06-23", price: 259_995, indexed: 640_000 },
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
