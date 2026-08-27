import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { expertAgentAdapter } from "../crm/expert-agent-adapter.ts";
import type { CanonicalPropertyWriteRow } from "../crm/property-source.ts";
import {
  reconcileCompleteFeed,
  type PropertySyncRepository,
} from "../crm/property-sync.ts";
import { parseExpertAgentFeed } from "../expert-agent-feed.ts";

const xml = readFileSync(
  join(import.meta.dirname, "fixtures", "expert-agent-feed.xml"),
  "utf8",
);
const template = expertAgentAdapter.map(
  parseExpertAgentFeed(xml).properties[0],
  { syncedAt: "2026-08-27T09:00:00.000Z" },
);

function canonicalRow(sourceId: string): CanonicalPropertyWriteRow {
  return {
    ...template,
    source_id: sourceId,
    expert_agent_id: sourceId,
  };
}

function createFakeSyncRepository(activeIds: string[]) {
  const upsertCalls: CanonicalPropertyWriteRow[][] = [];
  const deactivateCalls: string[][] = [];
  const repository: PropertySyncRepository & {
    upsertCalls: CanonicalPropertyWriteRow[][];
    deactivateCalls: string[][];
  } = {
    upsertCalls,
    deactivateCalls,
    async listActiveSourceIds() {
      return [...activeIds];
    },
    async upsert(rows) {
      upsertCalls.push(rows);
      return rows.length;
    },
    async deactivate(_source, ids) {
      deactivateCalls.push(ids);
      return ids.length;
    },
    async recordRun() {
      return;
    },
  };
  return repository;
}

test("rejects an empty feed before writing or deactivating", async () => {
  const repository = createFakeSyncRepository(["EA-OLD"]);

  await assert.rejects(
    reconcileCompleteFeed(repository, {
      sourceSystem: "expert_agent",
      rows: [],
      startedAt: "2026-08-27T09:00:00.000Z",
      finishedAt: "2026-08-27T09:00:05.000Z",
    }),
    /empty or invalid/i,
  );

  assert.equal(repository.upsertCalls.length, 0);
  assert.equal(repository.deactivateCalls.length, 0);
});

test("rejects duplicate source ids before writing or deactivating", async () => {
  const repository = createFakeSyncRepository(["EA-OLD"]);

  await assert.rejects(
    reconcileCompleteFeed(repository, {
      sourceSystem: "expert_agent",
      rows: [canonicalRow("EA-1"), canonicalRow("EA-1")],
      startedAt: "2026-08-27T09:00:00.000Z",
      finishedAt: "2026-08-27T09:00:05.000Z",
    }),
    /duplicate/i,
  );

  assert.equal(repository.upsertCalls.length, 0);
  assert.equal(repository.deactivateCalls.length, 0);
});

test("upserts current rows and deactivates only missing source ids", async () => {
  const repository = createFakeSyncRepository(["EA-1", "EA-OLD"]);

  const summary = await reconcileCompleteFeed(repository, {
    sourceSystem: "expert_agent",
    rows: [canonicalRow("EA-1"), canonicalRow("EA-2")],
    startedAt: "2026-08-27T09:00:00.000Z",
    finishedAt: "2026-08-27T09:00:05.000Z",
  });

  assert.deepEqual(repository.deactivateCalls, [["EA-OLD"]]);
  assert.deepEqual(summary, {
    recordsRead: 2,
    recordsWritten: 2,
    recordsDeactivated: 1,
  });
});
