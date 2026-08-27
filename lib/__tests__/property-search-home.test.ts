import assert from "node:assert/strict";
import test from "node:test";

import { buildHomeSearchSubmission } from "../property-search/navigation.ts";
import { createDefaultPropertySearchQuery, switchSearchDepartment } from "../property-search/query.ts";
import type { PropertySearchFilters } from "../property-search/types.ts";

const fullFilters: PropertySearchFilters = {
  location: "Cuffley",
  minPrice: 500_000,
  maxPrice: 1_000_000,
  minBedrooms: 3,
  minBathrooms: 2,
  propertyTypes: ["house", "flat"],
  tenures: ["freehold"],
  features: ["garden", "parking"],
  sort: "price_asc",
};

test("submits homepage buying and renting searches to the correct result page", () => {
  assert.equal(
    buildHomeSearchSubmission("sales", {
      location: "Cuffley",
      propertyTypes: [],
      tenures: [],
      features: [],
      sort: "default",
    }),
    "/sales/properties?location=Cuffley",
  );
  assert.equal(
    buildHomeSearchSubmission("lettings", {
      location: "EN6",
      propertyTypes: [],
      tenures: [],
      features: [],
      sort: "default",
    }),
    "/lettings/properties?location=EN6",
  );
});

test("submits every canonical homepage filter", () => {
  assert.equal(
    buildHomeSearchSubmission("sales", fullFilters),
    "/sales/properties?location=Cuffley&minPrice=500000&maxPrice=1000000&minBedrooms=3&minBathrooms=2&propertyTypes=house%2Cflat&tenures=freehold&features=garden%2Cparking&sort=price_asc",
  );
});

test("switching Buy and Rent keeps compatible choices and resets department-specific state", () => {
  const sales = {
    ...createDefaultPropertySearchQuery("sales"),
    ...fullFilters,
    page: 4,
  };

  const lettings = switchSearchDepartment(sales, "lettings");

  assert.deepEqual(lettings, {
    department: "lettings",
    location: "Cuffley",
    minBedrooms: 3,
    minBathrooms: 2,
    propertyTypes: ["house", "flat"],
    tenures: [],
    features: ["garden", "parking"],
    statuses: ["to_let", "let_agreed"],
    sort: "price_asc",
    page: 1,
    pageSize: 24,
  });
});
