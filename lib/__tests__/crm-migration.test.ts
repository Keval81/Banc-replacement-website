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

test("migration exposes an atomic source-feed reconciliation RPC", () => {
  assert.match(sql, /create or replace function public\.reconcile_property_source_feed/i);
  assert.match(sql, /p_source_system text/i);
  assert.match(sql, /p_rows jsonb/i);
  assert.match(sql, /p_source_ids text\[\]/i);
  assert.match(sql, /p_started_at timestamptz/i);
  assert.match(sql, /on conflict \(source_system, source_id\)/i);
  assert.match(sql, /update public\.properties[\s\S]*is_active = false/i);
  assert.match(sql, /insert into public\.crm_sync_runs[\s\S]*'success'/i);
  const rpcStart = sql.indexOf("create or replace function public.reconcile_property_source_feed");
  const rpcEnd = sql.indexOf("$function$;", rpcStart);
  const rpc = sql.slice(rpcStart, rpcEnd);

  assert.match(rpc, /pg_advisory_xact_lock\(hashtextextended\(p_source_system/i);
  assert.match(rpc, /select count\(\*\)[\s\S]*is_active = true/i);
  assert.match(rpc, /v_records_deactivated::numeric \/ v_current_active_records > 0\.5/i);
  assert.ok(rpc.indexOf("v_records_deactivated::numeric") < rpc.indexOf("insert into public.properties"));
  assert.ok(rpc.indexOf("v_finished_at := clock_timestamp()") > rpc.indexOf("update public.properties"));
  assert.match(sql, /revoke execute on function public\.reconcile_property_source_feed[\s\S]*from public, anon, authenticated/i);
  assert.match(sql, /grant execute on function public\.reconcile_property_source_feed[\s\S]*to service_role/i);
});

test("migration exposes a parameterized paginated search function", () => {
  assert.match(sql, /create or replace function public\.search_properties/i);
  assert.match(sql, /p_department text/i);
  assert.match(sql, /p_location text/i);
  assert.match(sql, /p_features text\[\]/i);
  assert.match(sql, /count\(\*\) over\(\)/i);
  assert.match(sql, /p\.is_active = true/i);
});

test("migration returns a total-only fallback row beyond the final page", () => {
  assert.match(sql, /with filtered_properties as/i);
  assert.match(sql, /with[\s\S]*count\(\*\) over\(\)/i);
  assert.match(sql, /where not exists \(select 1 from paged_properties\)/i);
  assert.match(sql, /select null::jsonb,[\s\S]*from filtered_properties/i);
});

test("migration uses the full source identity as a deterministic sort tie-breaker", () => {
  assert.match(sql, /p\.source_system asc,[\s\S]*p\.source_id asc/i);
});

test("migration escapes literal LIKE metacharacters in both location searches", () => {
  const escapedLocationPattern = /replace\(replace\(replace\(lower\(btrim\(p_location\)\)/gi;

  assert.equal(sql.match(escapedLocationPattern)?.length, 2);
  assert.match(sql, /like[\s\S]*escape '\\'/i);
});
