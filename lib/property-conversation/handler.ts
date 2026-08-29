import { z } from "zod";

import {
  modelDirectiveSchema,
  propertyConversationContextSchema,
  propertyConversationRequestSchema,
  propertyConversationResponseSchema,
  type PropertyConversationRequest,
  type PropertyConversationResponse,
} from "./contracts.ts";
import type {
  OpenAIPropertyConversationRunInput,
  OpenAIPropertyConversationResult,
} from "./openai.ts";
import type { PropertyFactLookup } from "./property-facts.ts";
import {
  CONTACT_BANC_COPY,
  createPropertyConversationTools,
  type PropertyToolResult,
} from "./tools.ts";
import type { PropertySearch } from "../property-search/types.ts";

export { CONTACT_BANC_COPY } from "./tools.ts";

export const PROPERTY_ASSISTANT_UNAVAILABLE =
  "I'm having trouble with the property assistant right now. Please try again shortly or call Banc on 01707 877781.";

export type PropertyConversationModelRunner = (
  input: OpenAIPropertyConversationRunInput,
) => Promise<unknown>;

export interface PropertyConversationModelConfiguration {
  apiKey: string;
  model: string;
}

export interface PropertyConversationHandlerDependencies {
  apiKey: string | undefined;
  model: string | undefined;
  createModelRunner: (
    configuration: PropertyConversationModelConfiguration,
  ) => PropertyConversationModelRunner;
  search: PropertySearch;
  lookupFacts: PropertyFactLookup;
}

type SuccessfulSearchResult = Extract<
  PropertyToolResult,
  { ok: true; name: "search_properties" }
>;

type SuccessfulContactResult = Extract<
  PropertyToolResult,
  { ok: true; name: "contact_banc" }
>;

type SuccessfulToolName = Extract<PropertyToolResult, { ok: true }>["name"];

const modelRunResultSchema = z
  .object({
    directive: modelDirectiveSchema,
    context: propertyConversationContextSchema,
  })
  .strict();

function unavailableResponse(
  originalContext: PropertyConversationResponse["context"],
): PropertyConversationResponse {
  return propertyConversationResponseSchema.parse({
    response: PROPERTY_ASSISTANT_UNAVAILABLE,
    action: "unavailable",
    context: originalContext,
  });
}

function hasConfiguration(
  dependencies: PropertyConversationHandlerDependencies,
): dependencies is PropertyConversationHandlerDependencies & {
  apiKey: string;
  model: string;
} {
  return typeof dependencies.apiKey === "string" &&
    dependencies.apiKey.trim().length > 0 &&
    typeof dependencies.model === "string" &&
    dependencies.model.trim().length > 0;
}

function contextsMatch(
  left: PropertyConversationResponse["context"],
  right: PropertyConversationResponse["context"],
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function hasActivePropertyState(
  context: PropertyConversationResponse["context"],
): boolean {
  return context.query !== undefined ||
    context.resultPropertyIds.length > 0 ||
    context.focusedPropertyId !== undefined ||
    context.resultFingerprint !== undefined;
}

export function createPropertyConversationHandler(
  dependencies: PropertyConversationHandlerDependencies,
) {
  return async function handlePropertyConversation(
    rawRequest: PropertyConversationRequest,
  ): Promise<PropertyConversationResponse> {
    const parsedRequest = propertyConversationRequestSchema.safeParse(rawRequest);
    const fallbackContext = propertyConversationContextSchema.parse(
      parsedRequest.success
        ? parsedRequest.data.context ?? { resultPropertyIds: [] }
        : { resultPropertyIds: [] },
    );

    if (!parsedRequest.success || !hasConfiguration(dependencies)) {
      return unavailableResponse(fallbackContext);
    }

    const originalContext: PropertyConversationResponse["context"] = fallbackContext;
    const trustedTools = createPropertyConversationTools({
      search: dependencies.search,
      lookupFacts: dependencies.lookupFacts,
    });
    let trustedContext: PropertyConversationResponse["context"] = originalContext;
    let lastSearchResult: SuccessfulSearchResult | undefined;
    let lastContactResult: SuccessfulContactResult | undefined;
    let lastSuccessfulToolName: SuccessfulToolName | undefined;
    let toolFailed = false;
    const authorizedFactIds = new Set<string>();

    const tools = {
      definitions: trustedTools.definitions,
      async executeTool(
        name: string,
        rawArguments: Parameters<typeof trustedTools.executeTool>[1],
        turn: Parameters<typeof trustedTools.executeTool>[2],
      ): Promise<PropertyToolResult> {
        const result = await trustedTools.executeTool(name, rawArguments, turn);
        if (!result.ok) {
          toolFailed = true;
          return result;
        }

        trustedContext = result.context;
        lastSuccessfulToolName = result.name;
        if (result.name === "search_properties") {
          lastSearchResult = result;
        } else if (result.name === "get_property_facts") {
          for (const fact of result.facts) authorizedFactIds.add(fact.id);
        } else if (result.name === "contact_banc") {
          lastContactResult = result;
        }
        return result;
      },
    };

    try {
      const runModel = dependencies.createModelRunner({
        apiKey: dependencies.apiKey,
        model: dependencies.model,
      });
      const rawModelResult = await runModel({
        request: parsedRequest.data,
        tools,
      });
      const modelResult = modelRunResultSchema.safeParse(rawModelResult);
      if (
        !modelResult.success ||
        toolFailed ||
        !contextsMatch(modelResult.data.context, trustedContext)
      ) {
        return unavailableResponse(originalContext);
      }

      const { directive } = modelResult.data as OpenAIPropertyConversationResult;
      if (
        directive.focusedPropertyId !== undefined &&
        !authorizedFactIds.has(directive.focusedPropertyId)
      ) {
        return unavailableResponse(originalContext);
      }

      if (lastContactResult !== undefined) {
        return propertyConversationResponseSchema.parse({
          response: CONTACT_BANC_COPY[lastContactResult.category],
          action: "contact_team",
          context: trustedContext,
        });
      }

      if (directive.action === "contact_team" || directive.action === "unavailable") {
        return unavailableResponse(originalContext);
      }

      if (directive.action === "search" || directive.action === "no_results") {
        const searchSupportsDirective =
          lastSuccessfulToolName === "search_properties" &&
          lastSearchResult !== undefined &&
          contextsMatch(lastSearchResult.context, trustedContext) &&
          (directive.action === "search"
            ? lastSearchResult.total > 0
            : lastSearchResult.total === 0);
        if (!searchSupportsDirective) {
          return unavailableResponse(originalContext);
        }
      } else if (directive.action === "answer") {
        const answerHasTrustedProvenance =
          lastSuccessfulToolName === "get_property_facts" ||
          lastSuccessfulToolName === "reset_property_search" ||
          (lastSuccessfulToolName === undefined &&
            !hasActivePropertyState(trustedContext));
        if (!answerHasTrustedProvenance) {
          return unavailableResponse(originalContext);
        }
      } else if (
        directive.action === "clarify_department" &&
        lastSuccessfulToolName !== undefined
      ) {
        return unavailableResponse(originalContext);
      }

      const publicResponse = {
        response: directive.response,
        action: directive.action,
        context: trustedContext,
        ...(directive.action !== "search" ||
        lastSuccessfulToolName !== "search_properties" ||
        lastSearchResult?.properties === undefined
          ? {}
          : { properties: lastSearchResult.properties }),
      };
      const parsedResponse = propertyConversationResponseSchema.safeParse(publicResponse);
      return parsedResponse.success
        ? parsedResponse.data
        : unavailableResponse(originalContext);
    } catch {
      return unavailableResponse(originalContext);
    }
  };
}
