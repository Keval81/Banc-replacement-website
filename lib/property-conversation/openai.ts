import { z } from "zod";

import {
  parseContactBancArguments,
  parseGetPropertyFactsArguments,
  parseModelDirective,
  parseResetPropertySearchArguments,
  parseSearchPropertiesArguments,
  propertyConversationContextSchema,
  type ContactBancArguments,
  type GetPropertyFactsArguments,
  type ModelDirective,
  type PropertyConversationContext,
  type PropertyConversationRequest,
  type ResetPropertySearchArguments,
  type SearchPropertiesArguments,
} from "./contracts.ts";
import { BANC_PROPERTY_ASSISTANT_INSTRUCTIONS } from "./prompt.ts";
import {
  SEARCH_FEATURES,
  SEARCH_PROPERTY_TYPES,
  SEARCH_TENURES,
} from "../crm/property-source.ts";
import { POSTGRES_SIGNED_INTEGER_MAX } from "../property-search/query.ts";
import type { PropertyConversationToolDefinition } from "./tools.ts";
import {
  propertyConversationToolNameSchema,
  propertyToolResultSchema,
  type PropertyToolResult,
} from "./tools.ts";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MAX_OUTPUT_TOKENS = 500;
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_TOOL_ROUNDS = 3;
const MAX_TIMEOUT_MS = 120_000;
const MAX_API_KEY_LENGTH = 512;
const MAX_MODEL_LENGTH = 200;

const INVALID_OPTIONS_MESSAGE =
  "OpenAI property conversation client options were invalid.";
const INVALID_TOOL_REQUEST_MESSAGE =
  "OpenAI property conversation tool request was invalid.";
const INVALID_RESPONSE_MESSAGE =
  "OpenAI property conversation response was invalid.";
const REQUEST_FAILED_MESSAGE =
  "OpenAI property conversation request failed.";
const REQUEST_TIMED_OUT_MESSAGE =
  "OpenAI property conversation request timed out.";
const TOOL_ROUND_LIMIT_MESSAGE =
  "OpenAI property conversation exceeded the tool round limit.";

const CLEARABLE_SEARCH_FIELDS = [
  "location",
  "minPrice",
  "maxPrice",
  "bedrooms",
  "minBathrooms",
  "propertyTypes",
  "tenures",
  "features",
  "sort",
] as const;

const exactIdentifierSchema = z.string().min(1).max(256);

const functionToolParametersByName = {
  search_properties: {
    type: "object",
    additionalProperties: false,
    properties: {
      department: {
        type: ["string", "null"],
        enum: ["sales", "lettings", null],
      },
      location: {
        type: ["string", "null"],
        minLength: 1,
        maxLength: 120,
      },
      minPrice: {
        type: ["integer", "null"],
        minimum: 0,
        maximum: Number.MAX_SAFE_INTEGER,
      },
      maxPrice: {
        type: ["integer", "null"],
        minimum: 0,
        maximum: Number.MAX_SAFE_INTEGER,
      },
      bedrooms: {
        anyOf: [
          {
            type: "object",
            additionalProperties: false,
            properties: {
              mode: {
                type: "string",
                enum: ["exact", "minimum"],
              },
              value: {
                type: "integer",
                minimum: 0,
                maximum: POSTGRES_SIGNED_INTEGER_MAX,
              },
            },
            required: ["mode", "value"],
          },
          { type: "null" },
        ],
      },
      minBathrooms: {
        type: ["integer", "null"],
        minimum: 0,
        maximum: POSTGRES_SIGNED_INTEGER_MAX,
      },
      propertyTypes: {
        type: ["array", "null"],
        items: {
          type: "string",
          enum: SEARCH_PROPERTY_TYPES,
        },
      },
      tenures: {
        type: ["array", "null"],
        items: {
          type: "string",
          enum: SEARCH_TENURES,
        },
      },
      features: {
        type: ["array", "null"],
        items: {
          type: "string",
          enum: SEARCH_FEATURES,
        },
      },
      sort: {
        type: ["string", "null"],
        enum: ["default", "price_asc", "price_desc", null],
      },
      clearFilters: {
        type: "array",
        items: {
          type: "string",
          enum: CLEARABLE_SEARCH_FIELDS,
        },
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
      "clearFilters",
    ],
  },
  get_property_facts: {
    type: "object",
    additionalProperties: false,
    properties: {
      propertyIds: {
        type: "array",
        minItems: 1,
        maxItems: 3,
        items: {
          type: "string",
          minLength: 1,
          maxLength: 64,
        },
      },
    },
    required: ["propertyIds"],
  },
  reset_property_search: {
    type: "object",
    additionalProperties: false,
    properties: {},
    required: [],
  },
  contact_banc: {
    type: "object",
    additionalProperties: false,
    properties: {
      reason: {
        type: "string",
        enum: ["viewing", "valuation", "offer", "fees_finance_legal", "human"],
      },
    },
    required: ["reason"],
  },
} as const;

const knownToolNames = new Set(Object.keys(functionToolParametersByName));

const modelFacingSearchPropertiesArgumentsSchema = z
  .object({
    department: z.enum(["sales", "lettings"]).nullable(),
    location: z.string().trim().min(1).max(120).nullable(),
    minPrice: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).nullable(),
    maxPrice: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).nullable(),
    bedrooms: z
      .object({
        mode: z.enum(["exact", "minimum"]),
        value: z.number().int().min(0).max(POSTGRES_SIGNED_INTEGER_MAX),
      })
      .strict()
      .nullable(),
    minBathrooms: z.number().int().min(0).max(POSTGRES_SIGNED_INTEGER_MAX).nullable(),
    propertyTypes: z.array(z.enum(SEARCH_PROPERTY_TYPES)).nullable(),
    tenures: z.array(z.enum(SEARCH_TENURES)).nullable(),
    features: z.array(z.enum(SEARCH_FEATURES)).nullable(),
    sort: z.enum(["default", "price_asc", "price_desc"]).nullable(),
    clearFilters: z
      .array(z.enum(CLEARABLE_SEARCH_FIELDS))
      .transform((fields) => [...new Set(fields)] as Array<(typeof CLEARABLE_SEARCH_FIELDS)[number]>),
  })
  .strict()
  .superRefine((value, context) => {
    for (const field of value.clearFilters) {
      if (value[field] !== null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: "Clear filters must pair with null values",
        });
      }
    }
  });

const functionCallItemSchema = z
  .object({
    id: exactIdentifierSchema,
    type: z.literal("function_call"),
    status: z.literal("completed"),
    call_id: exactIdentifierSchema,
    name: exactIdentifierSchema,
    arguments: z.string(),
  })
  .passthrough();

const reasoningItemSchema = z
  .object({
    id: exactIdentifierSchema,
    type: z.literal("reasoning"),
    status: z.literal("completed").optional(),
    summary: z.array(z.unknown()),
    encrypted_content: z.string().min(1).nullable().optional(),
  })
  .passthrough();

const outputTextContentItemSchema = z
  .object({
    type: z.literal("output_text"),
    text: z.string(),
  })
  .passthrough();

const messageItemSchema = z
  .object({
    id: exactIdentifierSchema,
    type: z.literal("message"),
    status: z.literal("completed"),
    role: z.literal("assistant"),
    content: z.array(outputTextContentItemSchema),
  })
  .passthrough();

const responseOutputItemSchema = z.union([
  reasoningItemSchema,
  functionCallItemSchema,
  messageItemSchema,
]);

const responsesPayloadSchema = z
  .object({
    status: z.literal("completed"),
    incomplete_details: z.null().optional(),
    output: z.array(responseOutputItemSchema),
  })
  .passthrough();

interface OpenAIPropertyConversationToolTurn {
  currentMessage: string;
  context: PropertyConversationContext;
}

interface OpenAIPropertyConversationTools {
  definitions: readonly PropertyConversationToolDefinition[];
  executeTool: (
    name: string,
    rawArguments:
      | SearchPropertiesArguments
      | GetPropertyFactsArguments
      | ResetPropertySearchArguments
      | ContactBancArguments,
    turn: OpenAIPropertyConversationToolTurn,
  ) => Promise<PropertyToolResult>;
}

export interface OpenAIPropertyConversationOptions {
  apiKey: string;
  model: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
  maxToolRounds?: number;
}

export interface OpenAIPropertyConversationRunInput {
  request: PropertyConversationRequest;
  tools: OpenAIPropertyConversationTools;
}

export interface OpenAIPropertyConversationResult {
  directive: ModelDirective;
  context: PropertyConversationContext;
}

type FunctionCallItem = z.infer<typeof functionCallItemSchema>;
type ResponsesPayload = z.infer<typeof responsesPayloadSchema>;
type ResponseOutputItem = z.infer<typeof responseOutputItemSchema>;

interface FunctionCallOutputItem {
  type: "function_call_output";
  call_id: string;
  output: string;
}

type ConversationInputItem = Record<string, unknown>;

interface ValidatedOpenAIPropertyConversationOptions {
  apiKey: string;
  model: string;
  fetcher: typeof fetch;
  timeoutMs: number;
  maxToolRounds: number;
}

function validateOptions(
  options: OpenAIPropertyConversationOptions,
): ValidatedOpenAIPropertyConversationOptions {
  const fetcher = options.fetcher ?? fetch;

  if (
    typeof options.apiKey !== "string" ||
    options.apiKey.length === 0 ||
    options.apiKey.length > MAX_API_KEY_LENGTH ||
    options.apiKey.trim() !== options.apiKey ||
    typeof options.model !== "string" ||
    options.model.length === 0 ||
    options.model.length > MAX_MODEL_LENGTH ||
    options.model.trim() !== options.model ||
    typeof fetcher !== "function"
  ) {
    throw new Error(INVALID_OPTIONS_MESSAGE);
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxToolRounds = options.maxToolRounds ?? DEFAULT_MAX_TOOL_ROUNDS;
  if (
    !Number.isSafeInteger(timeoutMs) ||
    timeoutMs < 1 ||
    timeoutMs > MAX_TIMEOUT_MS ||
    !Number.isSafeInteger(maxToolRounds) ||
    maxToolRounds < 1 ||
    maxToolRounds > DEFAULT_MAX_TOOL_ROUNDS
  ) {
    throw new Error(INVALID_OPTIONS_MESSAGE);
  }

  return {
    apiKey: options.apiKey,
    model: options.model,
    fetcher,
    timeoutMs,
    maxToolRounds,
  };
}

function buildConversationInput(
  request: PropertyConversationRequest,
): ConversationInputItem[] {
  const context = propertyConversationContextSchema.parse(
    request.context ?? { resultPropertyIds: [] },
  );

  return [
    ...request.history.map((message) => ({
      role: message.role,
      content: [{
        type: message.role === "assistant" ? "output_text" : "input_text",
        text: message.content,
      }],
    })),
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: `Conversation context JSON:\n${JSON.stringify(context)}`,
        },
        {
          type: "input_text",
          text: `Visitor message:\n${request.message}`,
        },
      ],
    },
  ];
}

function buildResponsesTools(
  definitions: readonly PropertyConversationToolDefinition[],
): Array<Record<string, unknown>> {
  return definitions.map((definition) => {
    if (!knownToolNames.has(definition.name)) {
      throw new Error(INVALID_TOOL_REQUEST_MESSAGE);
    }

    return {
      type: "function",
      name: definition.name,
      description: definition.description,
      strict: true,
      parameters:
        functionToolParametersByName[
          definition.name as keyof typeof functionToolParametersByName
        ],
    };
  });
}

function parseCompletedResponsePayload(payload: unknown): ResponsesPayload {
  const parsed = responsesPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }
  return parsed.data;
}

function extractDirective(output: readonly ResponseOutputItem[]): ModelDirective {
  const outputTexts = output.flatMap((item) =>
    item.type !== "message"
      ? []
      : item.content.map((contentItem) => contentItem.text)
  );

  if (outputTexts.length !== 1) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  let directiveValue: unknown;
  try {
    directiveValue = JSON.parse(outputTexts[0]);
  } catch {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  const directive = parseModelDirective(directiveValue);
  if (directive === null) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  return directive;
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }
}

async function postResponsesRequest(
  fetcher: typeof fetch,
  options: ReturnType<typeof validateOptions>,
  body: Record<string, unknown>,
): Promise<ResponsesPayload> {
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), options.timeoutMs);

  try {
    const response = await fetcher(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new Error(REQUEST_FAILED_MESSAGE);
    }

    return parseCompletedResponsePayload(await parseJsonResponse(response));
  } catch (error) {
    if (abortController.signal.aborted) {
      throw new Error(REQUEST_TIMED_OUT_MESSAGE);
    }
    if (error instanceof Error && error.message === INVALID_RESPONSE_MESSAGE) {
      throw error;
    }
    throw new Error(REQUEST_FAILED_MESSAGE);
  } finally {
    clearTimeout(timeoutId);
  }
}

function assertValidFunctionCall(
  functionCall: FunctionCallItem,
  seenCallIds: Set<string>,
  approvedToolNames: Set<string>,
): void {
  if (
    functionCall.call_id.trim() !== functionCall.call_id ||
    functionCall.name.trim() !== functionCall.name ||
    seenCallIds.has(functionCall.call_id) ||
    !approvedToolNames.has(functionCall.name)
  ) {
    throw new Error(INVALID_TOOL_REQUEST_MESSAGE);
  }

  seenCallIds.add(functionCall.call_id);
}

function translateModelFacingSearchArguments(
  rawArguments: unknown,
): SearchPropertiesArguments {
  const parsed = modelFacingSearchPropertiesArgumentsSchema.safeParse(rawArguments);
  if (!parsed.success) {
    throw new Error(INVALID_TOOL_REQUEST_MESSAGE);
  }

  const clearFilters = new Set(parsed.data.clearFilters);
  const translated = {
    ...(parsed.data.department === null ? {} : { department: parsed.data.department }),
    ...(clearFilters.has("location")
      ? { location: null }
      : parsed.data.location === null
        ? {}
        : { location: parsed.data.location }),
    ...(clearFilters.has("minPrice")
      ? { minPrice: null }
      : parsed.data.minPrice === null
        ? {}
        : { minPrice: parsed.data.minPrice }),
    ...(clearFilters.has("maxPrice")
      ? { maxPrice: null }
      : parsed.data.maxPrice === null
        ? {}
        : { maxPrice: parsed.data.maxPrice }),
    ...(clearFilters.has("bedrooms")
      ? { bedrooms: null }
      : parsed.data.bedrooms === null
        ? {}
        : { bedrooms: parsed.data.bedrooms }),
    ...(clearFilters.has("minBathrooms")
      ? { minBathrooms: null }
      : parsed.data.minBathrooms === null
        ? {}
        : { minBathrooms: parsed.data.minBathrooms }),
    ...(clearFilters.has("propertyTypes")
      ? { propertyTypes: [] }
      : parsed.data.propertyTypes === null
        ? {}
        : { propertyTypes: parsed.data.propertyTypes }),
    ...(clearFilters.has("tenures")
      ? { tenures: [] }
      : parsed.data.tenures === null
        ? {}
        : { tenures: parsed.data.tenures }),
    ...(clearFilters.has("features")
      ? { features: [] }
      : parsed.data.features === null
        ? {}
        : { features: parsed.data.features }),
    ...(clearFilters.has("sort")
      ? { sort: null }
      : parsed.data.sort === null
        ? {}
        : { sort: parsed.data.sort }),
  };

  const internalArguments = parseSearchPropertiesArguments(translated);
  if (internalArguments === null) {
    throw new Error(INVALID_TOOL_REQUEST_MESSAGE);
  }

  return internalArguments;
}

function parseToolArguments(
  functionCall: FunctionCallItem,
):
  | SearchPropertiesArguments
  | GetPropertyFactsArguments
  | ResetPropertySearchArguments
  | ContactBancArguments {
  let decodedArguments: unknown;
  try {
    decodedArguments = JSON.parse(functionCall.arguments);
  } catch {
    throw new Error(INVALID_TOOL_REQUEST_MESSAGE);
  }

  if (functionCall.name === "search_properties") {
    return translateModelFacingSearchArguments(decodedArguments);
  }
  if (functionCall.name === "get_property_facts") {
    const parsed = parseGetPropertyFactsArguments(decodedArguments);
    if (parsed === null) throw new Error(INVALID_TOOL_REQUEST_MESSAGE);
    return parsed;
  }
  if (functionCall.name === "reset_property_search") {
    const parsed = parseResetPropertySearchArguments(decodedArguments);
    if (parsed === null) throw new Error(INVALID_TOOL_REQUEST_MESSAGE);
    return parsed;
  }
  if (functionCall.name === "contact_banc") {
    const parsed = parseContactBancArguments(decodedArguments);
    if (parsed === null) throw new Error(INVALID_TOOL_REQUEST_MESSAGE);
    return parsed;
  }

  throw new Error(INVALID_TOOL_REQUEST_MESSAGE);
}

function validateToolResult(
  result: unknown,
  invokedToolName: string,
): PropertyToolResult {
  const parsed = propertyToolResultSchema.safeParse(result);
  if (!parsed.success || parsed.data.name !== invokedToolName) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  return parsed.data as PropertyToolResult;
}

async function executeValidatedTool(
  tools: OpenAIPropertyConversationTools,
  functionCall: FunctionCallItem,
  rawArguments:
    | SearchPropertiesArguments
    | GetPropertyFactsArguments
    | ResetPropertySearchArguments
    | ContactBancArguments,
  currentMessage: string,
  context: PropertyConversationContext,
): Promise<{ result: PropertyToolResult; serializedResult: string }> {
  let rawResult: unknown;

  try {
    rawResult = await tools.executeTool(functionCall.name, rawArguments, {
      currentMessage,
      context,
    });
  } catch {
    rawResult = {
      ok: false,
      name: functionCall.name,
      code: "tool_failed",
    };
  }

  const result = validateToolResult(rawResult, functionCall.name);
  let serializedResult: string;
  try {
    serializedResult = JSON.stringify(result);
  } catch {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  return { result, serializedResult };
}

function normalizeNextContext(
  toolResult: PropertyToolResult,
  currentContext: PropertyConversationContext,
): PropertyConversationContext {
  if (toolResult.ok !== true) {
    return currentContext;
  }

  return propertyConversationContextSchema.parse(toolResult.context);
}

function appendToolExchange(
  input: ConversationInputItem[],
  modelOutputItems: readonly ResponseOutputItem[],
  toolOutputs: readonly FunctionCallOutputItem[],
): ConversationInputItem[] {
  return [
    ...input,
    ...modelOutputItems.map((item) => ({ ...item })),
    ...toolOutputs.map((item) => ({ ...item })),
  ];
}

export function createOpenAIPropertyConversationClient(
  options: OpenAIPropertyConversationOptions,
) {
  const validatedOptions = validateOptions(options);

  return async function runOpenAIPropertyConversation(
    input: OpenAIPropertyConversationRunInput,
  ): Promise<OpenAIPropertyConversationResult> {
    const approvedToolNames = new Set(input.tools.definitions.map((tool) => tool.name));
    const responsesTools = buildResponsesTools(input.tools.definitions);
    const seenCallIds = new Set<string>();
    let context: PropertyConversationContext = propertyConversationContextSchema.parse(
      input.request.context ?? { resultPropertyIds: [] },
    );
    let conversationInput = buildConversationInput(input.request);

    for (let round = 0; round < validatedOptions.maxToolRounds; round += 1) {
      const payload = await postResponsesRequest(validatedOptions.fetcher, validatedOptions, {
        model: validatedOptions.model,
        instructions: BANC_PROPERTY_ASSISTANT_INSTRUCTIONS,
        input: conversationInput,
        include: ["reasoning.encrypted_content"],
        tools: responsesTools,
        tool_choice: "auto",
        max_output_tokens: DEFAULT_MAX_OUTPUT_TOKENS,
        store: false,
      });

      const functionCalls = payload.output.filter(
        (item): item is FunctionCallItem => item.type === "function_call",
      );

      if (functionCalls.length === 0) {
        return {
          directive: extractDirective(payload.output),
          context,
        };
      }

      const toolOutputs: FunctionCallOutputItem[] = [];
      for (const functionCall of functionCalls) {
        assertValidFunctionCall(functionCall, seenCallIds, approvedToolNames);
        const parsedArguments = parseToolArguments(functionCall);
        const execution = await executeValidatedTool(
          input.tools,
          functionCall,
          parsedArguments,
          input.request.message,
          context,
        );
        context = normalizeNextContext(execution.result, context);
        toolOutputs.push({
          type: "function_call_output",
          call_id: functionCall.call_id,
          output: execution.serializedResult,
        });
      }

      conversationInput = appendToolExchange(
        conversationInput,
        payload.output,
        toolOutputs,
      );

      if (round === validatedOptions.maxToolRounds - 1) {
        throw new Error(TOOL_ROUND_LIMIT_MESSAGE);
      }
    }

    throw new Error(TOOL_ROUND_LIMIT_MESSAGE);
  };
}
