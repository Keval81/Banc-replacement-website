import { z } from "zod";

import { BANC_CONTACT } from "../banc-contact.ts";
import {
  SEARCH_FEATURES,
  SEARCH_PROPERTY_TYPES,
  SEARCH_TENURES,
  type SearchFeature,
  type SearchPropertyType,
  type SearchTenure,
} from "../crm/property-source.ts";
import {
  MAX_PROPERTY_SEARCH_PRICE,
  POSTGRES_SIGNED_INTEGER_MAX,
  propertySearchQuerySchema,
} from "../property-search/query.ts";
import type {
  PropertySearchQuery,
  PropertySort,
} from "../property-search/types.ts";
import { getSafePropertyImageUrl } from "../property-detail-view.ts";
import type { PropertyCardData } from "../property-view.ts";

export type FieldMutation<T> =
  | { operation: "set"; value: T }
  | { operation: "clear" };

export interface PropertySearchMutation {
  department?: { operation: "set"; value: "sales" | "lettings" };
  location?: FieldMutation<string>;
  minPrice?: FieldMutation<number>;
  maxPrice?: FieldMutation<number>;
  bedrooms?: FieldMutation<{ mode: "exact" | "minimum"; value: number }>;
  minBathrooms?: FieldMutation<number>;
  propertyTypes?: FieldMutation<SearchPropertyType[]>;
  tenures?: FieldMutation<SearchTenure[]>;
  features?: FieldMutation<SearchFeature[]>;
  sort?: FieldMutation<PropertySort>;
}

export interface PropertyConversationState {
  query?: PropertySearchQuery;
  resultPropertyIds: string[];
  focusedPropertyId?: string;
  resultFingerprint?: string;
  topic: "property_search" | "property_detail" | "banc_knowledge" | "handoff";
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ConversationRequest {
  message: string;
  history: ConversationMessage[];
  context?: PropertyConversationState;
}

export type HandoffCategory =
  | "viewing"
  | "valuation"
  | "offer"
  | "availability"
  | "fees_finance_legal"
  | "human";

export type ConversationIntent =
  | { type: "update_property_search"; mutation: PropertySearchMutation }
  | { type: "get_property_facts"; propertyIds: string[] }
  | { type: "search_banc_knowledge"; query: string }
  | { type: "reset_conversation_search" }
  | { type: "contact_banc"; reason: HandoffCategory; propertyId?: string }
  | { type: "clarify"; question: string };

export interface ConversationPlan {
  primary: ConversationIntent;
  supporting?:
    | Extract<ConversationIntent, { type: "get_property_facts" }>
    | Extract<ConversationIntent, { type: "search_banc_knowledge" }>
    | Extract<ConversationIntent, { type: "contact_banc" }>;
}

export interface TrustedHandoff {
  callHref: `tel:${string}`;
  whatsappHref: `https://wa.me/${string}`;
  propertyId?: string;
}

export interface ConversationResponse {
  response: string;
  action:
    | "clarify"
    | "search_results"
    | "no_results"
    | "answer"
    | "contact_team"
    | "service_unavailable";
  properties?: PropertyCardData[];
  sources?: Array<{ title: string; href: string }>;
  handoff?: { callHref: string; whatsappHref: string };
  context: PropertyConversationState;
}

export type ConversationAction = ConversationResponse["action"];

const propertyIdSchema = z.string().trim().min(1).max(64);
const noLinksPattern =
  /\b(?:https?:\/\/|www\.|mailto:|tel:)[^\s<>()\[\]{}"]*/i;

const boundedTextSchema = z.string().trim().min(1).max(2_000);
const safeModelTextSchema = boundedTextSchema.refine(
  (value) => !noLinksPattern.test(value),
  "Links are not allowed",
);

function boundedIntegerSchema(maximum: number) {
  return z
    .number()
    .int()
    .min(0)
    .max(maximum)
    .refine((value) => Number.isSafeInteger(value), "Expected a safe integer");
}

function fieldMutationSchema<T>(
  valueSchema: z.ZodType<T>,
): z.ZodType<FieldMutation<T>> {
  return z.union([
    z.object({ operation: z.literal("set"), value: valueSchema }).strict(),
    z.object({ operation: z.literal("clear") }).strict(),
  ]);
}

function uniqueCanonicalArraySchema<
  const T extends readonly [string, ...string[]],
>(values: T): z.ZodType<Array<T[number]>> {
  return z
    .array(z.enum(values))
    .max(values.length)
    .refine(
      (selected) => new Set(selected).size === selected.length,
      "Values must be unique",
    )
    .transform((selected) => {
      const selectedSet = new Set(selected);
      return values.filter((value) => selectedSet.has(value)) as Array<T[number]>;
    });
}

const locationMutationSchema = fieldMutationSchema(
  z.string().trim().min(1).max(120),
);
const priceMutationSchema = fieldMutationSchema(
  boundedIntegerSchema(MAX_PROPERTY_SEARCH_PRICE),
);
const countMutationSchema = fieldMutationSchema(
  boundedIntegerSchema(POSTGRES_SIGNED_INTEGER_MAX),
);
const bedroomsMutationSchema = fieldMutationSchema(
  z
    .object({
      mode: z.enum(["exact", "minimum"]),
      value: boundedIntegerSchema(POSTGRES_SIGNED_INTEGER_MAX),
    })
    .strict(),
);

export const propertySearchMutationSchema = z
  .object({
    department: z
      .object({
        operation: z.literal("set"),
        value: z.enum(["sales", "lettings"]),
      })
      .strict()
      .optional(),
    location: locationMutationSchema.optional(),
    minPrice: priceMutationSchema.optional(),
    maxPrice: priceMutationSchema.optional(),
    bedrooms: bedroomsMutationSchema.optional(),
    minBathrooms: countMutationSchema.optional(),
    propertyTypes: fieldMutationSchema(
      uniqueCanonicalArraySchema(SEARCH_PROPERTY_TYPES),
    ).optional(),
    tenures: fieldMutationSchema(
      uniqueCanonicalArraySchema(SEARCH_TENURES),
    ).optional(),
    features: fieldMutationSchema(
      uniqueCanonicalArraySchema(SEARCH_FEATURES),
    ).optional(),
    sort: fieldMutationSchema(
      z.enum(["default", "price_asc", "price_desc"]),
    ).optional(),
  })
  .strict();

function propertyIdListSchema(minimum = 0) {
  return z
    .array(propertyIdSchema)
    .min(minimum)
    .max(3)
    .refine(
      (ids) => new Set(ids).size === ids.length,
      "Property ids must be unique",
    )
    .transform((ids) => [...ids]);
}

export const propertyConversationStateSchema = z
  .object({
    query: propertySearchQuerySchema.optional(),
    resultPropertyIds: propertyIdListSchema(),
    focusedPropertyId: propertyIdSchema.optional(),
    resultFingerprint: z.string().trim().min(1).max(240).optional(),
    topic: z.enum([
      "property_search",
      "property_detail",
      "banc_knowledge",
      "handoff",
    ]),
  })
  .strict()
  .transform((state) => ({
    ...state,
    resultPropertyIds: [...state.resultPropertyIds],
  }))
  .superRefine((state, context) => {
    if (
      state.focusedPropertyId !== undefined &&
      !state.resultPropertyIds.includes(state.focusedPropertyId)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Focused property id must belong to active results",
        path: ["focusedPropertyId"],
      });
    }
  });

const conversationMessageSchema = z
  .object({
    role: z.enum(["user", "assistant"]),
    content: boundedTextSchema,
  })
  .strict()
  .superRefine((message, context) => {
    if (message.role === "assistant" && noLinksPattern.test(message.content)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Assistant messages cannot contain links",
        path: ["content"],
      });
    }
  });

export const conversationRequestSchema = z
  .object({
    message: boundedTextSchema,
    history: z
      .array(conversationMessageSchema)
      .max(20)
      .transform((history) => history.map((message) => ({ ...message }))),
    context: propertyConversationStateSchema.optional(),
  })
  .strict();

const getPropertyFactsIntentSchema = z
  .object({
    type: z.literal("get_property_facts"),
    propertyIds: propertyIdListSchema(1),
  })
  .strict();

const searchBancKnowledgeIntentSchema = z
  .object({
    type: z.literal("search_banc_knowledge"),
    query: safeModelTextSchema,
  })
  .strict();

const contactBancIntentSchema = z
  .object({
    type: z.literal("contact_banc"),
    reason: z.enum([
      "viewing",
      "valuation",
      "offer",
      "availability",
      "fees_finance_legal",
      "human",
    ]),
    propertyId: propertyIdSchema.optional(),
  })
  .strict();

export const conversationIntentSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("update_property_search"),
      mutation: propertySearchMutationSchema,
    })
    .strict(),
  getPropertyFactsIntentSchema,
  searchBancKnowledgeIntentSchema,
  z.object({ type: z.literal("reset_conversation_search") }).strict(),
  contactBancIntentSchema,
  z
    .object({
      type: z.literal("clarify"),
      question: safeModelTextSchema,
    })
    .strict(),
]);

const supportingIntentSchema = z.discriminatedUnion("type", [
  getPropertyFactsIntentSchema,
  searchBancKnowledgeIntentSchema,
  contactBancIntentSchema,
]);

export const conversationPlanSchema = z
  .object({
    primary: conversationIntentSchema,
    supporting: supportingIntentSchema.optional(),
  })
  .strict()
  .superRefine((plan, context) => {
    if (plan.supporting?.type === plan.primary.type) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Conversation operation types must be unique",
        path: ["supporting", "type"],
      });
    }
  });

const safePropertyImageSchema = z.string().transform((value, context) => {
  const imageUrl = getSafePropertyImageUrl(value);
  if (imageUrl === null) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Property image URL is not allowed",
    });
    return z.NEVER;
  }
  return imageUrl;
});

export const safePropertyCardSchema = z
  .object({
    id: propertyIdSchema,
    title: z.string().trim().min(1).max(240),
    address: z.string().trim().min(1).max(240),
    price: z.string().trim().min(1).max(120),
    priceNum: z.number().finite().nonnegative(),
    tags: z
      .array(z.string().trim().min(1).max(64))
      .transform((tags) => [...tags]),
    stats: z
      .object({
        beds: boundedIntegerSchema(POSTGRES_SIGNED_INTEGER_MAX),
        baths: boundedIntegerSchema(POSTGRES_SIGNED_INTEGER_MAX),
        sqft: z.number().finite().positive().optional(),
        epc: z.string().trim().min(1).max(16).optional(),
      })
      .strict(),
    images: z.array(safePropertyImageSchema).transform((images) => [...images]),
    summary: z.string().trim().min(1).max(2_000),
    propertyType: z.enum(SEARCH_PROPERTY_TYPES),
    department: z.enum(["sales", "lettings"]),
    status: z.enum(["for_sale", "under_offer", "to_let", "let_agreed"]),
    coordinates: z
      .object({
        latitude: z.number().finite().min(-90).max(90),
        longitude: z.number().finite().min(-180).max(180),
      })
      .strict()
      .optional(),
  })
  .strict();

export const trustedSourceSchema = z
  .object({
    title: z.string().trim().min(1).max(240),
    href: z
      .string()
      .trim()
      .regex(/^\/(?!\/)[A-Za-z0-9/_-]+$/),
  })
  .strict();

export const publicHandoffSchema = z
  .object({
    callHref: z.literal(BANC_CONTACT.callHref),
    whatsappHref: z.literal(BANC_CONTACT.whatsappHref),
  })
  .strict();

export const trustedHandoffSchema = publicHandoffSchema.extend({
  propertyId: propertyIdSchema.optional(),
});

export const conversationResponseSchema = z
  .object({
    response: safeModelTextSchema,
    action: z.enum([
      "clarify",
      "search_results",
      "no_results",
      "answer",
      "contact_team",
      "service_unavailable",
    ]),
    properties: z
      .array(safePropertyCardSchema)
      .max(3)
      .transform((properties) => [...properties])
      .optional(),
    sources: z
      .array(trustedSourceSchema)
      .max(3)
      .transform((sources) => sources.map((source) => ({ ...source })))
      .optional(),
    handoff: publicHandoffSchema.optional(),
    context: propertyConversationStateSchema,
  })
  .strict();

function safeParseOrNull<T>(schema: z.ZodType<T>, value: unknown): T | null {
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function createInitialConversationState(): PropertyConversationState {
  return {
    resultPropertyIds: [],
    topic: "property_search",
  };
}

export function parsePropertySearchMutation(
  value: unknown,
): PropertySearchMutation | null {
  return safeParseOrNull(propertySearchMutationSchema, value);
}

export function parseConversationPlan(value: unknown): ConversationPlan | null {
  return safeParseOrNull(conversationPlanSchema, value);
}

export function parseConversationRequest(
  value: unknown,
): ConversationRequest | null {
  return safeParseOrNull(conversationRequestSchema, value);
}

export function parseConversationResponse(
  value: unknown,
): ConversationResponse | null {
  return safeParseOrNull(conversationResponseSchema, value);
}
