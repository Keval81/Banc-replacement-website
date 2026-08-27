"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  applyPropertySearchFilterPatch,
  buildPropertyResultsHref,
  getPropertySearchFilters,
} from "../lib/property-search/navigation";
import {
  createDefaultPropertySearchQuery,
  hasActivePropertyFilters,
  parsePropertySearchParams,
  propertySearchQuerySchema,
} from "../lib/property-search/query";
import type {
  PropertyDepartment,
  PropertySearchFilters,
  PropertySearchQuery,
} from "../lib/property-search/types";

interface UseSearchFiltersOptions {
  department: PropertyDepartment;
  debounceMs?: number;
}

interface UseSearchFiltersReturn {
  query: PropertySearchQuery;
  filters: PropertySearchFilters;
  setFilters: (filters: Partial<PropertySearchFilters>) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  setPage: (page: number) => void;
  submitSearch: () => void;
}

export function useSearchFilters({
  department,
  debounceMs = 300,
}: UseSearchFiltersOptions): UseSearchFiltersReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const query = React.useMemo(
    () =>
      parsePropertySearchParams(
        new URLSearchParams(searchParamsString),
        department,
      ),
    [department, searchParamsString],
  );
  const queryHref = buildPropertyResultsHref(query);
  const [draftQuery, setDraftQuery] = React.useState<PropertySearchQuery>(query);

  React.useEffect(() => {
    setDraftQuery(query);
  }, [query, queryHref]);

  const draftHref = buildPropertyResultsHref(draftQuery);
  React.useEffect(() => {
    if (draftHref === queryHref) return;

    const timer = window.setTimeout(() => {
      router.replace(draftHref, { scroll: false });
    }, debounceMs);

    return () => window.clearTimeout(timer);
  }, [debounceMs, draftHref, queryHref, router]);

  const setFilters = React.useCallback(
    (patch: Partial<PropertySearchFilters>) => {
      setDraftQuery((current) =>
        applyPropertySearchFilterPatch(current, patch),
      );
    },
    [],
  );

  const clearFilters = React.useCallback(() => {
    setDraftQuery(createDefaultPropertySearchQuery(department));
  }, [department]);

  const submitSearch = React.useCallback(() => {
    router.replace(buildPropertyResultsHref(draftQuery), { scroll: false });
  }, [draftQuery, router]);

  const setPage = React.useCallback(
    (page: number) => {
      const pagedQuery = propertySearchQuerySchema.parse({ ...query, page });
      setDraftQuery(pagedQuery);
      router.replace(buildPropertyResultsHref(pagedQuery), { scroll: false });
    },
    [query, router],
  );

  return {
    query,
    filters: getPropertySearchFilters(draftQuery),
    setFilters,
    clearFilters,
    hasActiveFilters: hasActivePropertyFilters(draftQuery),
    setPage,
    submitSearch,
  };
}
