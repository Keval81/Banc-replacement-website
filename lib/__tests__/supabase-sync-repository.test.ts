import assert from "node:assert/strict";
import test from "node:test";

import { SupabaseSyncRepository } from "../crm/supabase-sync-repository.ts";

interface RangeCall {
  from: number;
  to: number;
}

function createPaginatedClient(
  sourceIds: Array<string | null>,
  count: number | null = sourceIds.length,
) {
  const orderCalls: Array<{ column: string; ascending: boolean }> = [];
  const rangeCalls: RangeCall[] = [];

  const client = {
    from(table: string) {
      assert.equal(table, "properties");
      return {
        select(columns: string, options: { count: "exact" }) {
          assert.equal(columns, "source_id");
          assert.deepEqual(options, { count: "exact" });
          return this;
        },
        eq() {
          return this;
        },
        order(column: string, options: { ascending: boolean }) {
          orderCalls.push({ column, ascending: options.ascending });
          return this;
        },
        range(from: number, to: number) {
          rangeCalls.push({ from, to });
          return Promise.resolve({
            data: sourceIds.slice(from, to + 1).map((source_id) => ({ source_id })),
            error: null,
            count,
          });
        },
      };
    },
  };

  return { client, orderCalls, rangeCalls };
}

test("reads all active source IDs with ordered advancing pages", async () => {
  const sourceIds = Array.from({ length: 1_001 }, (_, index) => `EA-${index + 1}`);
  const fake = createPaginatedClient(sourceIds);
  const repository = new SupabaseSyncRepository(fake.client as never);

  const result = await repository.listActiveSourceIds("expert_agent");

  assert.deepEqual(result, sourceIds);
  assert.deepEqual(fake.orderCalls, [
    { column: "source_id", ascending: true },
    { column: "source_id", ascending: true },
  ]);
  assert.deepEqual(fake.rangeCalls, [
    { from: 0, to: 999 },
    { from: 1_000, to: 1_999 },
  ]);
});

test("rejects malformed source IDs without repeating a page range", async () => {
  const fake = createPaginatedClient(["EA-1", null]);
  const repository = new SupabaseSyncRepository(fake.client as never);

  await assert.rejects(
    repository.listActiveSourceIds("expert_agent"),
    /invalid source id/i,
  );
  assert.deepEqual(fake.rangeCalls, [{ from: 0, to: 999 }]);
});

test("rejects an active-ID response without an exact count", async () => {
  const fake = createPaginatedClient(["EA-1"], null);
  const repository = new SupabaseSyncRepository(fake.client as never);

  await assert.rejects(
    repository.listActiveSourceIds("expert_agent"),
    /exact count/i,
  );
  assert.deepEqual(fake.rangeCalls, [{ from: 0, to: 999 }]);
});
