import { dbToCard } from "../property-view.ts";
import { propertySearchQuerySchema } from "./query.ts";
import type {
  PropertySearch,
  PropertySearchRepository,
  PropertySearchRepositoryResult,
} from "./types.ts";

export type { PropertySearchRepository, PropertySearchRepositoryResult };

export function createPropertySearchService(
  repository: PropertySearchRepository,
): PropertySearch {
  return async (untrustedQuery, signal) => {
    signal?.throwIfAborted();
    const query = propertySearchQuerySchema.parse(untrustedQuery);
    const result = await repository.search(query, signal);

    return {
      query,
      properties: result.rows.map(dbToCard),
      total: result.total,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.ceil(result.total / query.pageSize),
      lastSyncedAt: result.lastSyncedAt,
    };
  };
}
