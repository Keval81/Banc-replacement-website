import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createPropertyFactLookup as createSupabasePropertyFactLookup,
  type PropertyFactLookup,
} from "../property-facts.ts";
import { supabaseAdmin } from "../supabase.ts";
import { createPropertySearchService } from "./service.ts";
import { SupabasePropertySearchRepository } from "./supabase-repository.ts";
import type { PropertySearch } from "./types.ts";

const service = supabaseAdmin
  ? createPropertySearchService(
      new SupabasePropertySearchRepository(supabaseAdmin),
    )
  : null;

export function createPropertyFactLookup(
  client: SupabaseClient,
): PropertyFactLookup {
  return createSupabasePropertyFactLookup(client);
}

const factLookup = supabaseAdmin === null ? null : createPropertyFactLookup(supabaseAdmin);

export const searchProperties: PropertySearch = async (query, signal) => {
  if (service === null) {
    throw new Error("Property search is not configured");
  }
  return service(query, signal);
};

export const lookupPropertyFacts: PropertyFactLookup = async (ids, signal) => {
  if (factLookup === null) {
    throw new Error("Property facts are not configured");
  }
  return factLookup(ids, signal);
};
