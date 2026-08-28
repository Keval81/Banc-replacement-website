import { z } from "zod";

import {
  contactBancArgumentsSchema,
  getPropertyFactsArgumentsSchema,
  modelDirectiveSchema,
  propertyConversationContextSchema,
  type ModelDirective,
  type PropertyConversationContext,
  type PropertyConversationRequest,
} from "./contracts.ts";
import { BANC_PROPERTY_ASSISTANT_INSTRUCTIONS } from "./prompt.ts";
import {
  resetPropertySearchArgumentsSchema,
  searchPropertiesArgumentsSchema,
} from "./contracts.ts";
import {
  SEARCH_FEATURES,
  SEARCH_PROPERTY_TYPES,
  SEARCH_TENURES,
} from "../crm/property-source.ts";
import { POSTGRES_SIGNED_INTEGER_MAX } from "../property-search/query.ts";
import type {
  PropertyConversationToolDefinition,
  PropertyToolResult,
} from "./tools.ts";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MAX_OUTPUT_TOKENS = 500;
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_TOOL_ROUNDS = 3;

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

const functionToolParametersByName = {
  search_properties: {
    type: "object",
    additionalProperties: false,
    properties: {
      department: {
        type: "string",
        enum: ["sales", "lettings"],
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
        type: "array",
        items: {
          type: "string",
          enum: SEARCH_PROPERTY_TYPES,
        },
      },
      tenures: {
        type: "array",
        items: {
          type: "string",
          enum: SEARCH_TENURES,
        },
      },
      features: {
        type: "array",
        items: {
          type: "string",
          enum: SEARCH_FEATURES,
        },
      },
      sort: {
        type: ["string", "null"],
        enum: ["default", "price_asc", "price_desc", null],
      },
    },
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

const functionCallItemSchema = z
  .object({
    type: z.literal("function_call"),
    call_id: z.string().trim().min(1),
    name: z.string().trim().min(1),
    arguments: z.string(),
  })
  .passthrough();

const messageContentItemSchema = z
  .object({
    type: z.string(),
    text: z.string().optional(),
  })
  .passthrough();

const messageItemSchema = z
  .object({
    type: z.literal("message"),
    content: z.array(messageContentItemSchema),
  })
  .passthrough();

const responsesPayloadSchema = z
  .object({
    output: z.array(z.union([functionCallItemSchema, messageItemSchema])),
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
    rawArguments: unknown,
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

interface FunctionCallOutputItem {
  type: "function_call_output";
  call_id: string;
  output: string;
}

type ConversationInputItem =
  | Record<string, unknown>
  | FunctionCallItem
  | FunctionCallOutputItem;

interface SanitizedThrownToolResult {
  ok: false;
  name: string;
  code: "tool_failed";
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
      content: [{ type: "input_text", text: message.content }],
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

function extractDirective(payload: unknown): ModelDirective {
  const parsedResponse = responsesPayloadSchema.safeParse(payload);
  if (!parsedResponse.success) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  const outputTexts = parsedResponse.data.output.flatMap((item) =>
    item.type !== "message"
      ? []
      : item.content.flatMap((contentItem) =>
        contentItem.type === "output_text" && typeof contentItem.text === "string"
          ? [contentItem.text]
          : []
      )
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

  const directive = modelDirectiveSchema.safeParse(directiveValue);
  if (!directive.success) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  return directive.data;
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
  options: OpenAIPropertyConversationOptions,
  body: Record<string, unknown>,
): Promise<unknown> {
  const abortController = new AbortController();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

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

    return await parseJsonResponse(response);
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
  if (seenCallIds.has(functionCall.call_id) || !approvedToolNames.has(functionCall.name)) {
    throw new Error(INVALID_TOOL_REQUEST_MESSAGE);
  }
  seenCallIds.add(functionCall.call_id);
}

function parseFunctionArguments(functionCall: FunctionCallItem): unknown {
  try {
    return JSON.parse(functionCall.arguments);
  } catch {
    throw new Error(INVALID_TOOL_REQUEST_MESSAGE);
  }
}

async function executeToolSafely(
  tools: OpenAIPropertyConversationTools,
  functionCall: FunctionCallItem,
  rawArguments: unknown,
  currentMessage: string,
  context: PropertyConversationContext,
): Promise<PropertyToolResult | SanitizedThrownToolResult> {
  try {
    return await tools.executeTool(functionCall.name, rawArguments, {
      currentMessage,
      context,
    });
  } catch {
    return {
      ok: false,
      name: functionCall.name,
      code: "tool_failed",
    };
  }
}

function normalizeNextContext(
  toolResult: PropertyToolResult | SanitizedThrownToolResult,
  currentContext: PropertyConversationContext,
): PropertyConversationContext {
  if (toolResult.ok !== true || !("context" in toolResult)) {
    return currentContext;
  }

  const parsedContext = propertyConversationContextSchema.safeParse(toolResult.context);
  if (!parsedContext.success) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  return parsedContext.data;
}

function appendToolExchange(
  input: ConversationInputItem[],
  functionCall: FunctionCallItem,
  toolResult: PropertyToolResult | SanitizedThrownToolResult,
): ConversationInputItem[] {
  const outputItem: FunctionCallOutputItem = {
    type: "function_call_output",
    call_id: functionCall.call_id,
    output: JSON.stringify(toolResult),
  };

  return [...input, functionCall, outputItem];
}

export function createOpenAIPropertyConversationClient(
  options: OpenAIPropertyConversationOptions,
) {
  const fetcher = options.fetcher ?? fetch;
  const maxToolRounds = options.maxToolRounds ?? DEFAULT_MAX_TOOL_ROUNDS;

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

    for (let round = 0; round < maxToolRounds; round += 1) {
      const payload = await postResponsesRequest(fetcher, options, {
        model: options.model,
        instructions: BANC_PROPERTY_ASSISTANT_INSTRUCTIONS,
        input: conversationInput,
        tools: responsesTools,
        tool_choice: "auto",
        max_output_tokens: DEFAULT_MAX_OUTPUT_TOKENS,
        store: false,
      });

      const parsedResponse = responsesPayloadSchema.safeParse(payload);
      if (!parsedResponse.success) {
        throw new Error(INVALID_RESPONSE_MESSAGE);
      }

      const functionCalls = parsedResponse.data.output.filter(
        (item): item is FunctionCallItem => item.type === "function_call",
      );

      if (functionCalls.length === 0) {
        return {
          directive: extractDirective(payload),
          context,
        };
      }

      for (const functionCall of functionCalls) {
        assertValidFunctionCall(functionCall, seenCallIds, approvedToolNames);
        const rawArguments = parseFunctionArguments(functionCall);
        const toolResult = await executeToolSafely(
          input.tools,
          functionCall,
          rawArguments,
          input.request.message,
          context,
        );
        context = normalizeNextContext(toolResult, context);
        conversationInput = appendToolExchange(
          conversationInput,
          functionCall,
          toolResult,
        );
      }

      if (round === maxToolRounds - 1) {
        throw new Error(TOOL_ROUND_LIMIT_MESSAGE);
      }
    }

    throw new Error(TOOL_ROUND_LIMIT_MESSAGE);
  };
}
