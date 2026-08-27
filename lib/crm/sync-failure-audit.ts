import type { PropertySyncRepository, SyncRunRecord } from "./property-sync.ts";

export type SyncFailurePhase = "pre_rpc" | "rpc_invoked";

export async function bestEffortRecordPreRpcFailure(
  phase: SyncFailurePhase,
  repository: PropertySyncRepository | null,
  run: SyncRunRecord,
  onAuditFailure: (error: unknown) => void,
): Promise<void> {
  if (phase !== "pre_rpc" || !repository) return;

  try {
    await repository.recordFailure(run);
  } catch (error) {
    onAuditFailure(error);
  }
}
