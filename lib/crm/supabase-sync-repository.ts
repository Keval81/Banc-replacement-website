import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  PropertySyncRepository,
  SyncRunRecord,
} from "./property-sync.ts";
import type {
  CanonicalPropertyWriteRow,
  CrmSourceSystem,
} from "./property-source.ts";

const SOURCE_ID_BATCH_SIZE = 500;

export class SupabaseSyncRepository implements PropertySyncRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listActiveSourceIds(source: CrmSourceSystem): Promise<string[]> {
    const { data, error } = await this.client
      .from("properties")
      .select("source_id")
      .eq("source_system", source)
      .eq("is_active", true);

    if (error) {
      throw new Error(`Supabase list active property source IDs: ${error.message}`);
    }

    return (data ?? [])
      .map((row) => row.source_id)
      .filter((sourceId): sourceId is string => typeof sourceId === "string");
  }

  async upsert(rows: CanonicalPropertyWriteRow[]): Promise<number> {
    const { error } = await this.client
      .from("properties")
      .upsert(rows, { onConflict: "source_system,source_id" });

    if (error) {
      throw new Error(`Supabase upsert properties: ${error.message}`);
    }

    return rows.length;
  }

  async deactivate(
    source: CrmSourceSystem,
    sourceIds: string[],
    at: string,
  ): Promise<number> {
    let recordsDeactivated = 0;

    for (let index = 0; index < sourceIds.length; index += SOURCE_ID_BATCH_SIZE) {
      const batch = sourceIds.slice(index, index + SOURCE_ID_BATCH_SIZE);
      const { data, error } = await this.client
        .from("properties")
        .update({ is_active: false, last_synced_at: at })
        .eq("source_system", source)
        .eq("is_active", true)
        .in("source_id", batch)
        .select("source_id");

      if (error) {
        throw new Error(`Supabase deactivate missing properties: ${error.message}`);
      }

      recordsDeactivated += data?.length ?? 0;
    }

    return recordsDeactivated;
  }

  async recordRun(run: SyncRunRecord): Promise<void> {
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
      throw new Error(`Supabase record sync run: ${error.message}`);
    }
  }
}
