import type { PropertyFactLookup, PropertyFacts } from "../property-facts.ts";
import type {
  PropertySearch,
  PropertySearchQuery,
  PropertySearchResult,
} from "../property-search/types.ts";

export interface PropertyPortfolio {
  search(query: PropertySearchQuery): Promise<PropertySearchResult>;
  getFacts(ids: string[]): Promise<PropertyFacts[]>;
}

export function createPropertyPortfolio(dependencies: {
  search: PropertySearch;
  getFacts: PropertyFactLookup;
}): PropertyPortfolio {
  return {
    search: dependencies.search,
    getFacts: dependencies.getFacts,
  };
}
