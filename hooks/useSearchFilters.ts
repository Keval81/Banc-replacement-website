"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  getPropertySearchFilters,
} from "../lib/property-search/navigation";
import {
  hasActivePropertyFilters,
  parsePropertySearchParams,
} from "../lib/property-search/query";
import {
  createPropertySearchUrlController,
  type PropertySearchUrlController,
  type PropertySearchUrlSnapshot,
} from "../lib/property-search/url-controller";
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
  const [snapshot, setSnapshot] = React.useState<PropertySearchUrlSnapshot>({
    query,
    draftQuery: query,
  });
  const [controller] = React.useState<PropertySearchUrlController>(() =>
    createPropertySearchUrlController(query, {
      replace: (href) => router.replace(href, { scroll: false }),
      schedule: (callback, delay) => window.setTimeout(callback, delay),
      cancel: (timer) => window.clearTimeout(timer),
      debounceMs,
      onChange: setSnapshot,
    }),
  );

  React.useEffect(() => {
    controller.acceptUrl(query);
  }, [controller, query]);

  React.useEffect(
    () => () => controller.dispose(),
    [controller],
  );

  const setFilters = React.useCallback(
    (patch: Partial<PropertySearchFilters>) => {
      controller.patchFilters(patch);
    },
    [controller],
  );

  const clearFilters = React.useCallback(() => {
    controller.clearFilters();
  }, [controller]);

  const submitSearch = React.useCallback(() => {
    controller.submit();
  }, [controller]);

  const setPage = React.useCallback(
    (page: number) => {
      controller.setPage(page);
    },
    [controller],
  );

  return {
    query: snapshot.query,
    filters: getPropertySearchFilters(snapshot.draftQuery),
    setFilters,
    clearFilters,
    hasActiveFilters: hasActivePropertyFilters(snapshot.draftQuery),
    setPage,
    submitSearch,
  };
}
