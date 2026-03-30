// Supabase client for Banc Property Group
// TODO: Add credentials to .env.local:
//   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
//   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// Client-side Supabase client (uses anon key, respects RLS)
export const supabase = supabaseUrl
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Server-side Supabase client (uses service role key, bypasses RLS)
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// ============================================
// Database Types
// ============================================

export interface DbProperty {
  id: string;
  expert_agent_id?: string;
  title: string;
  address: string;
  postcode: string;
  price: number;
  price_qualifier?: string;
  status: "for_sale" | "under_offer" | "sold" | "withdrawn";
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  receptions: number;
  sqft?: number;
  description: string;
  features: string[];
  images: string[];
  epc_rating?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface DbContact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  message?: string;
  source: "valuation" | "contact" | "viewing" | "enquiry";
  property_id?: string;
  created_at: string;
}

export interface DbViewing {
  id: string;
  property_id: string;
  contact_id: string;
  date: string;
  time_slot: string;
  status: "requested" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  created_at: string;
}

export interface DbVendorAccess {
  id: string;
  user_id: string;
  property_id: string;
  role: "vendor" | "landlord";
  created_at: string;
}

export interface DbActivityFeed {
  id: string;
  property_id: string;
  type: "viewing" | "offer" | "enquiry" | "feedback" | "listing_update";
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface DbPropertyStats {
  id: string;
  property_id: string;
  rightmove_views: number;
  zoopla_views: number;
  website_views: number;
  enquiries: number;
  viewings: number;
  date: string;
}

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
