import {
  conversationPlanSchema,
  propertyConversationStateSchema,
  type ConversationMessage,
  type ConversationPlan,
  type PropertyConversationState,
} from "./contracts.ts";
import {
  BANC_INTENT_INSTRUCTIONS,
  BANC_RESPONSE_INSTRUCTIONS,
} from "./prompt.ts";
import type { SanitizedOperationResult } from "./tools.ts";
import {
  SEARCH_FEATURES,
  SEARCH_PROPERTY_TYPES,
  SEARCH_TENURES,
} from "../crm/property-source.ts";
import {
  MAX_PROPERTY_SEARCH_PRICE,
  POSTGRES_SIGNED_INTEGER_MAX,
  propertySearchQuerySchema,
} from "../property-search/query.ts";
import type { PropertyFacts } from "../property-facts.ts";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const MAX_INPUT_CHARACTERS = 12_000;
const MAX_MESSAGE_CHARACTERS = 2_000;
const MAX_HISTORY_MESSAGES = 12;
const MAX_HISTORY_MESSAGE_CHARACTERS = 700;
const MAX_OPERATION_RESULTS = 2;
const MAX_RESULT_ITEMS = 3;
const MAX_RESULT_SUMMARY_CHARACTERS = 800;
const MAX_RESPONSE_CANDIDATES = 8;
const INTENT_MAX_OUTPUT_TOKENS = 700;
const RESPONSE_MAX_OUTPUT_TOKENS = 400;

const planJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    primary: { $ref: "#/$defs/intent" },
    supporting: {
      anyOf: [
        { $ref: "#/$defs/supportingIntent" },
        { type: "null" },
      ],
    },
  },
  required: ["primary", "supporting"],
  $defs: {
    preserveMutation: {
      type: "object",
      additionalProperties: false,
      properties: { operation: { const: "preserve" } },
      required: ["operation"],
    },
    departmentMutation: {
      type: "object",
      additionalProperties: false,
      properties: {
        operation: { const: "set" },
        value: { type: "string", enum: ["sales", "lettings"] },
      },
      required: ["operation", "value"],
    },
    locationMutation: {
      anyOf: [
        {
          type: "object",
          additionalProperties: false,
          properties: { operation: { const: "clear" } },
          required: ["operation"],
        },
        {
          type: "object",
          additionalProperties: false,
          properties: {
            operation: { const: "set" },
            value: { type: "string", minLength: 1, maxLength: 120 },
          },
          required: ["operation", "value"],
        },
      ],
    },
    priceMutation: {
      anyOf: [
        {
          type: "object",
          additionalProperties: false,
          properties: { operation: { const: "clear" } },
          required: ["operation"],
        },
        {
          type: "object",
          additionalProperties: false,
          properties: {
            operation: { const: "set" },
            value: {
              type: "integer",
              minimum: 0,
              maximum: MAX_PROPERTY_SEARCH_PRICE,
            },
          },
          required: ["operation", "value"],
        },
      ],
    },
    countMutation: {
      anyOf: [
        {
          type: "object",
          additionalProperties: false,
          properties: { operation: { const: "clear" } },
          required: ["operation"],
        },
        {
          type: "object",
          additionalProperties: false,
          properties: {
            operation: { const: "set" },
            value: {
              type: "integer",
              minimum: 0,
              maximum: POSTGRES_SIGNED_INTEGER_MAX,
            },
          },
          required: ["operation", "value"],
        },
      ],
    },
    bedroomsMutation: {
      anyOf: [
        {
          type: "object",
          additionalProperties: false,
          properties: { operation: { const: "clear" } },
          required: ["operation"],
        },
        {
          type: "object",
          additionalProperties: false,
          properties: {
            operation: { const: "set" },
            value: {
              type: "object",
              additionalProperties: false,
              properties: {
                mode: { type: "string", enum: ["exact", "minimum"] },
                value: {
                  type: "integer",
                  minimum: 0,
                  maximum: POSTGRES_SIGNED_INTEGER_MAX,
                },
              },
              required: ["mode", "value"],
            },
          },
          required: ["operation", "value"],
        },
      ],
    },
    propertyTypeMutation: {
      anyOf: [
        {
          type: "object",
          additionalProperties: false,
          properties: { operation: { const: "clear" } },
          required: ["operation"],
        },
        {
          type: "object",
          additionalProperties: false,
          properties: {
            operation: { const: "set" },
            value: {
              type: "array",
              items: { type: "string", enum: SEARCH_PROPERTY_TYPES },
            },
          },
          required: ["operation", "value"],
        },
      ],
    },
    tenureMutation: {
      anyOf: [
        {
          type: "object",
          additionalProperties: false,
          properties: { operation: { const: "clear" } },
          required: ["operation"],
        },
        {
          type: "object",
          additionalProperties: false,
          properties: {
            operation: { const: "set" },
            value: {
              type: "array",
              items: { type: "string", enum: SEARCH_TENURES },
            },
          },
          required: ["operation", "value"],
        },
      ],
    },
    featureMutation: {
      anyOf: [
        {
          type: "object",
          additionalProperties: false,
          properties: { operation: { const: "clear" } },
          required: ["operation"],
        },
        {
          type: "object",
          additionalProperties: false,
          properties: {
            operation: { const: "set" },
            value: {
              type: "array",
              items: { type: "string", enum: SEARCH_FEATURES },
            },
          },
          required: ["operation", "value"],
        },
      ],
    },
    sortMutation: {
      anyOf: [
        {
          type: "object",
          additionalProperties: false,
          properties: { operation: { const: "clear" } },
          required: ["operation"],
        },
        {
          type: "object",
          additionalProperties: false,
          properties: {
            operation: { const: "set" },
            value: {
              type: "string",
              enum: ["default", "price_asc", "price_desc"],
            },
          },
          required: ["operation", "value"],
        },
      ],
    },
    mutation: {
      type: "object",
      additionalProperties: false,
      properties: {
        department: {
          anyOf: [
            { $ref: "#/$defs/departmentMutation" },
            { $ref: "#/$defs/preserveMutation" },
          ],
        },
        location: {
          anyOf: [
            { $ref: "#/$defs/locationMutation" },
            { $ref: "#/$defs/preserveMutation" },
          ],
        },
        minPrice: {
          anyOf: [
            { $ref: "#/$defs/priceMutation" },
            { $ref: "#/$defs/preserveMutation" },
          ],
        },
        maxPrice: {
          anyOf: [
            { $ref: "#/$defs/priceMutation" },
            { $ref: "#/$defs/preserveMutation" },
          ],
        },
        bedrooms: {
          anyOf: [
            { $ref: "#/$defs/bedroomsMutation" },
            { $ref: "#/$defs/preserveMutation" },
          ],
        },
        minBathrooms: {
          anyOf: [
            { $ref: "#/$defs/countMutation" },
            { $ref: "#/$defs/preserveMutation" },
          ],
        },
        propertyTypes: {
          anyOf: [
            { $ref: "#/$defs/propertyTypeMutation" },
            { $ref: "#/$defs/preserveMutation" },
          ],
        },
        tenures: {
          anyOf: [
            { $ref: "#/$defs/tenureMutation" },
            { $ref: "#/$defs/preserveMutation" },
          ],
        },
        features: {
          anyOf: [
            { $ref: "#/$defs/featureMutation" },
            { $ref: "#/$defs/preserveMutation" },
          ],
        },
        sort: {
          anyOf: [
            { $ref: "#/$defs/sortMutation" },
            { $ref: "#/$defs/preserveMutation" },
          ],
        },
      },
      required: [
        "department",
        "location",
        "minPrice",
        "maxPrice",
        "bedrooms",
        "minBathrooms",
        "propertyTypes",
        "tenures",
        "features",
        "sort",
      ],
    },
    updatePropertySearch: {
      type: "object",
      additionalProperties: false,
      properties: {
        type: { const: "update_property_search" },
        mutation: { $ref: "#/$defs/mutation" },
      },
      required: ["type", "mutation"],
    },
    getPropertyFacts: {
      type: "object",
      additionalProperties: false,
      properties: {
        type: { const: "get_property_facts" },
        propertyIds: {
          type: "array",
          minItems: 1,
          maxItems: 3,
          items: { type: "string", minLength: 1, maxLength: 64 },
        },
      },
      required: ["type", "propertyIds"],
    },
    searchBancKnowledge: {
      type: "object",
      additionalProperties: false,
      properties: {
        type: { const: "search_banc_knowledge" },
        query: { type: "string", minLength: 1, maxLength: 2_000 },
      },
      required: ["type", "query"],
    },
    resetConversationSearch: {
      type: "object",
      additionalProperties: false,
      properties: { type: { const: "reset_conversation_search" } },
      required: ["type"],
    },
    contactBanc: {
      type: "object",
      additionalProperties: false,
      properties: {
        type: { const: "contact_banc" },
        reason: {
          type: "string",
          enum: [
            "viewing",
            "valuation",
            "offer",
            "availability",
            "fees_finance_legal",
            "human",
          ],
        },
        propertyId: {
          anyOf: [
            { type: "string", minLength: 1, maxLength: 64 },
            { type: "null" },
          ],
        },
      },
      required: ["type", "reason", "propertyId"],
    },
    clarify: {
      type: "object",
      additionalProperties: false,
      properties: {
        type: { const: "clarify" },
        question: { type: "string", minLength: 1, maxLength: 2_000 },
      },
      required: ["type", "question"],
    },
    intent: {
      anyOf: [
        { $ref: "#/$defs/updatePropertySearch" },
        { $ref: "#/$defs/getPropertyFacts" },
        { $ref: "#/$defs/searchBancKnowledge" },
        { $ref: "#/$defs/resetConversationSearch" },
        { $ref: "#/$defs/contactBanc" },
        { $ref: "#/$defs/clarify" },
      ],
    },
    supportingIntent: {
      anyOf: [
        { $ref: "#/$defs/getPropertyFacts" },
        { $ref: "#/$defs/searchBancKnowledge" },
        { $ref: "#/$defs/contactBanc" },
      ],
    },
  },
} as const;

function createResponseJsonSchema(groundedResponses: readonly string[]) {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      response: {
        type: "string",
        enum: groundedResponses,
      },
    },
    required: ["response"],
  } as const;
}

export interface IntentSelectionInput {
  message: string;
  history: readonly ConversationMessage[];
  state: PropertyConversationState;
}

export interface ResponseWritingInput extends IntentSelectionInput {
  results: readonly SanitizedOperationResult[];
}

export type ModelFailureCategory =
  | "interpretation_invalid"
  | "model_timeout"
  | "model_unavailable"
  | "configuration_missing"
  | "rate_limited";

export type ModelPlanResult =
  | { status: "ok"; plan: ConversationPlan; providerCalls: 1 | 2 }
  | { status: ModelFailureCategory; providerCalls: 0 | 1 | 2 };

export type ModelResponseResult =
  | { status: "ok"; response: string; providerCalls: 1 }
  | {
      status: Exclude<ModelFailureCategory, "interpretation_invalid">;
      providerCalls: 0 | 1;
    };

export interface ConversationModel {
  selectPlan(
    input: IntentSelectionInput,
    signal: AbortSignal,
  ): Promise<ModelPlanResult>;
  writeResponse(
    input: ResponseWritingInput,
    signal: AbortSignal,
  ): Promise<ModelResponseResult>;
}

export interface OpenAIConversationModelOptions {
  apiKey?: string;
  model?: string;
  fetch?: typeof fetch;
}

type ProviderFailure = Exclude<ModelFailureCategory, "interpretation_invalid">;
type SanitizedPropertySearchResult = Extract<
  SanitizedOperationResult,
  { requirements: unknown }
>;

type ProviderResult =
  | { status: "ok"; value: unknown }
  | { status: ProviderFailure };

function boundedText(value: unknown, maximum: number): string {
  return typeof value === "string" ? value.slice(0, maximum) : "";
}

function sanitizeHistory(
  history: readonly ConversationMessage[],
): ConversationMessage[] {
  return history.slice(-MAX_HISTORY_MESSAGES).flatMap((message) => {
    if (message.role !== "user" && message.role !== "assistant") return [];
    const content = boundedText(message.content, MAX_HISTORY_MESSAGE_CHARACTERS);
    return content.length === 0 ? [] : [{ role: message.role, content }];
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeState(state: unknown): Record<string, unknown> | null {
  if (!isRecord(state)) return null;
  const rawResultPropertyIds = state.resultPropertyIds;
  if (!Array.isArray(rawResultPropertyIds) || rawResultPropertyIds.length > 3) {
    return null;
  }

  const rawQuery = state.query;
  let query: unknown;
  if (rawQuery !== undefined) {
    if (!isRecord(rawQuery)) return null;
    const parsedQuery = propertySearchQuerySchema.safeParse({
      department: rawQuery.department,
      location: rawQuery.location,
      minPrice: rawQuery.minPrice,
      maxPrice: rawQuery.maxPrice,
      minBedrooms: rawQuery.minBedrooms,
      maxBedrooms: rawQuery.maxBedrooms,
      minBathrooms: rawQuery.minBathrooms,
      propertyTypes: rawQuery.propertyTypes,
      tenures: rawQuery.tenures,
      features: rawQuery.features,
      statuses: rawQuery.statuses,
      sort: rawQuery.sort,
      page: rawQuery.page,
      pageSize: rawQuery.pageSize,
    });
    if (!parsedQuery.success) return null;
    query = parsedQuery.data;
  }

  const parsedState = propertyConversationStateSchema.safeParse({
    topic: state.topic,
    resultPropertyIds: rawResultPropertyIds,
    ...(state.focusedPropertyId === undefined
      ? {}
      : { focusedPropertyId: state.focusedPropertyId }),
    ...(state.resultFingerprint === undefined
      ? {}
      : { resultFingerprint: state.resultFingerprint }),
    ...(query === undefined ? {} : { query }),
  });
  return parsedState.success ? parsedState.data : null;
}

function sanitizeFacts(facts: readonly PropertyFacts[]): PropertyFacts[] {
  return facts.slice(0, MAX_RESULT_ITEMS).map((fact) => ({
    id: boundedText(fact.id, 64),
    title: boundedText(fact.title, 240),
    address: boundedText(fact.address, 240),
    department: fact.department,
    status: fact.status,
    price: fact.price,
    priceDisplay: boundedText(fact.priceDisplay, 120),
    bedrooms: fact.bedrooms,
    bathrooms: fact.bathrooms,
    receptions: fact.receptions,
    propertyType: boundedText(fact.propertyType, 80),
    tenure: fact.tenure === null ? null : boundedText(fact.tenure, 80),
    epc: fact.epc === null ? null : boundedText(fact.epc, 16),
    sqft: fact.sqft,
    features: fact.features
      .slice(0, 16)
      .map((feature) => boundedText(feature, 64)),
    summary: boundedText(fact.summary, MAX_RESULT_SUMMARY_CHARACTERS),
  }));
}

function sanitizeResults(
  results: readonly SanitizedOperationResult[],
): SanitizedOperationResult[] {
  return results.slice(0, MAX_OPERATION_RESULTS).map((result) => {
    switch (result.status) {
      case "search_results":
      case "no_results": {
        const requirements = propertySearchQuerySchema.parse({
          department: result.requirements.department,
          location: result.requirements.location,
          minPrice: result.requirements.minPrice,
          maxPrice: result.requirements.maxPrice,
          minBedrooms: result.requirements.minBedrooms,
          maxBedrooms: result.requirements.maxBedrooms,
          minBathrooms: result.requirements.minBathrooms,
          propertyTypes: result.requirements.propertyTypes,
          tenures: result.requirements.tenures,
          features: result.requirements.features,
          statuses: result.requirements.statuses,
          sort: result.requirements.sort,
          page: result.requirements.page,
          pageSize: result.requirements.pageSize,
        });
        return {
          status: result.status,
          total: result.total,
          requirements,
          properties: result.properties
            .slice(0, MAX_RESULT_ITEMS)
            .map((property) => ({
              id: boundedText(property.id, 64),
              title: boundedText(property.title, 240),
              address: boundedText(property.address, 240),
              price: boundedText(property.price, 120),
              bedrooms: property.bedrooms,
              bathrooms: property.bathrooms,
              summary: boundedText(
                property.summary,
                MAX_RESULT_SUMMARY_CHARACTERS,
              ),
            })),
        };
      }
      case "property_facts":
        return { status: "property_facts", facts: sanitizeFacts(result.facts) };
      case "knowledge":
        return {
          status: "knowledge",
          sources: result.sources
            .slice(0, MAX_RESULT_ITEMS)
            .map((source) => ({
              documentId: boundedText(source.documentId, 120),
              title: boundedText(source.title, 240),
              excerpt: boundedText(source.excerpt, 480),
            })),
        };
      case "reset":
        return { status: "reset" };
      case "contact":
        return { status: "contact", reason: result.reason };
      case "clarification_required":
        return {
          status: "clarification_required",
          question: boundedText(result.question, MAX_MESSAGE_CHARACTERS),
        };
    }
  });
}

function boundedInput(value: Record<string, unknown>): string | null {
  const recentHistory = Array.isArray(value.recentHistory)
    ? [...value.recentHistory]
    : null;
  const payload = recentHistory === null
    ? { ...value }
    : { ...value, recentHistory };

  try {
    let serialized = JSON.stringify(payload);
    while (
      serialized.length > MAX_INPUT_CHARACTERS &&
      recentHistory !== null &&
      recentHistory.length > 0
    ) {
      recentHistory.shift();
      serialized = JSON.stringify(payload);
    }
    return serialized.length <= MAX_INPUT_CHARACTERS ? serialized : null;
  } catch {
    return null;
  }
}

function buildIntentInput(input: IntentSelectionInput): string | null {
  const currentState = sanitizeState(input.state);
  if (currentState === null) return null;
  return boundedInput({
    currentMessage: boundedText(input.message, MAX_MESSAGE_CHARACTERS),
    recentHistory: sanitizeHistory(input.history),
    currentState,
  });
}

function validatePlan(value: unknown): {
  plan: ConversationPlan | null;
  issuePaths: string[];
} {
  const parsed = conversationPlanSchema.safeParse(normalizedPlanValue(value));
  if (parsed.success) return { plan: parsed.data, issuePaths: [] };

  const issuePaths = [...new Set(
    parsed.error.issues
      .map((issue) => issue.path.map(String).join("."))
      .filter((path) => path.length > 0),
  )].slice(0, 12);
  return {
    plan: null,
    issuePaths: issuePaths.length > 0 ? issuePaths : ["plan"],
  };
}

function buildRepairInput(
  input: IntentSelectionInput,
  validationIssuePaths: readonly string[],
): string | null {
  const currentState = sanitizeState(input.state);
  if (currentState === null) return null;
  return boundedInput({
    currentMessage: boundedText(input.message, MAX_MESSAGE_CHARACTERS),
    currentState,
    validationIssuePaths: validationIssuePaths
      .slice(0, 12)
      .map((path) => boundedText(path, 160)),
  });
}

function readableFilter(value: string): string {
  return value.replaceAll("_", " ");
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatActiveRequirements(
  result: SanitizedPropertySearchResult,
): string {
  const query = result.requirements;
  const filters: string[] = [];
  if (
    query.minBedrooms !== undefined &&
    query.minBedrooms === query.maxBedrooms
  ) {
    filters.push(`exactly ${query.minBedrooms} bedrooms`);
  } else {
    if (query.minBedrooms !== undefined) {
      filters.push(`at least ${query.minBedrooms} bedrooms`);
    }
    if (query.maxBedrooms !== undefined) {
      filters.push(`up to ${query.maxBedrooms} bedrooms`);
    }
  }
  if (query.minBathrooms !== undefined) {
    filters.push(`at least ${query.minBathrooms} bathrooms`);
  }
  if (query.minPrice !== undefined) {
    filters.push(`from ${formatPrice(query.minPrice)}`);
  }
  if (query.maxPrice !== undefined) {
    filters.push(`up to ${formatPrice(query.maxPrice)}`);
  }
  if (query.propertyTypes.length > 0) {
    filters.push(query.propertyTypes.map(readableFilter).join(" or "));
  }
  if (query.tenures.length > 0) {
    filters.push(query.tenures.map(readableFilter).join(" or "));
  }
  if (query.features.length > 0) {
    filters.push(`with ${query.features.map(readableFilter).join(" and ")}`);
  }

  const purpose = query.department === "sales" ? "homes to buy" : "homes to rent";
  const location = query.location === undefined ? "" : ` in ${query.location}`;
  return filters.length === 0
    ? `${purpose}${location}`
    : `${purpose}${location} with ${filters.join(" ")}`;
}

function zeroResultRelaxation(
  result: SanitizedPropertySearchResult,
): string {
  const query = result.requirements;
  if (
    query.minBedrooms !== undefined &&
    query.minBedrooms === query.maxBedrooms
  ) {
    return `try at least ${query.minBedrooms} bedrooms instead`;
  }
  if (query.features.length > 0) {
    return `remove the ${readableFilter(query.features[0])} requirement`;
  }
  if (query.maxPrice !== undefined) return "raise your maximum price";
  if (query.minPrice !== undefined) return "lower your minimum price";
  if (query.propertyTypes.length > 0) return "include more property types";
  if (query.tenures.length > 0) return "include more tenure types";
  if (query.minBedrooms !== undefined) return "reduce the minimum bedrooms";
  if (query.minBathrooms !== undefined) return "reduce the minimum bathrooms";
  if (query.location !== undefined) return "broaden the location";
  return "broaden one requirement";
}

function twoPropertyComparison(
  facts: readonly PropertyFacts[],
): string | null {
  const first = facts[0];
  const second = facts[1];
  if (first === undefined || second === undefined) return null;

  const priceComparison = first.price === second.price
    ? "both are listed at the same price"
    : `${first.price < second.price ? first.title : second.title} is lower priced`;
  const bedroomComparison = first.bedrooms === second.bedrooms
    ? `both have ${first.bedrooms} bedrooms`
    : `${first.bedrooms > second.bedrooms ? first.title : second.title} has more bedrooms`;
  const bathroomComparison = first.bathrooms === second.bathrooms
    ? `both have ${first.bathrooms} bathrooms`
    : `${first.bathrooms > second.bathrooms ? first.title : second.title} has more bathrooms`;

  const capitalizedPriceComparison =
    `${priceComparison.charAt(0).toUpperCase()}${priceComparison.slice(1)}`;
  return `${first.title} is listed at ${first.priceDisplay} with ${first.bedrooms} bedrooms and ${first.bathrooms} bathrooms, while ${second.title} is listed at ${second.priceDisplay} with ${second.bedrooms} bedrooms and ${second.bathrooms} bathrooms. ${capitalizedPriceComparison}, ${bedroomComparison}, and ${bathroomComparison}.`;
}

function responseCandidatesForResult(
  result: SanitizedOperationResult,
): string[] {
  switch (result.status) {
    case "search_results":
      return [
        `I found ${result.total} ${result.total === 1 ? "property" : "properties"} matching your current requirements.`,
      ];
    case "no_results":
      return [
        `I couldn't find any ${formatActiveRequirements(result)}. Would you like to ${zeroResultRelaxation(result)}?`,
      ];
    case "property_facts": {
      const candidates = result.facts.flatMap((fact) => {
        const details = [
          `${fact.title} is listed at ${fact.priceDisplay} with ${fact.bedrooms} bedrooms and ${fact.bathrooms} bathrooms.`,
        ];
        if (fact.epc !== null && fact.features[0] !== undefined) {
          details.push(
            `${fact.title} has an EPC rating of ${fact.epc} and features a ${fact.features[0]}.`,
          );
        } else if (fact.epc !== null) {
          details.push(`${fact.title} has an EPC rating of ${fact.epc}.`);
        } else if (fact.features[0] !== undefined) {
          details.push(`${fact.title} features a ${fact.features[0]}.`);
        }
        return details;
      });
      const comparison = twoPropertyComparison(result.facts);
      if (comparison !== null) candidates.unshift(comparison);
      return candidates.length > 0
        ? candidates
        : ["I couldn't verify those property details. Which property would you like help with?"];
    }
    case "knowledge": {
      const candidates = result.sources.map(
        (source) => `Banc guidance says: ${source.excerpt}`,
      );
      return candidates.length > 0
        ? candidates
        : ["I couldn't find approved Banc guidance for that question. What would you like help with?"];
    }
    case "reset":
      return ["I've reset your property search. What would you like to look for?"];
    case "contact":
      return ["The Banc team can help with your enquiry. Would you like their contact options?"];
    case "clarification_required":
      return [result.question];
  }
}

function isSafeResponseText(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 2_000) return false;
  if (/\b(?:https?:\/\/|www\.|mailto:|tel:)|\[[^\]]+\]\([^)]+\)/i.test(trimmed)) {
    return false;
  }
  return !/(?:\+?\d[\d\s().-]{7,}\d)/.test(trimmed);
}

function buildGroundedResponseCandidates(
  results: readonly SanitizedOperationResult[],
): string[] {
  const candidates = [...new Set(
    results
      .slice(0, MAX_OPERATION_RESULTS)
      .flatMap(responseCandidatesForResult)
      .map((candidate) => candidate.trim())
      .filter(isSafeResponseText),
  )].slice(0, MAX_RESPONSE_CANDIDATES);
  return candidates.length > 0
    ? candidates
    : ["I can help with your Banc property search. What would you like to know?"];
}

function buildResponseInput(
  input: ResponseWritingInput,
  groundedResponses: readonly string[],
  sanitizedResults: readonly SanitizedOperationResult[],
): string | null {
  const currentState = sanitizeState(input.state);
  if (currentState === null) return null;
  return boundedInput({
    currentMessage: boundedText(input.message, MAX_MESSAGE_CHARACTERS),
    recentHistory: sanitizeHistory(input.history),
    currentState,
    trustedResults: sanitizedResults,
    allowedResponses: groundedResponses,
  });
}

function extractOutputValue(payload: unknown): unknown | null {
  if (typeof payload !== "object" || payload === null) return null;
  const output = Reflect.get(payload, "output");
  if (!Array.isArray(output)) return null;

  const texts = output.flatMap((item) => {
    if (typeof item !== "object" || item === null) return [];
    const content = Reflect.get(item, "content");
    if (!Array.isArray(content)) return [];
    return content.flatMap((contentItem) => {
      if (typeof contentItem !== "object" || contentItem === null) return [];
      return Reflect.get(contentItem, "type") === "output_text" &&
        typeof Reflect.get(contentItem, "text") === "string"
        ? [Reflect.get(contentItem, "text") as string]
        : [];
    });
  });

  if (texts.length !== 1) return null;
  try {
    return JSON.parse(texts[0]);
  } catch {
    return null;
  }
}

function providerFailure(error: unknown): ProviderFailure {
  return error instanceof Error &&
      (error.name === "AbortError" || error.name === "TimeoutError")
    ? "model_timeout"
    : "model_unavailable";
}

async function requestStructuredOutput(options: {
  apiKey: string;
  model: string;
  fetcher: typeof fetch;
  instructions: string;
  input: string;
  formatName: string;
  schema: Record<string, unknown>;
  maxOutputTokens: number;
  signal: AbortSignal;
}): Promise<ProviderResult> {
  if (options.signal.aborted) return { status: "model_timeout" };

  try {
    const response = await options.fetcher(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: options.model,
        instructions: options.instructions,
        input: options.input,
        text: {
          format: {
            type: "json_schema",
            name: options.formatName,
            schema: options.schema,
            strict: true,
          },
        },
        max_output_tokens: options.maxOutputTokens,
        store: false,
      }),
      signal: options.signal,
    });

    if (response.status === 429) return { status: "rate_limited" };
    if (!response.ok) return { status: "model_unavailable" };

    let payload: unknown;
    try {
      payload = await response.clone().json();
    } catch {
      return { status: "model_unavailable" };
    }

    return { status: "ok", value: extractOutputValue(payload) };
  } catch (error) {
    return { status: providerFailure(error) };
  }
}

function normalizedPlanValue(value: unknown): unknown {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return value;
  }

  const plan = { ...value } as Record<string, unknown>;
  if (plan.supporting === null) delete plan.supporting;

  for (const key of ["primary", "supporting"] as const) {
    const rawIntent = plan[key];
    if (typeof rawIntent !== "object" || rawIntent === null) continue;
    const intent = { ...rawIntent } as Record<string, unknown>;
    if (intent.propertyId === null) delete intent.propertyId;
    if (
      intent.type === "update_property_search" &&
      typeof intent.mutation === "object" &&
      intent.mutation !== null
    ) {
      intent.mutation = Object.fromEntries(
        Object.entries(intent.mutation).filter(([, field]) =>
          typeof field !== "object" ||
          field === null ||
          Reflect.get(field, "operation") !== "preserve"
        ),
      );
    }
    plan[key] = intent;
  }

  return plan;
}

function parseResponseText(
  value: unknown,
  groundedResponses: readonly string[],
): string | null {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    Object.keys(value).length !== 1
  ) {
    return null;
  }
  const response = Reflect.get(value, "response");
  if (typeof response !== "string") return null;
  const trimmed = response.trim();
  if (!isSafeResponseText(trimmed)) return null;
  return groundedResponses.includes(trimmed) ? trimmed : null;
}

function hasConfiguration(options: OpenAIConversationModelOptions): options is {
  apiKey: string;
  model: string;
  fetch?: typeof fetch;
} {
  return typeof options.apiKey === "string" && options.apiKey.trim().length > 0 &&
    typeof options.model === "string" && options.model.trim().length > 0;
}

export function createOpenAIConversationModel(
  options: OpenAIConversationModelOptions,
): ConversationModel {
  const fetcher = options.fetch ?? globalThis.fetch;

  return {
    async selectPlan(input, signal) {
      if (signal.aborted) return { status: "model_timeout", providerCalls: 0 };
      if (!hasConfiguration(options) || typeof fetcher !== "function") {
        return { status: "configuration_missing", providerCalls: 0 };
      }
      const intentInput = buildIntentInput(input);
      if (intentInput === null) {
        return { status: "interpretation_invalid", providerCalls: 0 };
      }

      const first = await requestStructuredOutput({
        apiKey: options.apiKey,
        model: options.model,
        fetcher,
        instructions: BANC_INTENT_INSTRUCTIONS,
        input: intentInput,
        formatName: "banc_conversation_plan",
        schema: planJsonSchema,
        maxOutputTokens: INTENT_MAX_OUTPUT_TOKENS,
        signal,
      });
      if (first.status !== "ok") {
        return { status: first.status, providerCalls: 1 };
      }

      const firstValidation = validatePlan(first.value);
      if (firstValidation.plan !== null) {
        return { status: "ok", plan: firstValidation.plan, providerCalls: 1 };
      }
      if (signal.aborted) return { status: "model_timeout", providerCalls: 1 };
      const repairInput = buildRepairInput(input, firstValidation.issuePaths);
      if (repairInput === null) {
        return { status: "interpretation_invalid", providerCalls: 1 };
      }

      const repair = await requestStructuredOutput({
        apiKey: options.apiKey,
        model: options.model,
        fetcher,
        instructions: BANC_INTENT_INSTRUCTIONS,
        input: repairInput,
        formatName: "banc_conversation_plan",
        schema: planJsonSchema,
        maxOutputTokens: INTENT_MAX_OUTPUT_TOKENS,
        signal,
      });
      if (repair.status !== "ok") {
        return { status: repair.status, providerCalls: 2 };
      }

      const repairedPlan = validatePlan(repair.value).plan;
      return repairedPlan === null
        ? { status: "interpretation_invalid", providerCalls: 2 }
        : { status: "ok", plan: repairedPlan, providerCalls: 2 };
    },

    async writeResponse(input, signal) {
      if (signal.aborted) return { status: "model_timeout", providerCalls: 0 };
      if (!hasConfiguration(options) || typeof fetcher !== "function") {
        return { status: "configuration_missing", providerCalls: 0 };
      }

      let responseInput: string;
      let groundedResponses: string[];
      try {
        const sanitizedResults = sanitizeResults(input.results);
        groundedResponses = buildGroundedResponseCandidates(sanitizedResults);
        const boundedResponseInput = buildResponseInput(
          input,
          groundedResponses,
          sanitizedResults,
        );
        if (boundedResponseInput === null) {
          return { status: "model_unavailable", providerCalls: 0 };
        }
        responseInput = boundedResponseInput;
      } catch {
        return { status: "model_unavailable", providerCalls: 0 };
      }

      const result = await requestStructuredOutput({
        apiKey: options.apiKey,
        model: options.model,
        fetcher,
        instructions: BANC_RESPONSE_INSTRUCTIONS,
        input: responseInput,
        formatName: "banc_conversation_response",
        schema: createResponseJsonSchema(groundedResponses),
        maxOutputTokens: RESPONSE_MAX_OUTPUT_TOKENS,
        signal,
      });
      if (result.status !== "ok") {
        return { status: result.status, providerCalls: 1 };
      }

      const response = parseResponseText(result.value, groundedResponses);
      return response === null
        ? { status: "model_unavailable", providerCalls: 1 }
        : { status: "ok", response, providerCalls: 1 };
    },
  };
}
