import "server-only";

// Server-side Supabase client (uses the service role key, bypasses RLS).
// Never import this from a client component; `server-only` enforces that at
// build time. Types stay in ./supabase.ts.

import { createClient } from "@supabase/supabase-js";
import type {
  DbActivityFeed,
  DbContact,
  DbProperty,
  DbPropertyStats,
} from "./supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// ============================================
// Database Helpers
// ============================================

export async function getProperties(filters?: {
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  propertyType?: string;
  limit?: number;
}): Promise<DbProperty[]> {
  if (!supabaseAdmin) {
    console.warn("Supabase not configured — returning empty properties");
    return [];
  }

  let query = supabaseAdmin.from("properties").select("*");

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.minPrice) query = query.gte("price", filters.minPrice);
  if (filters?.maxPrice) query = query.lte("price", filters.maxPrice);
  if (filters?.minBeds) query = query.gte("bedrooms", filters.minBeds);
  if (filters?.propertyType) query = query.eq("property_type", filters.propertyType);
  if (filters?.limit) query = query.limit(filters.limit);

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Supabase getProperties error:", error);
    return [];
  }

  return data ?? [];
}

export async function getPropertyById(id: string): Promise<DbProperty | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function saveContact(contact: Omit<DbContact, "id" | "created_at">): Promise<string | null> {
  if (!supabaseAdmin) {
    console.warn("Supabase not configured — contact not saved");
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from("contacts")
    .insert(contact)
    .select("id")
    .single();

  if (error) {
    console.error("Supabase saveContact error:", error);
    return null;
  }

  return data?.id ?? null;
}

// TODO: currently unused. Before wiring into the vendor portal, take an explicit
// `userId` and check `vendor_access` so a vendor can only read their own listing.
export async function getVendorActivity(propertyId: string): Promise<DbActivityFeed[]> {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from("vendor_activity_feed")
    .select("*")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return [];
  return data ?? [];
}

// TODO: currently unused. Same as getVendorActivity — require `userId` and
// verify vendor access before exposing performance stats.
export async function getPropertyStats(propertyId: string): Promise<DbPropertyStats[]> {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from("property_performance_stats")
    .select("*")
    .eq("property_id", propertyId)
    .order("date", { ascending: false })
    .limit(30);

  if (error) return [];
  return data ?? [];
}
