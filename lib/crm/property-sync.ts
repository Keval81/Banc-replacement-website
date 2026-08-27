import {
  SEARCH_FEATURES,
  SEARCH_PROPERTY_TYPES,
  SEARCH_TENURES,
  type CanonicalPropertyWriteRow,
  type CrmSourceSystem,
} from "./property-source.ts";

export interface SyncRunRecord {
  sourceSystem: CrmSourceSystem;
  startedAt: string;
  finishedAt: string;
  status: "failure";
  recordsRead: number;
  recordsWritten: number;
  recordsDeactivated: number;
  errorSummary?: string;
}

export interface SyncSummary {
  recordsRead: number;
  recordsWritten: number;
  recordsDeactivated: number;
  finishedAt: string;
}

export interface ReconciliationRequest {
  sourceSystem: CrmSourceSystem;
  rows: CanonicalPropertyWriteRow[];
  sourceIds: string[];
  startedAt: string;
}

export interface PropertySyncRepository {
  listActiveSourceIds(source: CrmSourceSystem): Promise<string[]>;
  reconcile(request: ReconciliationRequest): Promise<SyncSummary>;
  recordFailure(run: SyncRunRecord): Promise<void>;
}

export async function reconcileCompleteFeed(
  repository: PropertySyncRepository,
  input: {
    sourceSystem: CrmSourceSystem;
    rows: CanonicalPropertyWriteRow[];
    startedAt: string;
    onBeforeReconcile?: () => void;
  },
): Promise<SyncSummary> {
  const sourceIds = validateRows(input.sourceSystem, input.rows);
  const activeSourceIds = await repository.listActiveSourceIds(input.sourceSystem);
  const missingSourceIds = activeSourceIds.filter((id) => !sourceIds.includes(id));

  if (activeSourceIds.length > 0 && missingSourceIds.length / activeSourceIds.length > 0.5) {
    throw new Error("Cannot reconcile a feed that would remove more than 50% of active records");
  }

  input.onBeforeReconcile?.();
  return repository.reconcile({
    sourceSystem: input.sourceSystem,
    rows: input.rows,
    sourceIds,
    startedAt: input.startedAt,
  });
}

function validateRows(
  sourceSystem: CrmSourceSystem,
  rows: CanonicalPropertyWriteRow[],
): string[] {
  if (rows.length === 0) {
    throw new Error("Cannot reconcile an empty or invalid feed");
  }

  const sourceIds = new Set<string>();
  for (const row of rows) {
    if (!isValidRow(row, sourceSystem)) {
      throw new Error("Cannot reconcile an empty or invalid feed");
    }
    if (sourceIds.has(row.source_id)) {
      throw new Error(`Cannot reconcile duplicate source id: ${row.source_id}`);
    }
    sourceIds.add(row.source_id);
  }

  return [...sourceIds];
}

function isValidRow(
  row: CanonicalPropertyWriteRow,
  sourceSystem: CrmSourceSystem,
): boolean {
  return row.source_system === sourceSystem
    && row.source_id.trim() === row.source_id
    && row.source_id !== ""
    && (row.department === "sales" || row.department === "lettings")
    && row.title.trim() !== ""
    && row.address.trim() !== ""
    && Number.isFinite(row.price)
    && row.price > 0
    && SEARCH_PROPERTY_TYPES.includes(row.search_property_type)
    && SEARCH_TENURES.includes(row.search_tenure)
    && row.search_features.every((feature) => SEARCH_FEATURES.includes(feature));
}
