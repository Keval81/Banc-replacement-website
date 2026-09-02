import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildPropertyLeadActions,
  isSameAddressText,
  titleCaseAddress,
  buildPropertyHref,
  buildPropertyShareData,
  dbToCard,
  dbToDetail,
  deriveFeatureFlags,
  getCanonicalPropertyHref,
  shareProperty,
} from "../property-view.ts";
import type { DbProperty } from "../supabase";

const base: DbProperty = {
  id: "uuid-1",
  expert_agent_id: "BPGC1479",
  source_system: "expert_agent",
  source_id: "BPGC1479",
  source_updated_at: undefined,
  last_synced_at: "2026-08-15T00:00:00Z",
  is_active: true,
  search_property_type: "house",
  search_tenure: "freehold",
  search_features: ["garage", "virtual_tour"],
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
  epc_image_url: "",
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

const identifiable: DbProperty = {
  ...base,
  title: "5 Hanyards Lane, Cuffley, EN6 4EF",
  address: "5 Hanyards Lane, Cuffley, Hertfordshire, EN6 4EF",
  latitude: 51.7091234,
  longitude: -0.1275987,
};

test("strips door numbers and postcodes from the card the visitor sees", () => {
  const card = dbToCard(identifiable);

  assert.equal(card.title, "Hanyards Lane, Cuffley");
  assert.equal(card.address, "Hanyards Lane, Cuffley, Hertfordshire");
});

test("publishes area coordinates rather than the plot's own position", () => {
  const card = dbToCard(identifiable);

  assert.deepEqual(card.coordinates, { latitude: 51.709, longitude: -0.128 });
});

test("strips door numbers, postcodes and photo alt text on the detail view", () => {
  const detail = dbToDetail(identifiable);

  assert.equal(detail.title, "Hanyards Lane, Cuffley");
  assert.equal(detail.address, "Hanyards Lane, Cuffley, Hertfordshire");
  assert.equal(detail.postcode, "EN6");
  assert.equal(detail.latitude, 51.709);
  assert.equal(detail.longitude, -0.128);
  assert.equal(detail.gallery[0]?.alt, "Hanyards Lane, Cuffley — main photo");
  assert.equal(detail.gallery[1]?.alt, "Hanyards Lane, Cuffley — photo 2");
});

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

test("omits unsafe feed image references from cards and detail galleries", () => {
  const property = {
    ...base,
    images: [
      "zip://4StationRoad_01.jpg",
      "4StationRoad_02.jpg",
      "javascript:alert(1)",
      "https://future-streets.example/4StationRoad_03.jpg",
      "https://media.expertagent.co.uk/4StationRoad_04.jpg",
    ],
  };

  assert.deepEqual(dbToCard(property).images, [
    "https://media.expertagent.co.uk/4StationRoad_04.jpg",
  ]);
  assert.deepEqual(
    dbToDetail(property).gallery.map((image) => image.url),
    ["https://media.expertagent.co.uk/4StationRoad_04.jpg"],
  );
});

test("omits floorplans that Next Image cannot render", () => {
  const detail = dbToDetail({
    ...base,
    floorplans: [
      "FP1.gif",
      "zip://archive/FP2.gif",
      "https://future-streets.example/FP3.gif",
      "https://media.expertagent.co.uk/FP4.gif",
    ],
  });

  assert.deepEqual(detail.floorplans, [
    {
      id: "BPGC1479-fp-0",
      url: "https://media.expertagent.co.uk/FP4.gif",
      title: "Floorplan",
    },
  ]);
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

test("dbToDetail passes area coordinates and epc through", () => {
  const d = dbToDetail({
    ...base,
    latitude: 51.7101,
    longitude: -0.1124,
    epc_rating: "C",
    epc_image_url: "http://med01.expertagent.co.uk/x/EPC_80827980.png",
  });
  assert.equal(d.latitude, 51.71);
  assert.equal(d.longitude, -0.112);
  assert.equal(d.epcRating, "C");
  assert.match(d.epcImageUrl, /EPC_80827980/);
  const bare = dbToDetail(base);
  assert.equal(bare.latitude, undefined);
  assert.equal(bare.epcRating, undefined);
});

test("cards expose only complete, valid area coordinates", () => {
  assert.deepEqual(
    dbToCard({ ...base, latitude: 51.7101, longitude: -0.1124 }).coordinates,
    { latitude: 51.71, longitude: -0.112 },
  );
  assert.equal(dbToCard({ ...base, latitude: 51.7101 }).coordinates, undefined);
  assert.equal(
    dbToCard({ ...base, latitude: 95, longitude: -0.1124 }).coordinates,
    undefined,
  );
});

test("builds department-aware property detail links", () => {
  assert.equal(buildPropertyHref("sales", "BPGC 1479"), "/sales/properties/BPGC%201479");
  assert.equal(
    buildPropertyHref("lettings", "BPGC/1607"),
    "/lettings/properties/BPGC%2F1607"
  );
});

test("canonicalises a property opened under the wrong department prefix", () => {
  assert.equal(getCanonicalPropertyHref("sales", "sales", "BPGC1479"), null);
  assert.equal(getCanonicalPropertyHref("lettings", "lettings", "BPGC1607"), null);
  assert.equal(
    getCanonicalPropertyHref("sales", "lettings", "BPGC 1607"),
    "/lettings/properties/BPGC%201607"
  );
  assert.equal(
    getCanonicalPropertyHref("lettings", "sales", "BPGC/1479"),
    "/sales/properties/BPGC%2F1479"
  );
});

test("builds a concise share payload from the canonical property link", () => {
  assert.deepEqual(
    buildPropertyShareData({
      department: "lettings",
      id: "BPGC1607",
      title: "Nursery Gardens",
      address: "Cuffley, Hertfordshire",
      price: "£5,000 pcm",
      origin: "https://www.bancproperty.com/",
    }),
    {
      title: "Nursery Gardens | Banc Property Group",
      text: "Nursery Gardens — £5,000 pcm · Cuffley, Hertfordshire",
      url: "https://www.bancproperty.com/lettings/properties/BPGC1607",
    }
  );
});

test("copies the canonical property link when native sharing is unavailable", async () => {
  const copied: string[] = [];
  const data = {
    title: "Nursery Gardens | Banc Property Group",
    text: "Nursery Gardens — £5,000 pcm · Cuffley, Hertfordshire",
    url: "https://www.bancproperty.com/lettings/properties/BPGC1607",
  };

  const result = await shareProperty(data, {
    copyText: async (value) => {
      copied.push(value);
    },
  });

  assert.equal(result, "copied");
  assert.deepEqual(copied, [data.url]);
});

test("prefers native sharing when the browser supports it", async () => {
  const shared: Array<{ title: string; text: string; url: string }> = [];
  const copied: string[] = [];
  const data = {
    title: "Hanyards Lane | Banc Property Group",
    text: "Hanyards Lane — £2,350,000 · Cuffley, Hertfordshire",
    url: "https://www.bancproperty.com/sales/properties/BPGC1479",
  };

  const result = await shareProperty(data, {
    nativeShare: async (value) => {
      shared.push(value);
    },
    copyText: async (value) => {
      copied.push(value);
    },
  });

  assert.equal(result, "shared");
  assert.deepEqual(shared, [data]);
  assert.deepEqual(copied, []);
});

test("copies the link when native sharing fails for a non-cancellation reason", async () => {
  const copied: string[] = [];
  const data = {
    title: "Hanyards Lane | Banc Property Group",
    text: "Hanyards Lane — £2,350,000 · Cuffley, Hertfordshire",
    url: "https://www.bancproperty.com/sales/properties/BPGC1479",
  };

  const result = await shareProperty(data, {
    nativeShare: async () => {
      throw new Error("Native share failed");
    },
    copyText: async (value) => {
      copied.push(value);
    },
  });

  assert.equal(result, "copied");
  assert.deepEqual(copied, [data.url]);
});

test("builds department-appropriate lead actions with complete property context", () => {
  const cases = [
    {
      department: "sales" as const,
      id: "BPGC/1479",
      label: "Sales",
      canonicalUrl: "https://bancproperty.com/sales/properties/BPGC%2F1479",
      teamLabel: "Call the sales team",
    },
    {
      department: "lettings" as const,
      id: "BPGC 1607",
      label: "Lettings",
      canonicalUrl: "https://bancproperty.com/lettings/properties/BPGC%201607",
      teamLabel: "Call the lettings team",
    },
  ];

  for (const item of cases) {
    const actions = buildPropertyLeadActions(item.department, item.id);
    const mailto = new URL(actions.primaryHref);

    assert.equal(mailto.protocol, "mailto:");
    assert.equal(mailto.pathname, "info@bancproperty.com");
    assert.equal(
      mailto.searchParams.get("subject"),
      `Viewing request — ${item.label} — ${item.id}`
    );
    assert.equal(
      mailto.searchParams.get("body"),
      [
        "Hello Banc Property Group,",
        "",
        `I would like to arrange a viewing for this ${item.department} property.`,
        "",
        `Department: ${item.label}`,
        `Reference: ${item.id}`,
        `Property: ${item.canonicalUrl}`,
      ].join("\n")
    );
    assert.equal(actions.primaryLabel, "Request a viewing");
    assert.equal(actions.secondaryHref, "tel:01707877781");
    assert.equal(actions.secondaryLabel, item.teamLabel);
  }
});

test("titleCaseAddress folds shouty CRM address lines into readable prose", () => {
  assert.equal(
    titleCaseAddress("5 LITTLE BERKHAMSTED LANE, LITTLE BERKHAMSTED, HERTFORD, HERTFORDSHIRE"),
    "5 Little Berkhamsted Lane, Little Berkhamsted, Hertford, Hertfordshire"
  );
  assert.equal(
    titleCaseAddress("FLAT 2, ST JOHN'S COURT, STOKE-ON-TRENT, EN6 4JL"),
    "Flat 2, St John's Court, Stoke-On-Trent, EN6 4JL"
  );
  assert.equal(titleCaseAddress("THE OLD RECTORY, CHURCH OF ENGLAND LANE"), "The Old Rectory, Church of England Lane");
  assert.equal(titleCaseAddress("  CUFFLEY  "), "Cuffley");
});

test("titleCaseAddress leaves mixed-case and non-alphabetic titles untouched", () => {
  assert.equal(
    titleCaseAddress("Stunning 4-bed home in Cuffley EN6"),
    "Stunning 4-bed home in Cuffley EN6"
  );
  assert.equal(titleCaseAddress("Hillside"), "Hillside");
  assert.equal(titleCaseAddress("12"), "12");
  assert.equal(titleCaseAddress(""), "");
});

test("isSameAddressText spots a title that merely repeats the address", () => {
  assert.equal(
    isSameAddressText(
      "5 LITTLE BERKHAMSTED LANE, LITTLE BERKHAMSTED",
      "5 Little Berkhamsted Lane, Little Berkhamsted"
    ),
    true
  );
  assert.equal(
    isSameAddressText("5 Little Berkhamsted Lane", "5 Little Berkhamsted Lane, Hertford, SG13 8LY"),
    true
  );
  assert.equal(isSameAddressText("Stunning family home", "5 Little Berkhamsted Lane"), false);
  assert.equal(isSameAddressText("", "Cuffley"), false);
});

test("isSameAddressText spots a title that repeats the address with places dropped", () => {
  // Once door numbers are stripped, feed titles are often the address with
  // the middle localities missing — the same street, said twice.
  assert.equal(
    isSameAddressText(
      "Little Berkhamsted Lane, Hertford",
      "Little Berkhamsted Lane, Little Berkhamsted, Hertford, Hertfordshire",
    ),
    true,
  );
  assert.equal(
    isSameAddressText("Hanyards Lane, Cuffley", "Hanyards Lane, Cuffley, Hertfordshire"),
    true,
  );
  // The same street with the town named differently is still one place.
  assert.equal(
    isSameAddressText("Foxes Drive, West Cheshunt", "Foxes Drive, Cheshunt, Hertfordshire"),
    true,
  );
  assert.equal(
    isSameAddressText("Dunnock Close, Edmonton", "Dunnock Close, Enfield, Greater London"),
    true,
  );
  // A house name in front of the street does not make it a different street.
  assert.equal(
    isSameAddressText("Vineyards Road, Northaw", "Manor Cottage Vineyards Road, Northaw"),
    true,
  );
  assert.equal(
    isSameAddressText("Darkes Lane, Potters Bar", "Hudson Court, Darkes Lane, Potters Bar"),
    true,
  );
  // A title that names only the area still leaves the street worth printing.
  assert.equal(isSameAddressText("Cuffley", "Station Road, Cuffley"), false);
  // Different streets in the same town are not the same place.
  assert.equal(
    isSameAddressText("Tolmers Road, Cuffley", "Hanyards Lane, Cuffley, Hertfordshire"),
    false,
  );
  assert.equal(isSameAddressText("Stunning family home", "Station Road, Cuffley"), false);
});
