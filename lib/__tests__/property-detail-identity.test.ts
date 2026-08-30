import assert from "node:assert/strict";
import test from "node:test";

import { findPropertyDetailRow } from "../property-detail-identity.ts";

test("resolves a property by its Expert Agent reference first", async () => {
  const calls: Array<[string, string]> = [];
  const result = await findPropertyDetailRow("EA-1479", async (column, id) => {
    calls.push([column, id]);
    return { data: { id: "uuid-1" }, error: null };
  });

  assert.deepEqual(result, { data: { id: "uuid-1" }, error: null });
  assert.deepEqual(calls, [["expert_agent_id", "EA-1479"]]);
});

test("falls back to the database id used by legacy property cards", async () => {
  const calls: Array<[string, string]> = [];
  const result = await findPropertyDetailRow("uuid-1", async (column, id) => {
    calls.push([column, id]);
    return column === "expert_agent_id"
      ? { data: null, error: null }
      : { data: { id: "uuid-1" }, error: null };
  });

  assert.deepEqual(result, { data: { id: "uuid-1" }, error: null });
  assert.deepEqual(calls, [
    ["expert_agent_id", "uuid-1"],
    ["id", "uuid-1"],
  ]);
});

test("fails closed without a fallback query when the primary lookup errors", async () => {
  let calls = 0;
  const error = { message: "lookup failed" };
  const result = await findPropertyDetailRow("EA-1479", async () => {
    calls += 1;
    return { data: null, error };
  });

  assert.deepEqual(result, { data: null, error });
  assert.equal(calls, 1);
});
