import assert from "node:assert/strict";
import test from "node:test";

import { estimateFromSales, postcodeSector, registerTypeFor } from "../valuation-estimate.ts";
import type { SoldPriceRecord } from "../types/data.ts";

const sale = (price: number, propertyType: SoldPriceRecord["propertyType"], monthsAgo: number): SoldPriceRecord => {
  const d = new Date("2026-09-07T00:00:00Z");
  d.setUTCMonth(d.getUTCMonth() - monthsAgo);
  return { id: `${price}-${monthsAgo}`, address: "x", postcode: "EN6 4AA", price, priceFormatted: "", date: d.toISOString(), propertyType, tenure: "freehold", newBuild: false };
};

test("maps the form's property types onto the register's four", () => {
  assert.equal(registerTypeFor("Detached House"), "detached");
  assert.equal(registerTypeFor("Semi-Detached House"), "semi-detached");
  assert.equal(registerTypeFor("Terraced House"), "terraced");
  assert.equal(registerTypeFor("Flat / Apartment"), "flat");
  assert.equal(registerTypeFor("Maisonette"), "flat");
  assert.equal(registerTypeFor("Bungalow"), null);
  assert.equal(registerTypeFor(""), null);
});

test("reads the sector out of a full postcode, and refuses anything shorter", () => {
  assert.equal(postcodeSector("EN6 4HU"), "EN6 4");
  assert.equal(postcodeSector("en64hu"), "EN6 4");
  assert.equal(postcodeSector("EN6"), null);
  assert.equal(postcodeSector("not a postcode"), null);
});

test("gives a range from the middle half of recent sales of the same type", () => {
  const sales = [
    sale(900_000, "detached", 2), sale(950_000, "detached", 5), sale(1_000_000, "detached", 8),
    sale(1_050_000, "detached", 11), sale(1_100_000, "detached", 14),
    sale(400_000, "flat", 3), sale(420_000, "flat", 4),
  ];
  const e = estimateFromSales(sales, { propertyType: "detached", now: new Date("2026-09-07T00:00:00Z") });
  assert.ok(e);
  assert.equal(e.sampleSize, 5);
  assert.equal(e.low, 950_000);
  assert.equal(e.high, 1_050_000);
  assert.equal(e.basis, "type");
});

test("falls back to every type in the area when the type has too few sales, and says so", () => {
  const sales = [sale(500_000, "terraced", 1), sale(520_000, "terraced", 2), sale(700_000, "semi-detached", 3), sale(750_000, "semi-detached", 4), sale(300_000, "flat", 2)];
  const e = estimateFromSales(sales, { propertyType: "detached", now: new Date("2026-09-07T00:00:00Z") });
  assert.ok(e);
  assert.equal(e.basis, "area");
  assert.equal(e.sampleSize, 5);
});

test("refuses to estimate from fewer than three sales, or from stale ones", () => {
  assert.equal(estimateFromSales([sale(500_000, "flat", 1), sale(510_000, "flat", 2)], { propertyType: "flat" }), null);
  const old = [sale(500_000, "flat", 30), sale(510_000, "flat", 31), sale(520_000, "flat", 32)];
  assert.equal(estimateFromSales(old, { propertyType: "flat", now: new Date("2026-09-07T00:00:00Z") }), null);
});

test("rounds the range to the nearest £5,000 so it never reads as a precise figure", () => {
  const sales = [sale(612_345, "flat", 1), sale(633_210, "flat", 2), sale(648_999, "flat", 3), sale(671_050, "flat", 4)];
  const e = estimateFromSales(sales, { propertyType: "flat", now: new Date("2026-09-07T00:00:00Z") });
  assert.ok(e);
  assert.equal(e.low % 5000, 0);
  assert.equal(e.high % 5000, 0);
});
