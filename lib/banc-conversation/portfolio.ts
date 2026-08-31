import type { PropertyFactLookup, PropertyFacts } from "../property-facts.ts";
import type {
  PropertySearch,
  PropertySearchQuery,
  PropertySearchResult,
} from "../property-search/types.ts";

export interface PropertyPortfolio {
  search(
    query: PropertySearchQuery,
    signal?: AbortSignal,
  ): Promise<PropertySearchResult>;
  getFacts(ids: string[], signal?: AbortSignal): Promise<PropertyFacts[]>;
}

export function createPropertyPortfolio(dependencies: {
  search: PropertySearch;
  getFacts: PropertyFactLookup;
}): PropertyPortfolio {
  return {
    search: (query, signal) => dependencies.search(query, signal),
    getFacts: (ids, signal) => dependencies.getFacts(ids, signal),
  };
}
