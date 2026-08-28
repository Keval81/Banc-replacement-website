import assert from "node:assert/strict";
import test from "node:test";
import {
  createDefaultPropertySearchQuery,
  hasActivePropertyFilters,
  parsePropertySearchParams,
  propertySearchQuerySchema,
  serializePropertySearchQuery,
  switchSearchDepartment,
} from "../property-search/query.ts";

test("creates truthful department-specific defaults", () => {
  assert.deepEqual(createDefaultPropertySearchQuery("sales"), {
    department: "sales",
    propertyTypes: [],
    tenures: [],
    features: [],
    statuses: ["for_sale", "under_offer"],
    sort: "default",
    page: 1,
    pageSize: 24,
  });
  assert.deepEqual(createDefaultPropertySearchQuery("lettings").statuses, [
    "to_let",
    "let_agreed",
  ]);
});

test("round-trips every supported non-default shareable field in canonical order", () => {
  const query = parsePropertySearchParams(
    new URLSearchParams(
      "page=2&features=parking,garden&tenures=freehold&propertyTypes=bungalow,house" +
        "&minBathrooms=2&minBedrooms=3&maxBedrooms=3&maxPrice=900000&minPrice=500000" +
        "&location=%20EN6%204EF%20&statuses=under_offer&sort=price_asc&pageSize=12",
    ),
    "sales",
  );

  assert.deepEqual(query, {
    department: "sales",
    location: "EN6 4EF",
    minPrice: 500000,
    maxPrice: 900000,
    minBedrooms: 3,
    maxBedrooms: 3,
    minBathrooms: 2,
    propertyTypes: ["house", "bungalow"],
    tenures: ["freehold"],
    features: ["garden", "parking"],
    statuses: ["under_offer"],
    sort: "price_asc",
    page: 2,
    pageSize: 12,
  });

  const serialized = serializePropertySearchQuery(query);
  assert.equal(
    serialized.toString(),
    "location=EN6+4EF&minPrice=500000&maxPrice=900000&minBedrooms=3&maxBedrooms=3&minBathrooms=2" +
      "&propertyTypes=house%2Cbungalow&tenures=freehold&features=garden%2Cparking" +
      "&statuses=under_offer&sort=price_asc&page=2&pageSize=12",
  );
  assert.deepEqual(parsePropertySearchParams(serialized, "sales"), query);
});

test("omits department and default values when serializing", () => {
  const query = createDefaultPropertySearchQuery("lettings");
  assert.equal(serializePropertySearchQuery(query).toString(), "");
});

test("drops unsupported parameters and malicious enum values", () => {
  const query = parsePropertySearchParams(
    new URLSearchParams(
      "radius=20&sort=popular&propertyTypes=house,hacked&tenures=freehold,drop-table" +
        "&features=garden,hacked&statuses=to_let,withdrawn&department=sales",
    ),
    "lettings",
  );

  assert.equal(query.department, "lettings");
  assert.equal(query.sort, "default");
  assert.deepEqual(query.propertyTypes, ["house"]);
  assert.deepEqual(query.tenures, ["freehold"]);
  assert.deepEqual(query.features, ["garden"]);
  assert.deepEqual(query.statuses, ["to_let"]);
  assert.equal("radius" in query, false);
});

test("defaults empty, non-finite, fractional, negative and out-of-range numeric values", () => {
  const query = parsePropertySearchParams(
    new URLSearchParams(
      "minPrice=&maxPrice=NaN&minBedrooms=2.5&minBathrooms=-1&page=0&pageSize=49",
    ),
    "sales",
  );

  assert.equal(query.minPrice, undefined);
  assert.equal(query.maxPrice, undefined);
  assert.equal(query.minBedrooms, undefined);
  assert.equal(query.minBathrooms, undefined);
  assert.equal(query.page, 1);
  assert.equal(query.pageSize, 24);
});

test("ignores oversized URL integers and enforces a realistic page boundary", () => {
  assert.doesNotThrow(() =>
    parsePropertySearchParams(
      new URLSearchParams(
        "page=1e100&minBedrooms=2147483648&maxBedrooms=2147483648&minBathrooms=2147483648" +
          "&minPrice=9007199254740992&maxPrice=1e100",
      ),
      "sales",
    ),
  );

  const invalid = parsePropertySearchParams(
    new URLSearchParams(
      "page=1001&minBedrooms=2147483648&maxBedrooms=2147483648&minBathrooms=2147483648" +
        "&minPrice=9007199254740992&maxPrice=1e100",
    ),
    "sales",
  );
  assert.equal(invalid.page, 1);
  assert.equal(invalid.minBedrooms, undefined);
  assert.equal(invalid.maxBedrooms, undefined);
  assert.equal(invalid.minBathrooms, undefined);
  assert.equal(invalid.minPrice, undefined);
  assert.equal(invalid.maxPrice, undefined);

  const boundary = parsePropertySearchParams(
    new URLSearchParams(
      "page=1000&pageSize=48&minBedrooms=2147483647&maxBedrooms=2147483647&minBathrooms=2147483647" +
        "&minPrice=9007199254740991&maxPrice=9007199254740991",
    ),
    "sales",
  );
  assert.equal(boundary.page, 1_000);
  assert.equal(boundary.pageSize, 48);
  assert.equal((boundary.page - 1) * boundary.pageSize, 47_952);
  assert.equal(boundary.minBedrooms, 2_147_483_647);
  assert.equal(boundary.maxBedrooms, 2_147_483_647);
  assert.equal(boundary.minBathrooms, 2_147_483_647);
  assert.equal(boundary.minPrice, Number.MAX_SAFE_INTEGER);
  assert.equal(boundary.maxPrice, Number.MAX_SAFE_INTEGER);
});

test("supports canonical exact bedroom bounds without changing minimum-bedroom semantics", () => {
  const exact = propertySearchQuerySchema.parse({
    ...createDefaultPropertySearchQuery("sales"),
    minBedrooms: 3,
    maxBedrooms: 3,
  });

  assert.equal(serializePropertySearchQuery(exact).get("maxBedrooms"), "3");
  assert.equal(
    parsePropertySearchParams(
      new URLSearchParams("minBedrooms=3&maxBedrooms=3"),
      "sales",
    ).maxBedrooms,
    3,
  );
  assert.equal(
    parsePropertySearchParams(
      new URLSearchParams("maxBedrooms=2147483648"),
      "sales",
    ).maxBedrooms,
    undefined,
  );
  assert.equal(switchSearchDepartment(exact, "lettings").maxBedrooms, 3);
  assert.equal(
    hasActivePropertyFilters({
      ...createDefaultPropertySearchQuery("sales"),
      maxBedrooms: 3,
    }),
    true,
  );
});

test("parses documented legacy aliases into canonical fields", () => {
  const query = parsePropertySearchParams(
    new URLSearchParams(
      "minBeds=3&minBaths=2&propertyType=flat,house&tenure=leasehold" +
        "&garden=true&periodFeatures=true&newBuild=true&chainFree=true" +
        "&virtualTour=true&videoTour=true&balcony=true&garage=false&sortBy=newest",
    ),
    "sales",
  );

  assert.equal(query.minBedrooms, 3);
  assert.equal(query.minBathrooms, 2);
  assert.deepEqual(query.propertyTypes, ["house", "flat"]);
  assert.deepEqual(query.tenures, ["leasehold"]);
  assert.deepEqual(query.features, [
    "garden",
    "balcony",
    "period_features",
    "new_home",
    "chain_free",
    "virtual_tour",
    "video_tour",
  ]);
  assert.equal(query.sort, "default");
});

test("canonical parameters take precedence over legacy aliases", () => {
  const query = parsePropertySearchParams(
    new URLSearchParams(
      "minBedrooms=4&minBeds=2&propertyTypes=bungalow&propertyType=flat&sort=price_desc&sortBy=price_asc",
    ),
    "sales",
  );

  assert.equal(query.minBedrooms, 4);
  assert.deepEqual(query.propertyTypes, ["bungalow"]);
  assert.equal(query.sort, "price_desc");
});

test("drops blank and overlong locations after trimming", () => {
  assert.equal(
    parsePropertySearchParams(new URLSearchParams("location=%20%20"), "sales").location,
    undefined,
  );
  assert.equal(
    parsePropertySearchParams(
      new URLSearchParams(`location=${"a".repeat(121)}`),
      "sales",
    ).location,
    undefined,
  );
  assert.equal(
    parsePropertySearchParams(new URLSearchParams("location=%20Cuffley%20"), "sales").location,
    "Cuffley",
  );
});

test("the exported schema coerces safe numeric strings and rejects unknown fields", () => {
  const parsed = propertySearchQuerySchema.parse({
    ...createDefaultPropertySearchQuery("sales"),
    minPrice: "500000",
    minBedrooms: "3",
    maxBedrooms: "3",
  });
  assert.equal(parsed.minPrice, 500000);
  assert.equal(parsed.minBedrooms, 3);
  assert.equal(parsed.maxBedrooms, 3);
  assert.throws(() =>
    propertySearchQuerySchema.parse({
      ...createDefaultPropertySearchQuery("sales"),
      radius: 20,
    }),
  );
  assert.throws(() =>
    propertySearchQuerySchema.parse({
      ...createDefaultPropertySearchQuery("sales"),
      statuses: ["to_let"],
    }),
  );
});

test("the exported schema canonicalizes enum arrays and requires a public status", () => {
  const parsed = propertySearchQuerySchema.parse({
    ...createDefaultPropertySearchQuery("sales"),
    propertyTypes: ["bungalow", "house", "bungalow"],
    features: ["parking", "garden", "parking"],
    statuses: ["under_offer", "for_sale", "under_offer"],
  });
  assert.deepEqual(parsed.propertyTypes, ["house", "bungalow"]);
  assert.deepEqual(parsed.features, ["garden", "parking"]);
  assert.deepEqual(parsed.statuses, ["for_sale", "under_offer"]);
  assert.throws(() =>
    propertySearchQuerySchema.parse({
      ...createDefaultPropertySearchQuery("sales"),
      statuses: [],
    }),
  );
});

test("the exported schema rejects values outside RPC-safe integer bounds", () => {
  for (const oversized of [
    { page: 1_001 },
    { minBedrooms: 2_147_483_648 },
    { maxBedrooms: 2_147_483_648 },
    { minBathrooms: 2_147_483_648 },
    { minPrice: 9_007_199_254_740_992 },
    { maxPrice: 1e100 },
  ]) {
    assert.throws(() =>
      propertySearchQuerySchema.parse({
        ...createDefaultPropertySearchQuery("sales"),
        ...oversized,
      }),
    );
  }

  assert.doesNotThrow(() =>
    propertySearchQuerySchema.parse({
      ...createDefaultPropertySearchQuery("sales"),
      page: 1_000,
      maxBedrooms: 2_147_483_647,
      pageSize: 48,
      minBedrooms: 2_147_483_647,
      minBathrooms: 2_147_483_647,
      minPrice: Number.MAX_SAFE_INTEGER,
      maxPrice: Number.MAX_SAFE_INTEGER,
    }),
  );
});

test("switching department resets incompatible fields and preserves compatible search intent", () => {
  const sales = parsePropertySearchParams(
    new URLSearchParams(
      "location=Cuffley&minPrice=500000&maxPrice=900000&minBedrooms=3&minBathrooms=2" +
        "&propertyTypes=house&tenures=freehold&features=garden&statuses=under_offer" +
        "&sort=price_asc&page=3&pageSize=12",
    ),
    "sales",
  );

  assert.deepEqual(switchSearchDepartment(sales, "lettings"), {
    department: "lettings",
    location: "Cuffley",
    minBedrooms: 3,
    minBathrooms: 2,
    propertyTypes: ["house"],
    tenures: [],
    features: ["garden"],
    statuses: ["to_let", "let_agreed"],
    sort: "price_asc",
    page: 1,
    pageSize: 12,
  });
});

test("switching to the current department preserves the validated query without array aliases", () => {
  const current = parsePropertySearchParams(
    new URLSearchParams(
      "location=Cuffley&minPrice=500000&tenures=freehold&propertyTypes=house" +
        "&statuses=under_offer&page=3",
    ),
    "sales",
  );
  const unchanged = switchSearchDepartment(current, "sales");

  assert.deepEqual(unchanged, current);
  assert.notEqual(unchanged.propertyTypes, current.propertyTypes);
  assert.notEqual(unchanged.tenures, current.tenures);
  assert.notEqual(unchanged.statuses, current.statuses);
  unchanged.propertyTypes.push("flat");
  assert.deepEqual(current.propertyTypes, ["house"]);
});

test("reports only user-selected filters as active", () => {
  const defaults = createDefaultPropertySearchQuery("sales");
  assert.equal(hasActivePropertyFilters(defaults), false);
  assert.equal(hasActivePropertyFilters({ ...defaults, page: 3, pageSize: 12 }), false);
  assert.equal(hasActivePropertyFilters({ ...defaults, sort: "price_desc" }), false);
  assert.equal(hasActivePropertyFilters({ ...defaults, location: "Cuffley" }), true);
  assert.equal(hasActivePropertyFilters({ ...defaults, statuses: ["under_offer"] }), true);
});
