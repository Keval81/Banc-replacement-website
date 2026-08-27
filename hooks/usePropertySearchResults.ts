"use client";

import * as React from "react";

import {
  buildPropertyApiHref,
  fetchPropertySearchResults,
  getLastValidPropertyPage,
  PROPERTY_SEARCH_UNAVAILABLE_MESSAGE,
  type PropertySearchFetch,
} from "../lib/property-search/navigation.ts";
import type {
  PropertySearchQuery,
  PropertySearchResult,
} from "../lib/property-search/types.ts";

export interface PropertySearchResultsState {
  result: PropertySearchResult | null;
  isLoading: boolean;
  error: string | null;
}

interface StartPropertySearchRequestOptions {
  query: PropertySearchQuery;
  fetcher: PropertySearchFetch;
  onResult: (result: PropertySearchResult) => void;
  onError: (message: string) => void;
  onOutOfRangePage?: (page: number) => void;
}

export function startPropertySearchRequest({
  query,
  fetcher,
  onResult,
  onError,
  onOutOfRangePage,
}: StartPropertySearchRequestOptions): () => void {
  const controller = new AbortController();

  void fetchPropertySearchResults(fetcher, query, {
    signal: controller.signal,
  })
    .then((result) => {
      if (controller.signal.aborted) return;

      const recoveryPage = getLastValidPropertyPage(query, result);
      if (recoveryPage !== null && onOutOfRangePage) {
        onOutOfRangePage(recoveryPage);
        return;
      }

      onResult(result);
    })
    .catch((error: unknown) => {
      if (controller.signal.aborted) return;
      onError(
        error instanceof Error
          ? error.message
          : PROPERTY_SEARCH_UNAVAILABLE_MESSAGE,
      );
    });

  return () => controller.abort();
}

export function usePropertySearchResults(
  query: PropertySearchQuery,
  options: { onOutOfRangePage?: (page: number) => void } = {},
): {
  result: PropertySearchResult | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
} {
  const [state, setState] = React.useState<PropertySearchResultsState>({
    result: null,
    isLoading: true,
    error: null,
  });
  const [retryVersion, setRetryVersion] = React.useState(0);
  const onOutOfRangePageRef = React.useRef(options.onOutOfRangePage);
  onOutOfRangePageRef.current = options.onOutOfRangePage;
  const serializedQuery = buildPropertyApiHref(query);

  React.useEffect(() => {
    setState((current) => ({
      result: current.result,
      isLoading: true,
      error: null,
    }));

    return startPropertySearchRequest({
      query,
      fetcher: fetch,
      onResult: (result) => {
        setState({ result, isLoading: false, error: null });
      },
      onError: (error) => {
        setState((current) => ({
          result: current.result,
          isLoading: false,
          error,
        }));
      },
      onOutOfRangePage: (page) => {
        onOutOfRangePageRef.current?.(page);
      },
    });
  // The canonical serialized query is the request identity; object references are not.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serializedQuery, retryVersion]);

  const retry = React.useCallback(() => {
    setRetryVersion((version) => version + 1);
  }, []);

  return { ...state, retry };
}
