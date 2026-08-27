import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { expertAgentAdapter } from "../crm/expert-agent-adapter.ts";
import {
  deriveSearchFeatures,
  normalizePropertyType,
  normalizeTenure,
} from "../crm/property-source.ts";
import { parseExpertAgentFeed } from "../expert-agent-feed.ts";

const xml = readFileSync(
  join(import.meta.dirname, "fixtures", "expert-agent-feed.xml"),
  "utf8",
);

test("normalizes property types and tenure for server filters", () => {
  assert.equal(normalizePropertyType("Detached Bungalow"), "bungalow");
  assert.equal(normalizePropertyType("Upper Floor Flat Apartment"), "flat");
  assert.equal(normalizeTenure("Share of Freehold"), "share_of_freehold");
  assert.equal(normalizeTenure("Not supplied"), "unknown");
});

test("derives only supported features from explicit source wording", () => {
  assert.deepEqual(
    deriveSearchFeatures(
      ["Landscaped garden", "Off-street parking", "No onward chain"],
      "",
    ),
    ["garden", "parking", "chain_free"],
  );
  assert.deepEqual(deriveSearchFeatures(["Spacious family home"], ""), []);
});

test("maps Expert Agent data to CRM-neutral source metadata", () => {
  const record = parseExpertAgentFeed(xml).properties[0];
  const row = expertAgentAdapter.map(record, {
    syncedAt: "2026-08-27T09:00:00.000Z",
  });

  assert.equal(row.source_system, "expert_agent");
  assert.equal(row.source_id, record.reference);
  assert.equal(row.expert_agent_id, record.reference);
  assert.equal(row.is_active, true);
  assert.equal(row.last_synced_at, "2026-08-27T09:00:00.000Z");
  assert.equal(row.search_property_type, "house");
  assert.equal(row.search_tenure, "freehold");
  assert.ok(row.search_features.includes("garden"));
});
