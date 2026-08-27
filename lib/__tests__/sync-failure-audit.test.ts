import assert from "node:assert/strict";
import test from "node:test";

import type { PropertySyncRepository, SyncRunRecord } from "../crm/property-sync.ts";
import { bestEffortRecordPreRpcFailure } from "../crm/sync-failure-audit.ts";

function failureRun(): SyncRunRecord {
  return {
    sourceSystem: "expert_agent",
    startedAt: "2026-08-27T09:00:00.000Z",
    finishedAt: "2026-08-27T09:00:05.000Z",
    status: "failure",
    recordsRead: 1,
    recordsWritten: 0,
    recordsDeactivated: 0,
    errorSummary: "download failed",
  };
}

function createRepository(recordFailure: () => Promise<void>) {
  return {
    async listActiveSourceIds() { return []; },
    async reconcile() {
      return {
        recordsRead: 1,
        recordsWritten: 1,
        recordsDeactivated: 0,
        finishedAt: "2026-08-27T09:00:05.000Z",
      };
    },
    recordFailure,
  } satisfies PropertySyncRepository;
}

test("records a failure before reconciliation is invoked", async () => {
  let calls = 0;
  const repository = createRepository(async () => { calls++; });

  await bestEffortRecordPreRpcFailure("pre_rpc", repository, failureRun(), () => {});

  assert.equal(calls, 1);
});

test("does not record a speculative failure after reconciliation is invoked", async () => {
  let calls = 0;
  const repository = createRepository(async () => { calls++; });

  await bestEffortRecordPreRpcFailure("rpc_invoked", repository, failureRun(), () => {});

  assert.equal(calls, 0);
});

test("reports an audit failure without replacing the original sync error", async () => {
  const auditFailure = new Error("audit unavailable");
  const repository = createRepository(async () => { throw auditFailure; });
  let reported: unknown;

  await bestEffortRecordPreRpcFailure("pre_rpc", repository, failureRun(), (error) => {
    reported = error;
  });

  assert.equal(reported, auditFailure);
});
