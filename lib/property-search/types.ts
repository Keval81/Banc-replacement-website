import type {
  SearchFeature,
  SearchPropertyType,
  SearchTenure,
} from "../crm/property-source";
import type { PropertyCardData } from "../property-view";
import type { DbProperty } from "../supabase";

export type PropertyDepartment = "sales" | "lettings";
export type PublicPropertyStatus =
  | "for_sale"
  | "under_offer"
  | "to_let"
  | "let_agreed";
export type PropertySort = "default" | "price_asc" | "price_desc";

export interface PropertySearchQuery {
  department: PropertyDepartment;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  propertyTypes: SearchPropertyType[];
  tenures: SearchTenure[];
  features: SearchFeature[];
  statuses: PublicPropertyStatus[];
  sort: PropertySort;
  page: number;
  pageSize: number;
}

export type PropertySearchFilters = Omit<
  PropertySearchQuery,
  "department" | "statuses" | "page" | "pageSize"
>;

export interface PropertySearchResult {
  query: PropertySearchQuery;
  properties: PropertyCardData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  lastSyncedAt: string | null;
}

export interface PropertySearchRepositoryResult {
  rows: DbProperty[];
  total: number;
  lastSyncedAt: string | null;
}

export interface PropertySearchRepository {
  search(query: PropertySearchQuery): Promise<PropertySearchRepositoryResult>;
}

export type PropertySearch = (
  query: PropertySearchQuery,
) => Promise<PropertySearchResult>;
