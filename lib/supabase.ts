// Supabase client for Banc Property Group
// TODO: Add credentials to .env.local:
//   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
//   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   (server-only, see ./supabase-admin.ts)

import { createClient } from "@supabase/supabase-js";
import type {
  CrmSourceSystem,
  SearchFeature,
  SearchPropertyType,
  SearchTenure,
} from "./crm/property-source";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Client-side Supabase client (uses anon key, respects RLS)
export const supabase = supabaseUrl
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// The service-role client lives in ./supabase-admin.ts (server-only) so the
// SUPABASE_SERVICE_ROLE_KEY can never be bundled into client code.

// ============================================
// Database Types
// ============================================

export interface DbProperty {
  id: string;
  expert_agent_id?: string;
  source_system: CrmSourceSystem;
  source_id: string;
  source_updated_at?: string;
  last_synced_at: string;
  is_active: boolean;
  search_property_type: SearchPropertyType;
  search_tenure: SearchTenure;
  search_features: SearchFeature[];
  title: string;
  address: string;
  postcode: string;
  price: number;
  price_qualifier?: string;
  status: "for_sale" | "under_offer" | "sold" | "withdrawn" | "to_let" | "let_agreed" | "let";
  department: "sales" | "lettings";
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  receptions: number;
  sqft?: number;
  description: string;
  features: string[];
  images: string[];
  epc_rating?: string;
  epc_image_url: string;
  tenure: string;
  brochure_url: string;
  virtual_tour_url: string;
  rooms: Array<{ name: string; measurement: string; description: string }>;
  floorplans: string[];
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
