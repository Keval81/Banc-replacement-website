import assert from "node:assert/strict";
import test from "node:test";

import { dbToDetail } from "../property-view.ts";
import { breadcrumbJsonLd, realEstateListingJsonLd } from "../schema-org.ts";
import type { DbProperty } from "../supabase";

const identifiable = {
  id: "uuid-1",
  expert_agent_id: "BPGC1479",
  source_system: "expert_agent",
  source_id: "BPGC1479",
  source_updated_at: undefined,
  last_synced_at: "2026-08-15T00:00:00Z",
  is_active: true,
  search_property_type: "house",
  search_tenure: "freehold",
  search_features: [],
  department: "sales",
  title: "5 Hanyards Lane, Cuffley, EN6 4EF",
  address: "5 Hanyards Lane, Cuffley, Hertfordshire, EN6 4EF",
  postcode: "EN6 4EF",
  price: 950000,
  status: "for_sale",
  property_type: "Detached House",
  bedrooms: 4,
  bathrooms: 2,
  receptions: 2,
  description: "A fine home.",
  features: [],
  images: ["http://med05.expertagent.co.uk/a/1.jpg"],
  epc_image_url: "",
  tenure: "Freehold",
  brochure_url: "",
  virtual_tour_url: "",
  rooms: [],
  floorplans: [],
  latitude: 51.7091234,
  longitude: -0.1275987,
  created_at: "2026-08-15T00:00:00Z",
  updated_at: "2026-08-15T00:00:00Z",
} as unknown as DbProperty;

const FULL_POSTCODE = /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i;

test("publishes no door number or full postcode in the listing JSON-LD", () => {
  const detail = dbToDetail(identifiable);
  const serialised = JSON.stringify(realEstateListingJsonLd(detail));

  assert.doesNotMatch(serialised, /5 Hanyards Lane/);
  assert.doesNotMatch(serialised, FULL_POSTCODE);
  assert.match(serialised, /Hanyards Lane/);
  assert.match(serialised, /"postalCode":"EN6"/);
  assert.match(serialised, /"latitude":51\.709/);
});

test("publishes no door number in the breadcrumb trail", () => {
  const detail = dbToDetail(identifiable);
  const serialised = JSON.stringify(
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "For Sale", path: "/sales/properties" },
      { name: detail.title, path: `/sales/properties/${detail.id}` },
    ]),
  );

  assert.doesNotMatch(serialised, /5 Hanyards Lane/);
  assert.doesNotMatch(serialised, FULL_POSTCODE);
  assert.match(serialised, /Hanyards Lane, Cuffley/);
});

test("keeps the page title and share text free of identifying detail", () => {
  const detail = dbToDetail(identifiable);
  const pageTitle = `${detail.title} — ${detail.price} | Banc Property Group`;

  assert.equal(pageTitle, "Hanyards Lane, Cuffley — £950,000 | Banc Property Group");
  assert.doesNotMatch(detail.address, FULL_POSTCODE);
  assert.doesNotMatch(detail.address, /^5 /);
});
