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

function createFakeSyncRepository(
  activeIds: string[],
  onReconcile?: () => void,
) {
  const reconcileCalls: Array<{
    sourceSystem: string;
    rows: CanonicalPropertyWriteRow[];
    sourceIds: string[];
    startedAt: string;
  }> = [];
  const repository: PropertySyncRepository & {
    reconcileCalls: Array<{
      sourceSystem: string;
      rows: CanonicalPropertyWriteRow[];
      sourceIds: string[];
      startedAt: string;
    }>;
  } = {
    reconcileCalls,
    async listActiveSourceIds() {
      return [...activeIds];
    },
    async reconcile(request) {
      onReconcile?.();
      reconcileCalls.push(request);
      return {
        recordsRead: request.rows.length,
        recordsWritten: request.rows.length,
        recordsDeactivated: activeIds.filter((id) => !request.sourceIds.includes(id)).length,
        finishedAt: "2026-08-27T09:00:05.000Z",
      };
    },
    async recordFailure() {
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
    }),
    /empty or invalid/i,
  );

  assert.equal(repository.reconcileCalls.length, 0);
});

test("rejects an incomplete property row before writing or deactivating", async () => {
  const repository = createFakeSyncRepository(["EA-OLD"]);
  const invalidRow = { ...canonicalRow("EA-1"), title: "" };

  await assert.rejects(
    reconcileCompleteFeed(repository, {
      sourceSystem: "expert_agent",
      rows: [invalidRow],
      startedAt: "2026-08-27T09:00:00.000Z",
    }),
    /invalid/i,
  );

  assert.equal(repository.reconcileCalls.length, 0);
});

test("rejects a feed that would remove more than half of active records", async () => {
  const repository = createFakeSyncRepository(["EA-1", "EA-2", "EA-3"]);

  await assert.rejects(
    reconcileCompleteFeed(repository, {
      sourceSystem: "expert_agent",
      rows: [canonicalRow("EA-1")],
      startedAt: "2026-08-27T09:00:00.000Z",
    }),
    /more than 50%/i,
  );

  assert.equal(repository.reconcileCalls.length, 0);
});

test("rejects duplicate source ids before writing or deactivating", async () => {
  const repository = createFakeSyncRepository(["EA-OLD"]);

  await assert.rejects(
    reconcileCompleteFeed(repository, {
      sourceSystem: "expert_agent",
      rows: [canonicalRow("EA-1"), canonicalRow("EA-1")],
      startedAt: "2026-08-27T09:00:00.000Z",
    }),
    /duplicate/i,
  );

  assert.equal(repository.reconcileCalls.length, 0);
});

test("delegates a complete feed to one atomic repository mutation", async () => {
  const repository = createFakeSyncRepository(["EA-1", "EA-OLD"]);

  const summary = await reconcileCompleteFeed(repository, {
    sourceSystem: "expert_agent",
    rows: [canonicalRow("EA-1"), canonicalRow("EA-2")],
    startedAt: "2026-08-27T09:00:00.000Z",
  });

  assert.equal(repository.reconcileCalls.length, 1);
  assert.deepEqual(repository.reconcileCalls[0]?.sourceSystem, "expert_agent");
  assert.deepEqual(repository.reconcileCalls[0]?.sourceIds, ["EA-1", "EA-2"]);
  assert.deepEqual(summary, {
    recordsRead: 2,
    recordsWritten: 2,
    recordsDeactivated: 1,
    finishedAt: "2026-08-27T09:00:05.000Z",
  });
});

test("marks the RPC boundary only immediately before reconciliation", async () => {
  let phase = "pre_rpc";
  const repository = createFakeSyncRepository([], () => {
    assert.equal(phase, "rpc_invoked");
  });

  await reconcileCompleteFeed(repository, {
    sourceSystem: "expert_agent",
    rows: [canonicalRow("EA-1")],
    startedAt: "2026-08-27T09:00:00.000Z",
    onBeforeReconcile() {
      phase = "rpc_invoked";
    },
  });

  assert.equal(phase, "rpc_invoked");
});
