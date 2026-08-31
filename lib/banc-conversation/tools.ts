import { BANC_CONTACT } from "../banc-contact.ts";
import { propertySearchQuerySchema } from "../property-search/query.ts";
import type { PropertySearchQuery } from "../property-search/types.ts";
import type { PropertyFacts } from "../property-facts.ts";
import type { PropertyCardData } from "../property-view.ts";
import {
  createInitialConversationState,
  propertyConversationStateSchema,
  type ConversationIntent,
  type HandoffCategory,
  type PropertyConversationState,
  type TrustedHandoff,
} from "./contracts.ts";
import type {
  BancKnowledge,
  BancKnowledgeResult,
} from "./knowledge.ts";
import type { PropertyPortfolio } from "./portfolio.ts";
import {
  applyPropertySearchMutation,
  createResultFingerprint,
} from "./state-reducer.ts";

export type TrustedOperationResult =
  | {
      status: "search_results";
      state: PropertyConversationState;
      properties: PropertyCardData[];
      total: number;
    }
  | {
      status: "no_results";
      state: PropertyConversationState;
      total: 0;
    }
  | {
      status: "property_facts";
      state: PropertyConversationState;
      facts: PropertyFacts[];
    }
  | {
      status: "knowledge";
      state: PropertyConversationState;
      sources: BancKnowledgeResult[];
    }
  | {
      status: "reset";
      state: PropertyConversationState;
    }
  | {
      status: "contact";
      state: PropertyConversationState;
      reason: HandoffCategory;
      handoff: TrustedHandoff;
    }
  | {
      status: "clarification_required";
      state: PropertyConversationState;
      question: string;
    };

interface SanitizedProperty {
  id: string;
  title: string;
  address: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  summary: string;
}

interface SanitizedKnowledgeSource {
  documentId: string;
  title: string;
  excerpt: string;
}

export type SanitizedOperationResult =
  | {
      status: "search_results" | "no_results";
      total: number;
      requirements: PropertySearchQuery;
      properties: SanitizedProperty[];
    }
  | { status: "property_facts"; facts: PropertyFacts[] }
  | { status: "knowledge"; sources: SanitizedKnowledgeSource[] }
  | { status: "reset" }
  | { status: "contact"; reason: HandoffCategory }
  | { status: "clarification_required"; question: string };

interface ExecuteConversationOperation {
  intent: ConversationIntent;
  message: string;
  state: PropertyConversationState;
}

interface ConversationToolsDependencies {
  portfolio: PropertyPortfolio;
  knowledge: BancKnowledge;
}

const DEPARTMENT_QUESTION = "Are you looking to buy or rent?";
const ACTIVE_PROPERTY_QUESTION =
  "Please choose a property from the active search results.";
const UNSUPPORTED_OPERATION_QUESTION =
  "I can help with Banc property searches, property details, guidance, or contacting the team.";
const LOCAL_SOURCE_PATH = /^\/(?!\/)[A-Za-z0-9/_-]+$/;

function cloneState(state: PropertyConversationState): PropertyConversationState {
  return propertyConversationStateSchema.parse(state);
}

function clonePropertyCard(property: PropertyCardData): PropertyCardData {
  return {
    id: property.id,
    title: property.title,
    address: property.address,
    price: property.price,
    priceNum: property.priceNum,
    tags: [...property.tags],
    stats: { ...property.stats },
    images: [...property.images],
    summary: property.summary,
    propertyType: property.propertyType,
    department: property.department,
    status: property.status,
    ...(property.coordinates === undefined
      ? {}
      : { coordinates: { ...property.coordinates } }),
  };
}

function clonePropertyFacts(value: PropertyFacts): PropertyFacts {
  return {
    id: value.id,
    title: value.title,
    address: value.address,
    department: value.department,
    status: value.status,
    price: value.price,
    priceDisplay: value.priceDisplay,
    bedrooms: value.bedrooms,
    bathrooms: value.bathrooms,
    receptions: value.receptions,
    propertyType: value.propertyType,
    tenure: value.tenure,
    epc: value.epc,
    sqft: value.sqft,
    features: [...value.features],
    summary: value.summary,
  };
}

function cloneKnowledgeSource(
  source: BancKnowledgeResult,
): BancKnowledgeResult | null {
  if (!LOCAL_SOURCE_PATH.test(source.href)) return null;

  return {
    documentId: source.documentId,
    title: source.title,
    href: source.href,
    excerpt: source.excerpt,
  };
}

function factsInRequestedOrder(
  requestedIds: readonly string[],
  facts: readonly PropertyFacts[],
): PropertyFacts[] | null {
  const factsById = new Map<string, PropertyFacts>();
  for (const fact of facts) {
    if (factsById.has(fact.id)) return null;
    factsById.set(fact.id, fact);
  }

  const orderedFacts = requestedIds.map((id) => factsById.get(id));
  if (orderedFacts.some((fact) => fact === undefined)) return null;

  return orderedFacts.map((fact) => clonePropertyFacts(fact as PropertyFacts));
}

function stateWithTopic(
  state: PropertyConversationState,
  topic: PropertyConversationState["topic"],
): PropertyConversationState {
  return {
    ...cloneState(state),
    topic,
  };
}

function clarification(
  state: PropertyConversationState,
  question: string,
): TrustedOperationResult {
  return {
    status: "clarification_required",
    state: cloneState(state),
    question,
  };
}

export function createConversationTools({
  portfolio,
  knowledge,
}: ConversationToolsDependencies) {
  return {
    async execute({
      intent,
      message,
      state: untrustedState,
    }: ExecuteConversationOperation): Promise<TrustedOperationResult> {
      const state = cloneState(untrustedState);

      switch (intent.type) {
        case "update_property_search": {
          const nextState = applyPropertySearchMutation(
            state,
            intent.mutation,
            message,
          );
          if (nextState?.query === undefined) {
            return clarification(state, DEPARTMENT_QUESTION);
          }

          const searchResult = await portfolio.search(nextState.query);
          const orderedIds = searchResult.properties.map(({ id }) => id);
          const resultFingerprint = createResultFingerprint(
            orderedIds,
            searchResult.total,
          );
          const properties = searchResult.properties
            .slice(0, 3)
            .map(clonePropertyCard);
          const resultPropertyIds = properties.map(({ id }) => id);
          const focusedPropertyId = state.focusedPropertyId !== undefined &&
              resultPropertyIds.includes(state.focusedPropertyId)
            ? state.focusedPropertyId
            : undefined;
          const resultState: PropertyConversationState = {
            query: propertySearchQuerySchema.parse(nextState.query),
            resultPropertyIds,
            ...(focusedPropertyId === undefined ? {} : { focusedPropertyId }),
            resultFingerprint,
            topic: "property_search",
          };

          if (searchResult.total === 0) {
            return {
              status: "no_results",
              state: resultState,
              total: 0,
            };
          }

          return {
            status: "search_results",
            state: resultState,
            properties: state.resultFingerprint === resultFingerprint
              ? []
              : properties,
            total: searchResult.total,
          };
        }

        case "get_property_facts": {
          const activeIds = new Set(state.resultPropertyIds);
          if (intent.propertyIds.some((id) => !activeIds.has(id))) {
            return clarification(state, ACTIVE_PROPERTY_QUESTION);
          }

          const portfolioFacts = await portfolio.getFacts([
            ...intent.propertyIds,
          ]);
          const orderedFacts = factsInRequestedOrder(
            intent.propertyIds,
            portfolioFacts,
          );
          if (orderedFacts === null) {
            return clarification(state, ACTIVE_PROPERTY_QUESTION);
          }

          const focusedPropertyId = intent.propertyIds.length === 1
            ? intent.propertyIds[0]
            : state.focusedPropertyId;
          return {
            status: "property_facts",
            state: {
              ...cloneState(state),
              ...(focusedPropertyId === undefined ? {} : { focusedPropertyId }),
              topic: "property_detail",
            },
            facts: orderedFacts,
          };
        }

        case "search_banc_knowledge": {
          const sources = (await knowledge.search(intent.query))
            .map(cloneKnowledgeSource)
            .filter((source): source is BancKnowledgeResult => source !== null)
            .slice(0, 3);
          return {
            status: "knowledge",
            state: stateWithTopic(state, "banc_knowledge"),
            sources,
          };
        }

        case "reset_conversation_search":
          return {
            status: "reset",
            state: createInitialConversationState(),
          };

        case "contact_banc": {
          let authorizedPropertyId: string | undefined;
          if (
            intent.propertyId !== undefined &&
            state.resultPropertyIds.includes(intent.propertyId)
          ) {
            const liveFacts = await portfolio.getFacts([intent.propertyId]);
            if (factsInRequestedOrder([intent.propertyId], liveFacts) !== null) {
              authorizedPropertyId = intent.propertyId;
            }
          }
          return {
            status: "contact",
            state: stateWithTopic(state, "handoff"),
            reason: intent.reason,
            handoff: {
              callHref: BANC_CONTACT.callHref,
              whatsappHref: BANC_CONTACT.whatsappHref,
              ...(authorizedPropertyId === undefined
                ? {}
                : { propertyId: authorizedPropertyId }),
            },
          };
        }

        case "clarify":
          return clarification(state, intent.question);

        default:
          return clarification(state, UNSUPPORTED_OPERATION_QUESTION);
      }
    },
  };
}

export function sanitizeOperationResult(
  result: TrustedOperationResult,
): SanitizedOperationResult {
  switch (result.status) {
    case "search_results":
    case "no_results":
      return {
        status: result.status,
        total: result.total,
        requirements: propertySearchQuerySchema.parse(result.state.query),
        properties: result.status === "search_results"
          ? result.properties.map((property) => ({
              id: property.id,
              title: property.title,
              address: property.address,
              price: property.price,
              bedrooms: property.stats.beds,
              bathrooms: property.stats.baths,
              summary: property.summary,
            }))
          : [],
      };

    case "property_facts":
      return {
        status: "property_facts",
        facts: result.facts.map(clonePropertyFacts),
      };

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
}
