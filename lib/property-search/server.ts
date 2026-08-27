import "server-only";

import { supabaseAdmin } from "../supabase.ts";
import { createPropertySearchService } from "./service.ts";
import { SupabasePropertySearchRepository } from "./supabase-repository.ts";
import type { PropertySearch } from "./types.ts";

const service = supabaseAdmin
  ? createPropertySearchService(
      new SupabasePropertySearchRepository(supabaseAdmin),
    )
  : null;

export const searchProperties: PropertySearch = async (query) => {
  if (service === null) {
    throw new Error("Property search is not configured");
  }
  return service(query);
};
