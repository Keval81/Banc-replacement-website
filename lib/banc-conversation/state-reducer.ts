import { parseBedroomIntent } from "../property-search/bedroom-intent.ts";
import {
  createDefaultPropertySearchQuery,
  propertySearchQuerySchema,
  switchSearchDepartment,
} from "../property-search/query.ts";
import type { PropertySearchQuery } from "../property-search/types.ts";
import type {
  FieldMutation,
  PropertyConversationState,
  PropertySearchMutation,
} from "./contracts.ts";

function cloneQuery(query: PropertySearchQuery): PropertySearchQuery {
  return propertySearchQuerySchema.parse({
    ...query,
    propertyTypes: [...query.propertyTypes],
    tenures: [...query.tenures],
    features: [...query.features],
    statuses: [...query.statuses],
  });
}

function applyOptionalField<K extends "location" | "minPrice" | "maxPrice" | "minBathrooms">(
  query: PropertySearchQuery,
  key: K,
  mutation: FieldMutation<PropertySearchQuery[K] & (string | number)> | undefined,
): void {
  if (mutation === undefined) return;
  if (mutation.operation === "clear") {
    delete query[key];
    return;
  }
  query[key] = mutation.value;
}

function applyBedrooms(
  query: PropertySearchQuery,
  mutation: FieldMutation<{ mode: "exact" | "minimum"; value: number }>,
): void {
  if (mutation.operation === "clear") {
    delete query.minBedrooms;
    delete query.maxBedrooms;
    return;
  }

  query.minBedrooms = mutation.value.value;
  if (mutation.value.mode === "exact") {
    query.maxBedrooms = mutation.value.value;
  } else {
    delete query.maxBedrooms;
  }
}

function queryValuesMatch(
  left: PropertySearchQuery,
  right: PropertySearchQuery,
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function applyPropertySearchMutation(
  state: PropertyConversationState,
  mutation: PropertySearchMutation,
  message: string,
): PropertyConversationState | null {
  const explicitDepartment = mutation.department?.value;
  if (state.query === undefined && explicitDepartment === undefined) {
    return null;
  }

  const currentQuery = state.query === undefined
    ? undefined
    : cloneQuery(state.query);
  let nextQuery: PropertySearchQuery;
  if (currentQuery === undefined) {
    if (explicitDepartment === undefined) return null;
    nextQuery = createDefaultPropertySearchQuery(explicitDepartment);
  } else {
    nextQuery = cloneQuery(currentQuery);
  }

  if (
    explicitDepartment !== undefined &&
    explicitDepartment !== nextQuery.department
  ) {
    nextQuery = switchSearchDepartment(nextQuery, explicitDepartment);
  }

  applyOptionalField(nextQuery, "location", mutation.location);
  applyOptionalField(nextQuery, "minPrice", mutation.minPrice);
  applyOptionalField(nextQuery, "maxPrice", mutation.maxPrice);
  applyOptionalField(nextQuery, "minBathrooms", mutation.minBathrooms);

  if (mutation.bedrooms !== undefined) {
    applyBedrooms(nextQuery, mutation.bedrooms);
  }

  if (mutation.propertyTypes !== undefined) {
    nextQuery.propertyTypes = mutation.propertyTypes.operation === "set"
      ? [...mutation.propertyTypes.value]
      : [];
  }
  if (mutation.tenures !== undefined) {
    nextQuery.tenures = mutation.tenures.operation === "set"
      ? [...mutation.tenures.value]
      : [];
  }
  if (mutation.features !== undefined) {
    nextQuery.features = mutation.features.operation === "set"
      ? [...mutation.features.value]
      : [];
  }
  if (mutation.sort !== undefined) {
    nextQuery.sort = mutation.sort.operation === "set"
      ? mutation.sort.value
      : "default";
  }

  const explicitBedrooms = parseBedroomIntent(message);
  if (explicitBedrooms.kind !== "unmatched") {
    applyBedrooms(nextQuery, {
      operation: "set",
      value: {
        mode: explicitBedrooms.kind,
        value: explicitBedrooms.value,
      },
    });
  }

  const materialChange = currentQuery === undefined ||
    !queryValuesMatch(currentQuery, nextQuery);
  if (materialChange) {
    nextQuery.page = 1;
  }
  const validatedQuery = cloneQuery(nextQuery);

  if (!materialChange) {
    return {
      ...state,
      query: validatedQuery,
      resultPropertyIds: [...state.resultPropertyIds],
    };
  }

  return {
    query: validatedQuery,
    resultPropertyIds: [],
    topic: "property_search",
  };
}

export function createResultFingerprint(
  ids: readonly string[],
  total: number,
): string {
  let fnvHash = 0x811c9dc5;
  let djbHash = 5381;
  const consume = (value: string) => {
    const framedValue = `${value.length}:${value};`;
    for (let index = 0; index < framedValue.length; index += 1) {
      const codeUnit = framedValue.charCodeAt(index);
      fnvHash = Math.imul(fnvHash ^ codeUnit, 0x01000193) >>> 0;
      djbHash = (Math.imul(djbHash, 33) ^ codeUnit) >>> 0;
    }
  };

  consume(ids.length.toString(10));
  consume(total.toString(10));
  ids.forEach(consume);

  const digest = [fnvHash, djbHash]
    .map((hash) => hash.toString(16).padStart(8, "0"))
    .join("");
  return `v1:${ids.length.toString(36)}:${total.toString(36)}:${digest}`;
}
