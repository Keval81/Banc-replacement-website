import type {
  CanonicalPropertyWriteRow,
  CrmSourceSystem,
} from "./property-source.ts";

export interface SyncRunRecord {
  sourceSystem: CrmSourceSystem;
  startedAt: string;
  finishedAt: string;
  status: "success" | "failure";
  recordsRead: number;
  recordsWritten: number;
  recordsDeactivated: number;
  errorSummary?: string;
}

export interface PropertySyncRepository {
  listActiveSourceIds(source: CrmSourceSystem): Promise<string[]>;
  upsert(rows: CanonicalPropertyWriteRow[]): Promise<number>;
  deactivate(source: CrmSourceSystem, sourceIds: string[], at: string): Promise<number>;
  recordRun(run: SyncRunRecord): Promise<void>;
}

export interface SyncSummary {
  recordsRead: number;
  recordsWritten: number;
  recordsDeactivated: number;
}

export async function reconcileCompleteFeed(
  repository: PropertySyncRepository,
  input: {
    sourceSystem: CrmSourceSystem;
    rows: CanonicalPropertyWriteRow[];
    startedAt: string;
    finishedAt: string;
  },
): Promise<SyncSummary> {
  if (input.rows.length === 0) {
    throw new Error("Cannot reconcile an empty or invalid feed");
  }

  const incomingIds = new Set<string>();
  for (const row of input.rows) {
    if (row.source_system !== input.sourceSystem || row.source_id.trim() === "") {
      throw new Error("Cannot reconcile an empty or invalid feed");
    }
    if (incomingIds.has(row.source_id)) {
      throw new Error(`Cannot reconcile duplicate source id: ${row.source_id}`);
    }
    incomingIds.add(row.source_id);
  }

  const activeSourceIds = await repository.listActiveSourceIds(input.sourceSystem);
  const recordsWritten = await repository.upsert(input.rows);
  const missingSourceIds = activeSourceIds.filter((id) => !incomingIds.has(id));
  const recordsDeactivated = missingSourceIds.length === 0
    ? 0
    : await repository.deactivate(input.sourceSystem, missingSourceIds, input.finishedAt);

  return {
    recordsRead: input.rows.length,
    recordsWritten,
    recordsDeactivated,
  };
}
