import {
  parseConversationPlan,
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
              uniqueItems: true,
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
              uniqueItems: true,
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
              uniqueItems: true,
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
          uniqueItems: true,
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

const responseJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    response: { type: "string", minLength: 1, maxLength: 2_000 },
  },
  required: ["response"],
} as const;

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

function sanitizeState(state: PropertyConversationState): Record<string, unknown> {
  const rawQuery = state.query;
  const query = rawQuery === undefined
    ? undefined
    : propertySearchQuerySchema.safeParse({
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

  return {
    topic: state.topic,
    resultPropertyIds: state.resultPropertyIds
      .filter((id): id is string => typeof id === "string")
      .slice(0, 3)
      .map((id) => id.slice(0, 64)),
    ...(typeof state.focusedPropertyId === "string"
      ? { focusedPropertyId: state.focusedPropertyId.slice(0, 64) }
      : {}),
    ...(typeof state.resultFingerprint === "string"
      ? { resultFingerprint: state.resultFingerprint.slice(0, 240) }
      : {}),
    ...(query?.success === true ? { query: query.data } : {}),
  };
}

function sanitizeFacts(facts: readonly PropertyFacts[]): PropertyFacts[] {
  return facts.map((fact) => ({
    id: fact.id,
    title: fact.title,
    address: fact.address,
    department: fact.department,
    status: fact.status,
    price: fact.price,
    priceDisplay: fact.priceDisplay,
    bedrooms: fact.bedrooms,
    bathrooms: fact.bathrooms,
    receptions: fact.receptions,
    propertyType: fact.propertyType,
    tenure: fact.tenure,
    epc: fact.epc,
    sqft: fact.sqft,
    features: [...fact.features],
    summary: fact.summary,
  }));
}

function sanitizeResults(
  results: readonly SanitizedOperationResult[],
): SanitizedOperationResult[] {
  return results.map((result) => {
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
          properties: result.properties.map((property) => ({
            id: property.id,
            title: property.title,
            address: property.address,
            price: property.price,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            summary: property.summary,
          })),
        };
      }
      case "property_facts":
        return { status: "property_facts", facts: sanitizeFacts(result.facts) };
      case "knowledge":
        return {
          status: "knowledge",
          sources: result.sources.map((source) => ({
            documentId: source.documentId,
            title: source.title,
            excerpt: source.excerpt,
          })),
        };
      case "reset":
        return { status: "reset" };
      case "contact":
        return { status: "contact", reason: result.reason };
      case "clarification_required":
        return {
          status: "clarification_required",
          question: result.question,
        };
    }
  });
}

function boundedInput(value: Record<string, unknown>): string {
  return JSON.stringify(value).slice(0, MAX_INPUT_CHARACTERS);
}

function buildIntentInput(input: IntentSelectionInput): string {
  return boundedInput({
    currentMessage: boundedText(input.message, MAX_MESSAGE_CHARACTERS),
    recentHistory: sanitizeHistory(input.history),
    currentState: sanitizeState(input.state),
  });
}

function buildResponseInput(input: ResponseWritingInput): string {
  return boundedInput({
    currentMessage: boundedText(input.message, MAX_MESSAGE_CHARACTERS),
    recentHistory: sanitizeHistory(input.history),
    currentState: sanitizeState(input.state),
    trustedResults: sanitizeResults(input.results),
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

function parseResponseText(value: unknown): string | null {
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
  if (trimmed.length === 0 || trimmed.length > 2_000) return null;
  if (/\b(?:https?:\/\/|www\.|mailto:|tel:)|\[[^\]]+\]\([^)]+\)/i.test(trimmed)) {
    return null;
  }
  if (/(?:\+?\d[\d\s().-]{7,}\d)/.test(trimmed)) return null;
  return trimmed;
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

      const first = await requestStructuredOutput({
        apiKey: options.apiKey,
        model: options.model,
        fetcher,
        instructions: BANC_INTENT_INSTRUCTIONS,
        input: buildIntentInput(input),
        formatName: "banc_conversation_plan",
        schema: planJsonSchema,
        maxOutputTokens: INTENT_MAX_OUTPUT_TOKENS,
        signal,
      });
      if (first.status !== "ok") {
        return { status: first.status, providerCalls: 1 };
      }

      const firstPlan = parseConversationPlan(normalizedPlanValue(first.value));
      if (firstPlan !== null) {
        return { status: "ok", plan: firstPlan, providerCalls: 1 };
      }
      if (signal.aborted) return { status: "model_timeout", providerCalls: 1 };

      const repair = await requestStructuredOutput({
        apiKey: options.apiKey,
        model: options.model,
        fetcher,
        instructions: BANC_INTENT_INSTRUCTIONS,
        input: "Validation failed. Return a corrected plan that exactly matches the supplied JSON schema. Do not repeat conversation text.",
        formatName: "banc_conversation_plan",
        schema: planJsonSchema,
        maxOutputTokens: INTENT_MAX_OUTPUT_TOKENS,
        signal,
      });
      if (repair.status !== "ok") {
        return { status: repair.status, providerCalls: 2 };
      }

      const repairedPlan = parseConversationPlan(normalizedPlanValue(repair.value));
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
      try {
        responseInput = buildResponseInput(input);
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
        schema: responseJsonSchema,
        maxOutputTokens: RESPONSE_MAX_OUTPUT_TOKENS,
        signal,
      });
      if (result.status !== "ok") {
        return { status: result.status, providerCalls: 1 };
      }

      const response = parseResponseText(result.value);
      return response === null
        ? { status: "model_unavailable", providerCalls: 1 }
        : { status: "ok", response, providerCalls: 1 };
    },
  };
}
