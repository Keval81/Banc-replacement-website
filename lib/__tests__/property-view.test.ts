import { test } from "node:test";
import assert from "node:assert/strict";
import { dbToCard } from "../property-view.ts";
import type { DbProperty } from "../supabase";

const base: DbProperty = {
  id: "uuid-1",
  expert_agent_id: "BPGC1479",
  department: "sales",
  title: "Hanyards Lane, Cuffley",
  address: "Hanyards Lane, Cuffley, Hertfordshire",
  postcode: "EN6 4EF",
  price: 2350000,
  price_qualifier: "Guide Price £2,350,000",
  status: "for_sale",
  property_type: "Detached House",
  bedrooms: 6,
  bathrooms: 4,
  receptions: 3,
  description: "A fine home.\n\nMore detail.",
  features: ["6 Bedrooms", "Double Garage"],
  images: ["http://med05.expertagent.co.uk/a/1.jpg", "http://med05.expertagent.co.uk/a/2.jpg"],
  created_at: "2026-08-15T00:00:00Z",
  updated_at: "2026-08-15T00:00:00Z",
};

test("formats sales price with pound and thousands separators", () => {
  const c = dbToCard(base);
  assert.equal(c.price, "£2,350,000");
  assert.equal(c.priceNum, 2350000);
});

test("formats lettings price per calendar month", () => {
  const c = dbToCard({ ...base, department: "lettings", status: "to_let", price: 1500 });
  assert.equal(c.price, "£1,500 pcm");
});

test("derives tags from status", () => {
  assert.deepEqual(dbToCard(base).tags, []);
  assert.deepEqual(dbToCard({ ...base, status: "under_offer" }).tags, ["Under Offer"]);
  assert.deepEqual(
    dbToCard({ ...base, department: "lettings", status: "let_agreed" }).tags,
    ["Let Agreed"]
  );
});

test("maps stats and uses the first paragraph as summary", () => {
  const c = dbToCard(base);
  assert.deepEqual(c.stats, { beds: 6, baths: 4 });
  assert.equal(c.summary, "A fine home.");
});

test("keys the card on expert_agent_id and passes images through", () => {
  const c = dbToCard(base);
  assert.equal(c.id, "BPGC1479");
  assert.equal(c.images.length, 2);
});

test("categorises live feed property_type strings into filter ids", () => {
  const cases: Array<[string, string]> = [
    ["Detached House", "house"],
    ["Semi Detached House", "house"],
    ["Terraced House", "house"],
    ["End Terrace", "house"],
    ["Detached", "house"],
    ["Detached Bungalow", "bungalow"],
    ["Semi Detached Bungalow", "bungalow"],
    ["Upper Floor Flat Flat", "flat"],
    ["Ground Floor Flat Apartment / Studio", "flat"],
    ["Apartment / Studio", "flat"],
    ["Maisonette", "maisonette"],
    ["Building Plot", "land"],
    ["", "house"],
  ];
  for (const [input, want] of cases) {
    assert.equal(dbToCard({ ...base, property_type: input }).propertyType, want, input);
  }
});
