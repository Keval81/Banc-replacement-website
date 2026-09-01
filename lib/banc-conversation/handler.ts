import {
  createInitialConversationState,
  parseConversationPlan,
  parseConversationRequest,
  parseConversationResponse,
  propertyConversationStateSchema,
  type ConversationIntent,
  type ConversationPlan,
  type ConversationResponse,
  type PropertyConversationState,
} from "./contracts.ts";
import { BANC_CONTACT } from "../banc-contact.ts";
import type {
  ConversationModel,
  ModelFailureCategory,
} from "./openai.ts";
import {
  sanitizeOperationResult,
  type TrustedOperationResult,
} from "./tools.ts";

const TURN_BUDGET_MS = 20_000;
const MAX_TRUSTED_OPERATIONS = 2;
const MAX_PROVIDER_CALLS = 3;
const CHEAPER_REFINEMENT = /^\s*(?:make|show|find)?\s*(?:it|them)?\s*cheaper[.!?]*\s*$/i;
const EXPLICIT_VIEWING_PROPERTY_REFERENCE = /^\s*(?:please\s+)?(?:arrange|book|schedule|request)(?:\s+(?:me\s+)?(?:a|the))?\s+viewing\s+for\s+(?:the\s+)?(first|1st|second|2nd|third|3rd)(?:\s+(?:one|property|listing))?[.!?]*\s*$/i;
const UNSAFE_RESPONSE_TEXT = /\b(?:https?:\/\/|www\.|mailto:|tel:)|\[[^\]]+\]\([^)]+\)|(?:\+?\d[\d\s().-]{7,}\d)/i;

export const INTERPRETATION_CLARIFICATION =
  "Which location, price range, bedroom requirement or property would you like help with?";
export const MODEL_TIMEOUT_COPY =
  "The conversation took too long to complete. Please try again.";
export const MODEL_UNAVAILABLE_COPY =
  "The conversational service is temporarily unavailable. Please try again shortly.";
export const CONFIGURATION_MISSING_COPY =
  "The conversational service is not available in this environment.";
export const RATE_LIMITED_COPY =
  "The conversational service is busy. Please wait a moment before trying again.";
export const PROPERTY_SEARCH_UNAVAILABLE_COPY =
  "Live Banc listings cannot be checked right now. Your current requirements have been kept, so please try again shortly.";
export const KNOWLEDGE_UNAVAILABLE_COPY =
  "Banc guidance cannot be checked right now. Please try again or contact the Banc team.";

export type ApprovedToolName = ConversationIntent["type"];

export type ConversationFailureCategory =
  | ModelFailureCategory
  | "property_search_unavailable"
  | "knowledge_unavailable";

export interface ConversationDiagnosticEvent {
  category: ConversationFailureCategory;
  requestId: string;
  durationBucket: "under_1s" | "1_to_5s" | "5_to_20s" | "over_20s";
  tool?: ApprovedToolName;
}

export interface ConversationTools {
  execute(input: {
    intent: ConversationIntent;
    message: string;
    state: PropertyConversationState;
  }, signal: AbortSignal): Promise<TrustedOperationResult>;
}

export interface BancConversationHandlerDependencies {
  model: ConversationModel;
  tools: ConversationTools;
  now?: () => number;
  logger?: (event: ConversationDiagnosticEvent) => void;
}

type TimedResult<T> =
  | { status: "ok"; value: T }
  | { status: "timeout" }
  | { status: "error" };

function remainingMs(deadline: number, now: () => number): number {
  return Math.max(0, deadline - now());
}

async function withinDeadline<T>(
  deadline: number,
  now: () => number,
  operation: (signal: AbortSignal) => Promise<T>,
): Promise<TimedResult<T>> {
  const remaining = remainingMs(deadline, now);
  if (remaining === 0) return { status: "timeout" };

  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<TimedResult<T>>((resolve) => {
    timeoutId = setTimeout(() => {
      controller.abort();
      resolve({ status: "timeout" });
    }, remaining);
  });

  const call: Promise<TimedResult<T>> = (async () => {
    try {
      return { status: "ok", value: await operation(controller.signal) };
    } catch {
      return { status: "error" };
    }
  })();

  const result = await Promise.race([call, timeout]);
  if (timeoutId !== undefined) clearTimeout(timeoutId);
  return result;
}

function durationBucket(
  startedAt: number,
  now: () => number,
): ConversationDiagnosticEvent["durationBucket"] {
  const duration = Math.max(0, now() - startedAt);
  if (duration < 1_000) return "under_1s";
  if (duration < 5_000) return "1_to_5s";
  if (duration <= 20_000) return "5_to_20s";
  return "over_20s";
}

function safeRequestId(value: string): string {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      .test(value)
    ? value
    : "invalid-request-id";
}

function fixedFailureCopy(category: ConversationFailureCategory): string {
  switch (category) {
    case "interpretation_invalid":
      return INTERPRETATION_CLARIFICATION;
    case "model_timeout":
      return MODEL_TIMEOUT_COPY;
    case "model_unavailable":
      return MODEL_UNAVAILABLE_COPY;
    case "configuration_missing":
      return CONFIGURATION_MISSING_COPY;
    case "rate_limited":
      return RATE_LIMITED_COPY;
    case "property_search_unavailable":
      return PROPERTY_SEARCH_UNAVAILABLE_COPY;
    case "knowledge_unavailable":
      return KNOWLEDGE_UNAVAILABLE_COPY;
  }
}

function toolFailureCategory(
  tool: ApprovedToolName,
): Exclude<ConversationFailureCategory, ModelFailureCategory> {
  return tool === "search_banc_knowledge"
    ? "knowledge_unavailable"
    : "property_search_unavailable";
}

function isSuccessfulPrimary(result: TrustedOperationResult): boolean {
  return result.status !== "clarification_required";
}

function supportingIntentIsValid(
  intent: NonNullable<ConversationPlan["supporting"]>,
  state: PropertyConversationState,
): boolean {
  if (intent.type === "get_property_facts") {
    return intent.propertyIds.every((id) => state.resultPropertyIds.includes(id));
  }
  if (intent.type === "contact_banc" && intent.propertyId !== undefined) {
    return state.resultPropertyIds.includes(intent.propertyId);
  }
  return true;
}

function actionFor(result: TrustedOperationResult): ConversationResponse["action"] {
  switch (result.status) {
    case "search_results":
      return "search_results";
    case "no_results":
      return "no_results";
    case "contact":
      return "contact_team";
    case "clarification_required":
      return "clarify";
    case "property_facts":
    case "knowledge":
    case "reset":
      return "answer";
  }
}

function noResultsCopy(result: TrustedOperationResult): string {
  return result.status === "no_results"
    ? "I couldn't find matching Banc properties. Would you like to adjust one requirement?"
    : MODEL_UNAVAILABLE_COPY;
}

function deterministicViewingPlan(
  message: string,
  state: PropertyConversationState,
): ConversationPlan | null {
  const ordinal = EXPLICIT_VIEWING_PROPERTY_REFERENCE.exec(message)?.[1]
    ?.toLowerCase();
  if (ordinal === undefined) return null;

  const index = ordinal === "first" || ordinal === "1st"
    ? 0
    : ordinal === "second" || ordinal === "2nd"
    ? 1
    : 2;
  const propertyId = state.resultPropertyIds[index];
  if (propertyId === undefined) return null;

  return {
    primary: {
      type: "contact_banc",
      reason: "viewing",
      propertyId,
    },
  };
}

function deterministicSearchPlan(
  message: string,
  state: PropertyConversationState,
): ConversationPlan | null {
  if (state.query === undefined || !CHEAPER_REFINEMENT.test(message)) {
    return null;
  }

  return {
    primary: {
      type: "update_property_search",
      mutation: { sort: { operation: "set", value: "price_asc" } },
    },
  };
}

function knowledgeFallbackCopy(
  result: Extract<TrustedOperationResult, { status: "knowledge" }>,
): string {
  const excerpt = result.sources[0]?.excerpt.trim();
  if (excerpt === undefined) {
    return "I couldn't find approved Banc guidance for that question. What would you like help with?";
  }

  const candidate = `Banc guidance says: ${excerpt}`;
  return candidate.length <= 2_000 && !UNSAFE_RESPONSE_TEXT.test(candidate)
    ? candidate
    : "I found approved Banc guidance for that question. Please use the source below for details.";
}

function parseOrFallback(
  candidate: ConversationResponse,
  state: PropertyConversationState,
): ConversationResponse {
  return parseConversationResponse(candidate) ?? {
    response: MODEL_UNAVAILABLE_COPY,
    action: "service_unavailable",
    context: propertyConversationStateSchema.parse(state),
  };
}

function successfulResponse(
  response: string,
  results: readonly TrustedOperationResult[],
): ConversationResponse {
  const primary = results[0];
  if (primary === undefined) {
    return {
      response: MODEL_UNAVAILABLE_COPY,
      action: "service_unavailable",
      context: createInitialConversationState(),
    };
  }
  const finalResult = results.at(-1) ?? primary;
  const properties = results.find(
    (result): result is Extract<TrustedOperationResult, { status: "search_results" }> =>
      result.status === "search_results",
  )?.properties;
  const knowledge = results.find(
    (result): result is Extract<TrustedOperationResult, { status: "knowledge" }> =>
      result.status === "knowledge",
  );
  const contact = results.find(
    (result): result is Extract<TrustedOperationResult, { status: "contact" }> =>
      result.status === "contact",
  );

  return {
    response,
    action: actionFor(primary),
    ...(properties === undefined ? {} : { properties }),
    ...(knowledge === undefined
      ? {}
      : {
          sources: knowledge.sources.map(({ title, href }) => ({ title, href })),
        }),
    ...(contact === undefined
      ? {}
      : {
          handoff: {
            callHref: contact.handoff.callHref,
            whatsappHref: contact.handoff.whatsappHref,
          },
        }),
    context: finalResult.state,
  };
}

function completedKnowledgeFallback(
  results: readonly TrustedOperationResult[],
): ConversationResponse | null {
  const knowledge = results.find(
    (result): result is Extract<TrustedOperationResult, { status: "knowledge" }> =>
      result.status === "knowledge",
  );
  if (knowledge === undefined) return null;

  const response = successfulResponse(knowledgeFallbackCopy(knowledge), results);
  return knowledge.sources.length === 0
    ? {
        ...response,
        handoff: {
          callHref: BANC_CONTACT.callHref,
          whatsappHref: BANC_CONTACT.whatsappHref,
        },
      }
    : response;
}

export function createBancConversationHandler({
  model,
  tools,
  now = performance.now.bind(performance),
  logger = (event) => console.warn(event),
}: BancConversationHandlerDependencies) {
  return async function handleConversation(
    input: unknown,
    requestId = "invalid-request-id",
  ): Promise<ConversationResponse> {
    const request = parseConversationRequest(input);
    if (request === null) {
      throw new TypeError("Invalid conversation request");
    }

    const startedAt = now();
    const deadline = startedAt + TURN_BUDGET_MS;
    const initialState = request.context ?? createInitialConversationState();
    const trustedInitialState = propertyConversationStateSchema.parse(initialState);
    const correlationId = safeRequestId(requestId);

    const diagnose = (
      category: ConversationFailureCategory,
      tool?: ApprovedToolName,
    ) => {
      const event: ConversationDiagnosticEvent = {
        category,
        requestId: correlationId,
        durationBucket: durationBucket(startedAt, now),
        ...(tool === undefined ? {} : { tool }),
      };
      try {
        logger(event);
      } catch {
        return;
      }
    };

    const failureResponse = (
      category: ConversationFailureCategory,
      tool?: ApprovedToolName,
    ): ConversationResponse => {
      diagnose(category, tool);
      return parseOrFallback({
        response: fixedFailureCopy(category),
        action: category === "interpretation_invalid"
          ? "clarify"
          : "service_unavailable",
        context: trustedInitialState,
      }, trustedInitialState);
    };

    const deterministicPlan =
      deterministicViewingPlan(
        request.message,
        trustedInitialState,
      ) ?? deterministicSearchPlan(
        request.message,
        trustedInitialState,
      );
    let selectedPlan: ConversationPlan;
    let providerCalls: number;
    if (deterministicPlan !== null) {
      selectedPlan = deterministicPlan;
      providerCalls = 0;
    } else {
      const planCall = await withinDeadline(
        deadline,
        now,
        (signal) => model.selectPlan({
          message: request.message,
          history: request.history,
          state: trustedInitialState,
        }, signal),
      );
      if (planCall.status === "timeout") {
        return failureResponse("model_timeout");
      }
      if (planCall.status === "error") {
        return failureResponse("model_unavailable");
      }

      const selected = planCall.value;
      if (selected.status !== "ok") {
        return failureResponse(selected.status);
      }
      const parsedPlan = parseConversationPlan(selected.plan);
      if (parsedPlan === null) {
        return failureResponse("interpretation_invalid");
      }
      selectedPlan = parsedPlan;
      providerCalls = selected.providerCalls;
    }
    let state: PropertyConversationState = trustedInitialState;
    const results: TrustedOperationResult[] = [];
    const knowledgeFallback = (): ConversationResponse | null => {
      const fallback = completedKnowledgeFallback(results);
      return fallback === null
        ? null
        : parseOrFallback(fallback, trustedInitialState);
    };
    const intents: ConversationIntent[] = [selectedPlan.primary];

    if (
      selectedPlan.supporting !== undefined &&
      intents.length < MAX_TRUSTED_OPERATIONS
    ) {
      intents.push(selectedPlan.supporting);
    }

    for (const [index, intent] of intents.entries()) {
      if (remainingMs(deadline, now) === 0) {
        const fallback = knowledgeFallback();
        if (fallback !== null) return fallback;
        return failureResponse("model_timeout", intent.type);
      }
      if (
        index > 0 &&
        (results[0] === undefined ||
          !isSuccessfulPrimary(results[0]) ||
          !supportingIntentIsValid(
            intent as NonNullable<typeof selectedPlan.supporting>,
            state,
          ))
      ) {
        break;
      }

      const operation = await withinDeadline(
        deadline,
        now,
        (signal) => tools.execute(
          { intent, message: request.message, state },
          signal,
        ),
      );
      if (operation.status === "timeout") {
        return failureResponse("model_timeout", intent.type);
      }
      if (operation.status === "error") {
        return failureResponse(toolFailureCategory(intent.type), intent.type);
      }
      results.push(operation.value);
      state = operation.value.state;
    }

    const primary = results[0];
    if (primary === undefined) {
      return failureResponse("model_unavailable");
    }
    if (primary.status === "clarification_required") {
      return parseOrFallback({
        response: selectedPlan.primary.type === "clarify"
          ? INTERPRETATION_CLARIFICATION
          : primary.question,
        action: "clarify",
        context: primary.state,
      }, trustedInitialState);
    }

    const completedKnowledge = results.find(
      (result): result is Extract<TrustedOperationResult, { status: "knowledge" }> =>
        result.status === "knowledge",
    );
    if (completedKnowledge?.sources.length === 0) {
      const fallback = knowledgeFallback();
      if (fallback !== null) return fallback;
    }

    if (providerCalls >= MAX_PROVIDER_CALLS || remainingMs(deadline, now) === 0) {
      const fallback = knowledgeFallback();
      if (fallback !== null) return fallback;
      if (primary.status === "no_results") {
        return parseOrFallback(
          successfulResponse(noResultsCopy(primary), results),
          trustedInitialState,
        );
      }
      return failureResponse("model_timeout");
    }

    const writeCall = await withinDeadline(
      deadline,
      now,
      (signal) => model.writeResponse({
        message: request.message,
        history: request.history,
        state,
        results: results.map(sanitizeOperationResult),
      }, signal),
    );
    if (writeCall.status === "timeout") {
      const fallback = knowledgeFallback();
      if (fallback !== null) return fallback;
      if (primary.status === "no_results") {
        return parseOrFallback(
          successfulResponse(noResultsCopy(primary), results),
          trustedInitialState,
        );
      }
      return failureResponse("model_timeout");
    }
    if (writeCall.status === "error") {
      const fallback = knowledgeFallback();
      if (fallback !== null) return fallback;
      return failureResponse("model_unavailable");
    }

    const written = writeCall.value;
    providerCalls += written.providerCalls;
    if (providerCalls > MAX_PROVIDER_CALLS) {
      diagnose("model_unavailable");
      const fallback = knowledgeFallback();
      if (fallback !== null) return fallback;
      if (primary.status === "no_results") {
        return parseOrFallback(
          successfulResponse(noResultsCopy(primary), results),
          trustedInitialState,
        );
      }
      return parseOrFallback({
        response: MODEL_UNAVAILABLE_COPY,
        action: "service_unavailable",
        context: trustedInitialState,
      }, trustedInitialState);
    }
    if (written.status !== "ok") {
      diagnose(written.status);
      const fallback = knowledgeFallback();
      if (fallback !== null) return fallback;
      if (primary.status === "no_results") {
        return parseOrFallback(
          successfulResponse(noResultsCopy(primary), results),
          trustedInitialState,
        );
      }
      return parseOrFallback({
        response: fixedFailureCopy(written.status),
        action: "service_unavailable",
        context: trustedInitialState,
      }, trustedInitialState);
    }

    return parseOrFallback(
      successfulResponse(written.response, results),
      trustedInitialState,
    );
  };
}
