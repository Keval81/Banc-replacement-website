import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseExpertAgentFeed, toDbProperty, epcBand } from "../expert-agent-feed.ts";

const xml = readFileSync(join(import.meta.dirname, "fixtures", "expert-agent-feed.xml"), "utf8");

test("parses every property across branches", () => {
  const feed = parseExpertAgentFeed(xml);
  assert.equal(feed.properties.length, 2);
  assert.equal(feed.agencyName, "Banc Property Group");
  assert.equal(feed.properties[0].branch, "Cuffley");
});

test("maps the spec example's core fields", () => {
  const p = parseExpertAgentFeed(xml).properties[0];
  assert.equal(p.reference, "692778d6-40f8-4760-b6e8-8729d19cf5c1");
  assert.equal(p.department, "Residential Sales");
  assert.equal(p.priceText, "Offers over £350,000.00");
  assert.equal(p.numericPrice, 350000);
  assert.equal(p.bedrooms, 4);
  assert.equal(p.receptions, 3);
  assert.equal(p.bathrooms, 4);
  assert.equal(p.priority, "On Market");
  assert.equal(p.advertHeading, "Heytesbury: 4 bed detached property in a unique setting");
  assert.equal(p.tenure, "Freehold");
  assert.equal(p.propertyType, "House");
  assert.equal(p.propertyStyle, "Detached");
  assert.equal(p.propertyOfWeek, false);
});

test("assembles the address from its parts, skipping empty ones", () => {
  const [a, b] = parseExpertAgentFeed(xml).properties;
  assert.equal(a.address, "18 Heytesbury Park, Heytesbury, Warminster, Wiltshire");
  assert.equal(a.postcode, "BA12 0HG");
  // second property has an empty district — no double commas
  assert.equal(b.address, "4 Station Road, Cuffley, Hertfordshire");
});

test("collects only non-empty bullets as features, decoding entities", () => {
  const p = parseExpertAgentFeed(xml).properties[0];
  assert.equal(p.features.length, 10);
  assert.equal(p.features[9], "Conservatory & Patio");
  const b = parseExpertAgentFeed(xml).properties[1];
  assert.deepEqual(b.features, ["2 Bedrooms"]);
});

test("keeps picture order with the first as main, and reads rooms and floorplans", () => {
  const p = parseExpertAgentFeed(xml).properties[0];
  assert.equal(p.pictures.length, 3);
  assert.equal(p.pictures[0].name, "front");
  assert.match(p.pictures[0].filename, /DSCF0011\.JPG$/);
  assert.equal(p.rooms.length, 2);
  assert.equal(p.rooms[0].name, "Lounge");
  assert.match(p.rooms[0].measurement, /4\.75m x 6\.86m/);
  assert.equal(p.floorplans.length, 1);
});

test("handles a single-property feed (parser must not require arrays)", () => {
  const single = xml.replace(
    /<property reference="AB12345">[\s\S]*?<\/property>\n/,
    ""
  );
  const feed = parseExpertAgentFeed(single);
  assert.equal(feed.properties.length, 1);
});

test("toDbProperty maps a sales property to the supabase row shape", () => {
  const p = parseExpertAgentFeed(xml).properties[0];
  const row = toDbProperty(p);
  assert.equal(row.expert_agent_id, "692778d6-40f8-4760-b6e8-8729d19cf5c1");
  assert.equal(row.title, "Heytesbury: 4 bed detached property in a unique setting");
  assert.equal(row.price, 350000);
  assert.equal(row.price_qualifier, "Offers over £350,000.00");
  assert.equal(row.status, "for_sale");
  assert.equal(row.property_type, "Detached House");
  assert.equal(row.bedrooms, 4);
  assert.equal(row.bathrooms, 4);
  assert.equal(row.receptions, 3);
  assert.equal(row.description.startsWith("Heytesbury: 4 bed detached"), true);
  assert.equal(row.features.length, 10);
  assert.equal(row.images.length, 3);
  assert.match(row.images[0], /DSCF0011\.JPG$/);
});

test("maps a lettings Under Offer record to Let Agreed", () => {
  const b = parseExpertAgentFeed(xml).properties[1];
  assert.equal(toDbProperty(b).status, "let_agreed");
});

test("deduplicates consecutive address parts (district repeated as town)", () => {
  const dup = xml.replace("<district>Heytesbury</district>", "<district>Warminster</district>");
  const p = parseExpertAgentFeed(dup).properties[0];
  assert.equal(p.address, "18 Heytesbury Park, Warminster, Wiltshire");
});

test("maps lettings departments and priorities to lettings statuses", () => {
  const lets = xml
    .replace("<priority>Under Offer</priority>", "<priority>Available to Let</priority>");
  const b = parseExpertAgentFeed(lets).properties[1];
  const row = toDbProperty(b);
  assert.equal(row.department, "lettings");
  assert.equal(row.status, "to_let");
});

test("maps Let STC to let_agreed and Sold STC to under_offer", () => {
  const a = xml.replace("<priority>On Market</priority>", "<priority>Sold STC</priority>");
  assert.equal(toDbProperty(parseExpertAgentFeed(a).properties[0]).status, "under_offer");
  const b = xml.replace("<priority>Under Offer</priority>", "<priority>Let STC</priority>");
  assert.equal(toDbProperty(parseExpertAgentFeed(b).properties[1]).status, "let_agreed");
});

test("keeps every supported priority inside its department status vocabulary", () => {
  const [sales, lettings] = parseExpertAgentFeed(xml).properties;
  const cases = [
    { property: sales, priority: "On Market", expected: "for_sale" },
    { property: sales, priority: "Under Offer", expected: "under_offer" },
    { property: sales, priority: "Sold", expected: "sold" },
    { property: sales, priority: "Sold STC", expected: "under_offer" },
    { property: sales, priority: "Withdrawn", expected: "withdrawn" },
    { property: lettings, priority: "Available to Let", expected: "to_let" },
    { property: lettings, priority: "On Market", expected: "to_let" },
    { property: lettings, priority: "Under Offer", expected: "let_agreed" },
    { property: lettings, priority: "Let STC", expected: "let_agreed" },
    { property: lettings, priority: "Let", expected: "let" },
    { property: lettings, priority: "Withdrawn", expected: "withdrawn" },
  ] as const;

  for (const { property, priority, expected } of cases) {
    assert.equal(
      toDbProperty({ ...property, priority }).status,
      expected,
      `${property.department}: ${priority}`,
    );
  }
});

test("sales rows carry department sales", () => {
  const row = toDbProperty(parseExpertAgentFeed(xml).properties[0]);
  assert.equal(row.department, "sales");
});

test("toDbProperty carries tenure, brochure, tour, rooms and floorplans", () => {
  const p = parseExpertAgentFeed(xml).properties[0];
  const row = toDbProperty(p);
  assert.equal(row.tenure, "Freehold");
  assert.match(row.brochure_url, /External\.pdf$/);
  assert.match(row.virtual_tour_url, /panpics/);
  assert.equal(row.rooms.length, 2);
  assert.deepEqual(Object.keys(row.rooms[0]).sort(), ["description", "measurement", "name"]);
  assert.equal(row.floorplans.length, 1);
});

test("captures the undocumented epc graph image and derives the band from its filename", () => {
  const [withEpc, without] = parseExpertAgentFeed(xml).properties;
  const row = toDbProperty(withEpc);
  assert.match(row.epc_image_url, /EPC_80827980\.png$/);
  assert.equal(row.epc_rating, "C"); // current energy score 80 -> band C
  const bare = toDbProperty(without);
  assert.equal(bare.epc_image_url, "");
  assert.equal(bare.epc_rating, undefined);
});

test("epcBand maps scores to the standard bands", () => {
  assert.equal(epcBand(95), "A");
  assert.equal(epcBand(85), "B");
  assert.equal(epcBand(69), "C");
  assert.equal(epcBand(55), "D");
  assert.equal(epcBand(40), "E");
  assert.equal(epcBand(25), "F");
  assert.equal(epcBand(10), "G");
});

test("derives the band from PEA_ four-digit filenames too", () => {
  const pea = xml.replace("EPC_80827980.png", "PEA_6974.png");
  const row = toDbProperty(parseExpertAgentFeed(pea).properties[0]);
  assert.equal(row.epc_rating, "C"); // current 69 -> C
  const noise = xml.replace("EPC_80827980.png", "Picture1.png");
  assert.equal(toDbProperty(parseExpertAgentFeed(noise).properties[0]).epc_rating, undefined);
});
