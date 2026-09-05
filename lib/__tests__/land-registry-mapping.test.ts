import assert from "node:assert/strict";
import test from "node:test";

import {
  composeSoldPriceAddress,
  computeSoldPriceStats,
  mapSoldPriceBinding,
  parseEstateType,
  parseRegisterPropertyType,
} from "../api/land-registry-mapping.ts";

// Shapes taken verbatim from the live register, not invented:
// EN6 4LZ, https://landregistry.data.gov.uk/landregistry/query
const LIVE_BINDING = {
  item: { value: "http://landregistry.data.gov.uk/data/ppi/transaction/ABC/current" },
  price: { value: "715000" },
  date: { value: "2021-04-16" },
  paon: { value: "62" },
  street: { value: "NORTHAW ROAD EAST" },
  town: { value: "POTTERS BAR" },
  propertyType: { value: "http://landregistry.data.gov.uk/def/common/detached" },
  estateType: { value: "http://landregistry.data.gov.uk/def/common/freehold" },
  newBuild: { value: "false" },
};

test("reads an address out of the register's separate parts", () => {
  assert.equal(
    composeSoldPriceAddress({ paon: "62", street: "NORTHAW ROAD EAST", town: "POTTERS BAR" }),
    "62 Northaw Road East, Potters Bar",
  );
});

test("keeps the building name when the register supplies one", () => {
  assert.equal(
    composeSoldPriceAddress({
      saon: "BARHAM COURT",
      paon: "80A",
      street: "STATION ROAD",
      town: "CUFFLEY",
    }),
    "Barham Court, 80A Station Road, Cuffley",
  );
});

test("leaves no stray punctuation when parts are missing", () => {
  assert.equal(composeSoldPriceAddress({ street: "STATION ROAD" }), "Station Road");
  assert.equal(composeSoldPriceAddress({ town: "CUFFLEY" }), "Cuffley");
  assert.equal(composeSoldPriceAddress({}), "");
});

test("reads the property type from the register's vocabulary, not a letter code", () => {
  const base = "http://landregistry.data.gov.uk/def/common/";
  assert.equal(parseRegisterPropertyType(`${base}detached`), "detached");
  assert.equal(parseRegisterPropertyType(`${base}semi-detached`), "semi-detached");
  assert.equal(parseRegisterPropertyType(`${base}terraced`), "terraced");
  assert.equal(parseRegisterPropertyType(`${base}flat-maisonette`), "flat");
  assert.equal(parseRegisterPropertyType(""), "other");
});

test("reads tenure from estateType, which is where the register publishes it", () => {
  const base = "http://landregistry.data.gov.uk/def/common/";
  assert.equal(parseEstateType(`${base}freehold`), "freehold");
  assert.equal(parseEstateType(`${base}leasehold`), "leasehold");
  assert.equal(parseEstateType(""), "unknown");
});

test("maps a live register row into a record the page can render", () => {
  const record = mapSoldPriceBinding(LIVE_BINDING, "EN6 4LZ", 0);

  assert.equal(record.price, 715000);
  assert.equal(record.priceFormatted, "£715,000");
  assert.equal(record.address, "62 Northaw Road East, Potters Bar");
  assert.equal(record.postcode, "EN6 4LZ");
  assert.equal(record.date, "2021-04-16");
  assert.equal(record.propertyType, "detached");
  assert.equal(record.tenure, "freehold");
  assert.equal(record.newBuild, false);
});

test("never renders a bare resource URI as an address", () => {
  // The query used to SELECT ?address, which binds the address *resource*, so
  // the page would have printed a landregistry.data.gov.uk URL where the
  // street should be.
  const record = mapSoldPriceBinding(LIVE_BINDING, "EN6 4LZ", 0);
  assert.doesNotMatch(record.address, /https?:\/\//);
});

// ---- statistics over the register's rows ----

const iso = (d: Date) => d.toISOString().slice(0, 10);
const monthsBefore = (from: Date, months: number) => {
  const d = new Date(from);
  d.setMonth(d.getMonth() - months);
  return d;
};

test("averages and medians the sales it was given", () => {
  const now = new Date("2026-09-05");
  const stats = computeSoldPriceStats(
    [100000, 200000, 300000].map((price) => ({ price, date: iso(now) })),
    now,
  );

  assert.equal(stats.averagePrice, 200000);
  assert.equal(stats.medianPrice, 200000);
});

test("takes the midpoint of an even number of sales, not the upper one", () => {
  const now = new Date("2026-09-05");
  const stats = computeSoldPriceStats(
    [100000, 200000, 300000, 400000].map((price) => ({ price, date: iso(now) })),
    now,
  );

  assert.equal(stats.medianPrice, 250000);
});

test("counts sales in the last 6 and 12 months", () => {
  const now = new Date("2026-09-05");
  const stats = computeSoldPriceStats(
    [
      { price: 100000, date: iso(monthsBefore(now, 1)) },
      { price: 100000, date: iso(monthsBefore(now, 9)) },
      { price: 100000, date: iso(monthsBefore(now, 20)) },
    ],
    now,
  );

  assert.equal(stats.salesCount6Months, 1);
  assert.equal(stats.salesCount12Months, 2);
});

test("compares the last six months against the six months before them", () => {
  // The old filter read `date >= sixMonthsAgo && date < twelveMonthsAgo`, a
  // range that cannot contain anything, so the previous average was always 0
  // and the page could only ever print +0%.
  const now = new Date("2026-09-05");
  const stats = computeSoldPriceStats(
    [
      { price: 400000, date: iso(monthsBefore(now, 2)) },
      { price: 200000, date: iso(monthsBefore(now, 9)) },
    ],
    now,
  );

  assert.equal(stats.priceChangePercent, 100);
});

test("reports no change when there is nothing to compare against", () => {
  const now = new Date("2026-09-05");
  const stats = computeSoldPriceStats(
    [{ price: 400000, date: iso(monthsBefore(now, 2)) }],
    now,
  );

  assert.equal(stats.priceChangePercent, 0);
});

test("publishes no price per square foot, because the register has no floor areas", () => {
  // It was averagePrice / 1000 — a number that says every home is exactly
  // 1,000 sq ft. Fabricated market statistics are the same problem as the
  // fabricated sold prices this page already had.
  const now = new Date("2026-09-05");
  const stats = computeSoldPriceStats([{ price: 435889, date: iso(now) }], now);

  assert.ok(!("pricePerSqft" in stats), "a price per sq ft cannot be derived from price-paid data");
});
