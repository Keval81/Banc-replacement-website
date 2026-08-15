import { test } from "node:test";
import assert from "node:assert/strict";
import { dbToCard, dbToDetail, deriveFeatureFlags } from "../property-view.ts";
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
  tenure: "Freehold",
  brochure_url: "http://www.expertagent.co.uk/a/External.pdf",
  virtual_tour_url: "http://tours.example/t1",
  rooms: [
    { name: "Lounge", measurement: "15' x 22' (4.75m x 6.86m)", description: "A very nice room" },
  ],
  floorplans: ["http://med05.expertagent.co.uk/a/floorplan.jpg"],
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

test("derives search feature flags from real bullet wording", () => {
  const flags = deriveFeatureFlags(
    [
      "Landscaped Garden",
      "Double Garage",
      "Paved drive with parking for 4 vehicles",
      "Conservatory & Patio",
      "Feature Fireplace",
      "Chain Free",
      "New Build Home",
      "Period Features Throughout",
    ],
    "http://tours.example/t1"
  );
  assert.equal(flags.garden, true);
  assert.equal(flags.garage, true);
  assert.equal(flags.parking, true);
  assert.equal(flags.conservatory, true);
  assert.equal(flags.fireplace, true);
  assert.equal(flags.chainFree, true);
  assert.equal(flags.newBuild, true);
  assert.equal(flags.periodFeatures, true);
  assert.equal(flags.virtualTour, true);
  assert.equal(flags.videoTour, false);
});

test("garage does not imply parking flag by itself", () => {
  const flags = deriveFeatureFlags(["Double Garage"], "");
  assert.equal(flags.garage, true);
  assert.equal(flags.parking, false);
});

test("dbToDetail builds gallery images, floorplans and keeps honest gaps", () => {
  const d = dbToDetail(base);
  assert.equal(d.gallery.length, 2);
  assert.equal(d.gallery[0].isPrimary, true);
  assert.equal(d.gallery[0].id, "BPGC1479-0");
  assert.match(d.gallery[1].alt, /Hanyards Lane/);
  assert.equal(d.floorplans.length, 1);
  assert.equal(d.floorplans[0].title, "Floorplan");
  assert.equal(d.tenure, "Freehold");
  assert.match(d.brochureUrl, /External\.pdf$/);
  assert.equal(d.priceQualifier, "Guide Price £2,350,000");
  assert.equal(d.addedDate, "2026-08-15T00:00:00Z");
  assert.equal(d.rooms.length, 1);
});
