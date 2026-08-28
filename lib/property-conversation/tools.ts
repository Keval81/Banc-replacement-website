import {
  parseContactBancArguments,
  parseGetPropertyFactsArguments,
  parseResetPropertySearchArguments,
  parseSearchPropertiesArguments,
  propertyConversationContextSchema,
  type HandoffCategory,
  type PropertyConversationContext,
  type PropertyFacts,
} from "./contracts.ts";
import { parseBedroomIntent } from "./bedroom-intent.ts";
import {
  resolveActivePropertyReferences,
  type PropertyFactLookup,
} from "./property-facts.ts";
import {
  createDefaultPropertySearchQuery,
  propertySearchQuerySchema,
  switchSearchDepartment,
} from "../property-search/query.ts";
import type {
  PropertySearch,
  PropertySearchQuery,
} from "../property-search/types.ts";
import type { PropertyCardData } from "../property-view.ts";

export type { PropertyConversationContext, PropertyFacts };

export interface PropertyConversationTurn {
  currentMessage: string;
  context: PropertyConversationContext;
}

type PropertyConversationToolName =
  | "search_properties"
  | "get_property_facts"
  | "reset_property_search"
  | "contact_banc";

interface PropertyConversationToolsOptions {
  search: PropertySearch;
  lookupFacts: PropertyFactLookup;
}

export interface PropertyConversationToolDefinition {
  name: PropertyConversationToolName;
  description: string;
}

export type PropertyToolResult =
  | {
      ok: true;
      name: "search_properties";
      context: PropertyConversationContext;
      query: PropertySearchQuery;
      total: number;
      properties?: PropertyCardData[];
    }
  | {
      ok: true;
      name: "get_property_facts";
      context: PropertyConversationContext;
      facts: PropertyFacts[];
    }
  | {
      ok: true;
      name: "reset_property_search";
      context: PropertyConversationContext;
    }
  | {
      ok: true;
      name: "contact_banc";
      context: PropertyConversationContext;
      category: HandoffCategory;
      message: string;
    }
  | {
      ok: false;
      name: string;
      code:
        | "invalid_tool"
        | "invalid_arguments"
        | "unauthorized_property_reference"
        | "search_failed"
        | "lookup_failed";
    };

const PROPERTY_CONVERSATION_TOOL_DEFINITIONS: readonly PropertyConversationToolDefinition[] = [
  {
    name: "search_properties",
    description: "Search live Banc properties with canonical filters.",
  },
  {
    name: "get_property_facts",
    description: "Fetch sanitized facts for active Banc search results only.",
  },
  {
    name: "reset_property_search",
    description: "Clear the active conversational property-search state.",
  },
  {
    name: "contact_banc",
    description: "Return an approved Banc handoff for unsupported actions.",
  },
];

const CONTACT_BANC_COPY: Readonly<Record<HandoffCategory, string>> = {
  viewing:
    "The chatbot can't book viewings or check availability. Please contact the Banc team or call Banc on 01707 877781.",
  valuation:
    "The chatbot can't provide or submit a valuation. Please contact the Banc team or call Banc on 01707 877781.",
  offer:
    "The chatbot can't complete that transaction. Please contact the Banc team or call Banc on 01707 877781.",
  fees_finance_legal:
    "The chatbot can't advise on fees, finance, or legal matters. Please contact the Banc team or call Banc on 01707 877781.",
  human:
    "You can speak with the Banc team by calling 01707 877781 or using the contact page.",
};

function fingerprintFor(
  department: PropertySearchQuery["department"],
  ids: readonly string[],
): string {
  return `${department}:${ids.join("|")}`;
}

function preserveFocusedPropertyId(
  ids: readonly string[],
  currentFocusedPropertyId: string | undefined,
): string | undefined {
  return currentFocusedPropertyId !== undefined && ids.includes(currentFocusedPropertyId)
    ? currentFocusedPropertyId
    : undefined;
}

function applyOptionalScalarPatch<
  TKey extends "location" | "minPrice" | "maxPrice" | "minBathrooms",
>(
  query: PropertySearchQuery,
  key: TKey,
  value: PropertySearchQuery[TKey] | null | undefined,
): PropertySearchQuery {
  if (value === undefined) return query;
  if (value === null) {
    const { [key]: _removed, ...rest } = query;
    return propertySearchQuerySchema.parse(rest);
  }
  return propertySearchQuerySchema.parse({
    ...query,
    [key]: value,
  });
}

function applySearchArguments(
  currentQuery: PropertySearchQuery | undefined,
  rawArguments: ReturnType<typeof parseSearchPropertiesArguments>,
): PropertySearchQuery | null {
  if (rawArguments === null) {
    return null;
  }

  const department = rawArguments.department ?? currentQuery?.department;
  if (department === undefined) {
    return null;
  }

  let nextQuery = currentQuery === undefined
    ? createDefaultPropertySearchQuery(department)
    : switchSearchDepartment(currentQuery, department);
  nextQuery = propertySearchQuerySchema.parse(nextQuery);

  nextQuery = applyOptionalScalarPatch(nextQuery, "location", rawArguments.location);
  nextQuery = applyOptionalScalarPatch(nextQuery, "minPrice", rawArguments.minPrice);
  nextQuery = applyOptionalScalarPatch(nextQuery, "maxPrice", rawArguments.maxPrice);
  nextQuery = applyOptionalScalarPatch(
    nextQuery,
    "minBathrooms",
    rawArguments.minBathrooms,
  );

  if (rawArguments.propertyTypes !== undefined) {
    nextQuery = propertySearchQuerySchema.parse({
      ...nextQuery,
      propertyTypes: rawArguments.propertyTypes,
    });
  }
  if (rawArguments.tenures !== undefined) {
    nextQuery = propertySearchQuerySchema.parse({
      ...nextQuery,
      tenures: rawArguments.tenures,
    });
  }
  if (rawArguments.features !== undefined) {
    nextQuery = propertySearchQuerySchema.parse({
      ...nextQuery,
      features: rawArguments.features,
    });
  }
  if (rawArguments.sort !== undefined) {
    nextQuery = propertySearchQuerySchema.parse({
      ...nextQuery,
      sort: rawArguments.sort ?? "default",
    });
  }

  if (rawArguments.bedrooms !== undefined) {
    const { minBedrooms: _currentMinBedrooms, maxBedrooms: _currentMaxBedrooms, ...rest } =
      nextQuery;
    nextQuery = rawArguments.bedrooms === null
      ? propertySearchQuerySchema.parse(rest)
      : propertySearchQuerySchema.parse({
        ...rest,
        minBedrooms: rawArguments.bedrooms.value,
        ...(rawArguments.bedrooms.mode === "exact"
          ? { maxBedrooms: rawArguments.bedrooms.value }
          : {}),
      });
  }

  return nextQuery;
}

function applyCurrentMessageBedroomIntent(
  query: PropertySearchQuery,
  currentMessage: string,
): PropertySearchQuery {
  const bedroomIntent = parseBedroomIntent(currentMessage);
  if (bedroomIntent.kind === "unmatched") {
    return propertySearchQuerySchema.parse({
      ...query,
      page: 1,
      pageSize: 3,
    });
  }

  const { minBedrooms: _currentMinBedrooms, maxBedrooms: _currentMaxBedrooms, ...rest } =
    query;
  return propertySearchQuerySchema.parse({
    ...rest,
    minBedrooms: bedroomIntent.value,
    ...(bedroomIntent.kind === "exact"
      ? { maxBedrooms: bedroomIntent.value }
      : {}),
    page: 1,
    pageSize: 3,
  });
}

function normalizeTurnContext(
  context: PropertyConversationContext,
): PropertyConversationContext {
  return propertyConversationContextSchema.parse(context);
}

function mapFactsInRequestedOrder(
  requestedIds: readonly string[],
  facts: readonly PropertyFacts[],
): PropertyFacts[] | null {
  const factsById = new Map(facts.map((fact) => [fact.id, fact] as const));
  const orderedFacts = requestedIds.map((id) => factsById.get(id));
  return orderedFacts.every((fact) => fact !== undefined)
    ? orderedFacts as PropertyFacts[]
    : null;
}

export function createPropertyConversationTools(
  options: PropertyConversationToolsOptions,
) {
  return {
    definitions: [...PROPERTY_CONVERSATION_TOOL_DEFINITIONS],
    async executeTool(
      name: string,
      rawArguments: unknown,
      turn: PropertyConversationTurn,
    ): Promise<PropertyToolResult> {
      const context = normalizeTurnContext(turn.context);

      if (name === "search_properties") {
        const argumentsValue = parseSearchPropertiesArguments(rawArguments);
        if (argumentsValue === null) {
          return { ok: false, name, code: "invalid_arguments" };
        }

        let query: PropertySearchQuery;
        try {
          const currentQuery = context.query === undefined
            ? undefined
            : propertySearchQuerySchema.parse(context.query);
          const nextQuery = applySearchArguments(currentQuery, argumentsValue);
          if (nextQuery === null) {
            return { ok: false, name, code: "invalid_arguments" };
          }

          query = applyCurrentMessageBedroomIntent(
            propertySearchQuerySchema.parse({
              ...nextQuery,
              page: 1,
              pageSize: 3,
            }),
            turn.currentMessage,
          );
        } catch {
          return { ok: false, name, code: "invalid_arguments" };
        }

        try {
          const result = await options.search(query);
          const properties = result.properties.slice(0, 3);
          const resultPropertyIds = properties.map((property) => property.id);
          const resultFingerprint = fingerprintFor(query.department, resultPropertyIds);
          const focusedPropertyId = preserveFocusedPropertyId(
            resultPropertyIds,
            context.focusedPropertyId,
          );
          const nextContext = propertyConversationContextSchema.parse({
            query,
            resultPropertyIds,
            ...(focusedPropertyId === undefined ? {} : { focusedPropertyId }),
            resultFingerprint,
          });

          return {
            ok: true,
            name,
            context: nextContext,
            query,
            total: result.total,
            ...(resultFingerprint === context.resultFingerprint ? {} : {
              properties,
            }),
          };
        } catch {
          return { ok: false, name, code: "search_failed" };
        }
      }

      if (name === "get_property_facts") {
        const argumentsValue = parseGetPropertyFactsArguments(rawArguments);
        if (argumentsValue === null) {
          return { ok: false, name, code: "invalid_arguments" };
        }

        const authorizedIds = resolveActivePropertyReferences(
          context.resultPropertyIds,
          argumentsValue.propertyIds,
        );
        if (authorizedIds === null) {
          return { ok: false, name, code: "unauthorized_property_reference" };
        }

        try {
          const lookedUpFacts = await options.lookupFacts(authorizedIds);
          const orderedFacts = mapFactsInRequestedOrder(authorizedIds, lookedUpFacts);
          if (orderedFacts === null) {
            return { ok: false, name, code: "unauthorized_property_reference" };
          }

          const focusedPropertyId = authorizedIds.length === 1
            ? authorizedIds[0]
            : preserveFocusedPropertyId(
              context.resultPropertyIds,
              context.focusedPropertyId,
            );
          const nextContext = propertyConversationContextSchema.parse({
            ...context,
            ...(focusedPropertyId === undefined ? {} : { focusedPropertyId }),
          });

          return {
            ok: true,
            name,
            context: nextContext,
            facts: orderedFacts,
          };
        } catch {
          return { ok: false, name, code: "lookup_failed" };
        }
      }

      if (name === "reset_property_search") {
        if (parseResetPropertySearchArguments(rawArguments) === null) {
          return { ok: false, name, code: "invalid_arguments" };
        }

        return {
          ok: true,
          name,
          context: propertyConversationContextSchema.parse({
            resultPropertyIds: [],
          }),
        };
      }

      if (name === "contact_banc") {
        const argumentsValue = parseContactBancArguments(rawArguments);
        if (argumentsValue === null) {
          return { ok: false, name, code: "invalid_arguments" };
        }

        return {
          ok: true,
          name,
          context,
          category: argumentsValue.reason,
          message: CONTACT_BANC_COPY[argumentsValue.reason],
        };
      }

      return { ok: false, name, code: "invalid_tool" };
    },
  };
}
