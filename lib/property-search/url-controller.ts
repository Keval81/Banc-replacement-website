import {
  applyPropertySearchFilterPatch,
  buildPropertyResultsHref,
} from "./navigation.ts";
import {
  createDefaultPropertySearchQuery,
  propertySearchQuerySchema,
} from "./query.ts";
import type {
  PropertySearchFilters,
  PropertySearchQuery,
} from "./types.ts";

export interface PropertySearchUrlSnapshot {
  query: PropertySearchQuery;
  draftQuery: PropertySearchQuery;
}

interface PropertySearchUrlControllerDependencies<TTimer> {
  replace: (href: string) => void;
  schedule: (callback: () => void, delay: number) => TTimer;
  cancel: (timer: TTimer) => void;
  debounceMs: number;
  onChange?: (snapshot: PropertySearchUrlSnapshot) => void;
  // Fired only when a page change actually navigates. Filter edits are
  // deliberately excluded: the URL updates while someone is still typing, and
  // moving the view then would yank the page out from under them.
  onPageNavigate?: () => void;
}

export interface PropertySearchUrlController {
  getSnapshot(): PropertySearchUrlSnapshot;
  patchFilters(patch: Partial<PropertySearchFilters>): void;
  clearFilters(): void;
  submit(): void;
  setPage(page: number): void;
  recoverOutOfRangePage(
    requestedQuery: PropertySearchQuery,
    page: number,
  ): void;
  acceptUrl(query: PropertySearchQuery): void;
  dispose(): void;
}

export function createPropertySearchUrlController<TTimer>(
  initialQuery: PropertySearchQuery,
  dependencies: PropertySearchUrlControllerDependencies<TTimer>,
): PropertySearchUrlController {
  let snapshot: PropertySearchUrlSnapshot = {
    query: initialQuery,
    draftQuery: initialQuery,
  };
  let timer: TTimer | undefined;
  const selfAuthoredHrefs: string[] = [];

  const notify = () => dependencies.onChange?.(snapshot);

  const cancelTimer = () => {
    if (timer === undefined) return;
    dependencies.cancel(timer);
    timer = undefined;
  };

  const navigate = (
    query: PropertySearchQuery,
    reason: "filters" | "page" = "filters",
  ) => {
    cancelTimer();
    const href = buildPropertyResultsHref(query);
    if (
      href === buildPropertyResultsHref(snapshot.query) ||
      selfAuthoredHrefs.includes(href)
    ) {
      return;
    }
    selfAuthoredHrefs.push(href);
    dependencies.replace(href);
    if (reason === "page") {
      dependencies.onPageNavigate?.();
    }
  };

  const scheduleDraft = () => {
    cancelTimer();
    if (
      buildPropertyResultsHref(snapshot.draftQuery) ===
      buildPropertyResultsHref(snapshot.query)
    ) {
      return;
    }
    timer = dependencies.schedule(() => {
      timer = undefined;
      navigate(snapshot.draftQuery);
    }, dependencies.debounceMs);
  };

  return {
    getSnapshot: () => snapshot,
    patchFilters: (patch) => {
      snapshot = {
        ...snapshot,
        draftQuery: applyPropertySearchFilterPatch(snapshot.draftQuery, patch),
      };
      notify();
      scheduleDraft();
    },
    clearFilters: () => {
      snapshot = {
        ...snapshot,
        draftQuery: createDefaultPropertySearchQuery(
          snapshot.draftQuery.department,
        ),
      };
      notify();
      scheduleDraft();
    },
    submit: () => navigate(snapshot.draftQuery),
    setPage: (page) => {
      const draftQuery = propertySearchQuerySchema.parse({
        ...snapshot.draftQuery,
        page,
      });
      snapshot = { ...snapshot, draftQuery };
      notify();
      navigate(draftQuery, "page");
    },
    recoverOutOfRangePage: (requestedQuery, page) => {
      const requestedHref = buildPropertyResultsHref(requestedQuery);
      if (
        buildPropertyResultsHref(snapshot.query) !== requestedHref ||
        buildPropertyResultsHref(snapshot.draftQuery) !== requestedHref
      ) {
        return;
      }

      const draftQuery = propertySearchQuerySchema.parse({
        ...requestedQuery,
        page,
      });
      snapshot = { ...snapshot, draftQuery };
      notify();
      // Deliberately not a "page" navigation: recovery is triggered by results
      // arriving after a filter edit, so moving the view here would jump the
      // page while someone is still working the filters.
      navigate(draftQuery);
    },
    acceptUrl: (query) => {
      const href = buildPropertyResultsHref(query);
      const selfAuthoredIndex = selfAuthoredHrefs.indexOf(href);
      if (selfAuthoredIndex === -1) {
        cancelTimer();
        selfAuthoredHrefs.length = 0;
        snapshot = { query, draftQuery: query };
        notify();
        return;
      }

      selfAuthoredHrefs.splice(0, selfAuthoredIndex + 1);
      snapshot = {
        query,
        draftQuery:
          buildPropertyResultsHref(snapshot.draftQuery) === href
            ? query
            : snapshot.draftQuery,
      };
      notify();
    },
    dispose: () => {
      cancelTimer();
      selfAuthoredHrefs.length = 0;
    },
  };
}
