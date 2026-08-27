import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const sql = readFileSync(
  join(process.cwd(), "supabase/migrations/202608270001_crm_property_search.sql"),
  "utf8",
);

test("migration creates neutral source fields and sync audit records", () => {
  for (const field of [
    "source_system", "source_id", "source_updated_at", "last_synced_at",
    "is_active", "search_property_type", "search_tenure", "search_features",
  ]) {
    assert.match(sql, new RegExp(`\\b${field}\\b`));
  }
  assert.match(sql, /unique index[\s\S]*source_system[\s\S]*source_id/i);
  assert.match(sql, /create table[\s\S]*crm_sync_runs/i);
});

test("migration exposes a parameterized paginated search function", () => {
  assert.match(sql, /create or replace function public\.search_properties/i);
  assert.match(sql, /p_department text/i);
  assert.match(sql, /p_location text/i);
  assert.match(sql, /p_features text\[\]/i);
  assert.match(sql, /count\(\*\) over\(\)/i);
  assert.match(sql, /p\.is_active = true/i);
});
