import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  PropertySyncRepository,
  ReconciliationRequest,
  SyncRunRecord,
  SyncSummary,
} from "./property-sync.ts";
import type { CrmSourceSystem } from "./property-source.ts";

const SOURCE_ID_PAGE_SIZE = 1_000;

interface ReconciliationRpcResult {
  records_read: number;
  records_written: number;
  records_deactivated: number;
  finished_at: string;
}

export class SupabaseSyncRepository implements PropertySyncRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listActiveSourceIds(source: CrmSourceSystem): Promise<string[]> {
    const sourceIds: string[] = [];
    let expectedCount: number | null = null;

    for (let from = 0; expectedCount === null || sourceIds.length < expectedCount;) {
      const { data, error, count } = await this.client
        .from("properties")
        .select("source_id", { count: "exact" })
        .eq("source_system", source)
        .eq("is_active", true)
        .range(from, from + SOURCE_ID_PAGE_SIZE - 1);

      if (error) {
        throw new Error(`Supabase list active property source IDs: ${error.message}`);
      }
      if (expectedCount === null) expectedCount = count ?? 0;

      const page = (data ?? [])
        .map((row) => row.source_id)
        .filter((sourceId): sourceId is string => typeof sourceId === "string");
      sourceIds.push(...page);

      if (page.length === 0 && sourceIds.length < expectedCount) {
        throw new Error("Supabase list active property source IDs returned an incomplete page");
      }
      from += page.length;
    }

    return sourceIds;
  }

  async reconcile(request: ReconciliationRequest): Promise<SyncSummary> {
    const { data, error } = await this.client.rpc("reconcile_property_source_feed", {
      p_source_system: request.sourceSystem,
      p_rows: request.rows,
      p_source_ids: request.sourceIds,
      p_started_at: request.startedAt,
    });

    if (error) {
      throw new Error(`Supabase reconcile source feed: ${error.message}`);
    }

    const result = Array.isArray(data) ? data[0] : data;
    if (!isReconciliationResult(result)) {
      throw new Error("Supabase reconcile source feed returned an invalid result");
    }

    return {
      recordsRead: result.records_read,
      recordsWritten: result.records_written,
      recordsDeactivated: result.records_deactivated,
      finishedAt: result.finished_at,
    };
  }

  async recordFailure(run: SyncRunRecord): Promise<void> {
    const { error } = await this.client.from("crm_sync_runs").insert({
      source_system: run.sourceSystem,
      started_at: run.startedAt,
      finished_at: run.finishedAt,
      status: run.status,
      records_read: run.recordsRead,
      records_written: run.recordsWritten,
      records_deactivated: run.recordsDeactivated,
      error_summary: run.errorSummary,
    });

    if (error) {
      throw new Error(`Supabase record failed sync run: ${error.message}`);
    }
  }
}

function isReconciliationResult(value: unknown): value is ReconciliationRpcResult {
  if (typeof value !== "object" || value === null) return false;
  const result = value as Record<string, unknown>;
  return Number.isInteger(result.records_read)
    && Number.isInteger(result.records_written)
    && Number.isInteger(result.records_deactivated)
    && typeof result.finished_at === "string";
}
