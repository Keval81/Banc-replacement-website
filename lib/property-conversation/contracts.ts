import { z } from "zod";

import {
  SEARCH_FEATURES,
  SEARCH_PROPERTY_TYPES,
  SEARCH_TENURES,
} from "../crm/property-source.ts";
import {
  POSTGRES_SIGNED_INTEGER_MAX,
  propertySearchQuerySchema,
} from "../property-search/query.ts";
import type { PropertySearchQuery } from "../property-search/types.ts";
import type { PropertyCardData } from "../property-view.ts";

export interface PropertyConversationContext {
  query?: PropertySearchQuery;
  resultPropertyIds: string[];
  focusedPropertyId?: string;
  resultFingerprint?: string;
}

export interface PropertyConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface PropertyConversationRequest {
  message: string;
  history: PropertyConversationMessage[];
  context?: PropertyConversationContext;
}

export type PropertyConversationAction =
  | "clarify_department"
  | "search"
  | "answer"
  | "no_results"
  | "contact_team"
  | "unavailable";

export interface PropertyConversationResponse {
  response: string;
  action: PropertyConversationAction;
  properties?: PropertyCardData[];
  context: PropertyConversationContext;
}

export interface PropertyFacts {
  id: string;
  title: string;
  address: string;
  department: "sales" | "lettings";
  status: "for_sale" | "under_offer" | "to_let" | "let_agreed";
  price: number;
  priceDisplay: string;
  bedrooms: number;
  bathrooms: number;
  receptions: number;
  propertyType: string;
  tenure: string | null;
  epc: string | null;
  sqft: number | null;
  features: string[];
  summary: string;
}

export type HandoffCategory =
  | "viewing"
  | "valuation"
  | "offer"
  | "fees_finance_legal"
  | "human";

function safeParseOrNull<T>(schema: z.ZodType<T>, value: unknown): T | null {
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

const propertyIdSchema = z.string().trim().min(1).max(64);
const noLinksPattern =
  /\b(?:https?:\/\/|www\.|mailto:|tel:)[^\s<>()\[\]{}"]*/i;
const safeAssistantTextSchema = z
  .string()
  .trim()
  .min(1)
  .max(2_000)
  .refine((value) => !noLinksPattern.test(value), "Links are not allowed");

function uniqueArraySchema<const T extends readonly [string, ...string[]]>(
  values: T,
) {
  return z
    .array(z.enum(values))
    .transform((selected) => {
      const selectedSet = new Set(selected);
      return values.filter((value) => selectedSet.has(value));
    });
}

const propertyIdListSchema = z
  .array(propertyIdSchema)
  .max(3)
  .transform((ids) => [...ids])
  .refine((ids) => new Set(ids).size === ids.length, "Property ids must be unique");

const historyMessageSchema = z
  .object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(2_000),
  })
  .strict()
  .superRefine((message, context) => {
    if (message.role === "assistant" && noLinksPattern.test(message.content)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Assistant messages cannot contain links",
      });
    }
  });

const safePropertyCardSchema = z
  .object({
    id: propertyIdSchema,
    title: z.string().trim().min(1).max(240),
    address: z.string().trim().min(1).max(240),
    price: z.string().trim().min(1).max(120),
    priceNum: z.number().finite().nonnegative(),
    tags: z.array(z.string().trim().min(1).max(64)).transform((tags) => [...tags]),
    stats: z
      .object({
        beds: z.number().int().nonnegative(),
        baths: z.number().int().nonnegative(),
        sqft: z.number().finite().positive().optional(),
        epc: z.string().trim().min(1).max(16).optional(),
      })
      .strict(),
    images: z.array(z.string().url()).transform((images) => [...images]),
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

export const propertyFactsSchema = z
  .object({
    id: propertyIdSchema,
    title: z.string().trim().min(1).max(240),
    address: z.string().trim().min(1).max(240),
    department: z.enum(["sales", "lettings"]),
    status: z.enum(["for_sale", "under_offer", "to_let", "let_agreed"]),
    price: z.number().finite().nonnegative(),
    priceDisplay: z.string().trim().min(1).max(120),
    bedrooms: z.number().int().min(0).max(POSTGRES_SIGNED_INTEGER_MAX),
    bathrooms: z.number().int().min(0).max(POSTGRES_SIGNED_INTEGER_MAX),
    receptions: z.number().int().min(0).max(POSTGRES_SIGNED_INTEGER_MAX),
    propertyType: z.string().trim().min(1).max(80),
    tenure: z.string().trim().min(1).max(80).nullable(),
    epc: z.string().trim().min(1).max(16).nullable(),
    sqft: z.number().finite().positive().nullable(),
    features: z.array(z.string().trim().min(1).max(64)).transform((features) => [...features]),
    summary: z.string().trim().min(1).max(2_000),
  })
  .strict();

export const propertyConversationContextSchema = z
  .object({
    query: propertySearchQuerySchema.optional(),
    resultPropertyIds: propertyIdListSchema.default([]),
    focusedPropertyId: propertyIdSchema.optional(),
    resultFingerprint: z.string().trim().min(1).max(240).optional(),
  })
  .strict()
  .transform((context) => ({
    ...context,
    resultPropertyIds: [...context.resultPropertyIds],
  }))
  .superRefine((context, issueContext) => {
    if (
      context.focusedPropertyId !== undefined &&
      !context.resultPropertyIds.includes(context.focusedPropertyId)
    ) {
      issueContext.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Focused property id must belong to active results",
        path: ["focusedPropertyId"],
      });
    }
  });

export const propertyConversationRequestSchema = z
  .object({
    message: z.string().trim().min(1).max(2_000),
    history: z.array(historyMessageSchema).max(20).transform((history) => [...history]),
    context: propertyConversationContextSchema.optional(),
  })
  .strict();

export const propertyConversationResponseSchema = z
  .object({
    response: safeAssistantTextSchema,
    action: z.enum([
      "clarify_department",
      "search",
      "answer",
      "no_results",
      "contact_team",
      "unavailable",
    ]),
    properties: z.array(safePropertyCardSchema).max(3).transform((properties) => [...properties]).optional(),
    context: propertyConversationContextSchema,
  })
  .strict();

const refinableIntegerSchema = z
  .number()
  .int()
  .min(0)
  .max(POSTGRES_SIGNED_INTEGER_MAX)
  .nullable()
  .optional();

const refinablePriceSchema = z
  .number()
  .int()
  .min(0)
  .max(Number.MAX_SAFE_INTEGER)
  .nullable()
  .optional();

export const bedroomToolFilterSchema = z
  .object({
    mode: z.enum(["exact", "minimum"]),
    value: z.number().int().min(0).max(POSTGRES_SIGNED_INTEGER_MAX),
  })
  .strict()
  .nullable()
  .optional();

export const searchPropertiesArgumentsSchema = z
  .object({
    department: z.enum(["sales", "lettings"]).optional(),
    location: z.string().trim().min(1).max(120).nullable().optional(),
    minPrice: refinablePriceSchema,
    maxPrice: refinablePriceSchema,
    bedrooms: bedroomToolFilterSchema,
    minBathrooms: refinableIntegerSchema,
    propertyTypes: uniqueArraySchema(SEARCH_PROPERTY_TYPES).optional(),
    tenures: uniqueArraySchema(SEARCH_TENURES).optional(),
    features: uniqueArraySchema(SEARCH_FEATURES).optional(),
    sort: z.enum(["default", "price_asc", "price_desc"]).nullable().optional(),
  })
  .strict();

export const getPropertyFactsArgumentsSchema = z
  .object({
    propertyIds: z
      .array(propertyIdSchema)
      .min(1)
      .max(3)
      .transform((ids) => [...ids])
      .refine((ids) => new Set(ids).size === ids.length, "Property ids must be unique"),
  })
  .strict();

export const resetPropertySearchArgumentsSchema = z.object({}).strict();

export const handoffCategorySchema = z.enum([
  "viewing",
  "valuation",
  "offer",
  "fees_finance_legal",
  "human",
]);

export const contactBancArgumentsSchema = z
  .object({
    reason: handoffCategorySchema,
  })
  .strict();

export const modelDirectiveSchema = z
  .object({
    response: safeAssistantTextSchema,
    action: z.enum([
      "clarify_department",
      "search",
      "answer",
      "no_results",
      "contact_team",
      "unavailable",
    ]),
    focusedPropertyId: propertyIdSchema.optional(),
  })
  .strict();

export type SearchPropertiesArguments = z.infer<
  typeof searchPropertiesArgumentsSchema
>;
export type GetPropertyFactsArguments = z.infer<
  typeof getPropertyFactsArgumentsSchema
>;
export type ResetPropertySearchArguments = z.infer<
  typeof resetPropertySearchArgumentsSchema
>;
export type ContactBancArguments = z.infer<typeof contactBancArgumentsSchema>;
export type ModelDirective = z.infer<typeof modelDirectiveSchema>;

export function parsePropertyConversationRequest(
  value: unknown,
): PropertyConversationRequest | null {
  return safeParseOrNull(propertyConversationRequestSchema, value);
}

export function parsePropertyConversationResponse(
  value: unknown,
): PropertyConversationResponse | null {
  return safeParseOrNull(propertyConversationResponseSchema, value);
}

export function parseSearchPropertiesArguments(
  value: unknown,
): SearchPropertiesArguments | null {
  return safeParseOrNull(searchPropertiesArgumentsSchema, value);
}

export function parseGetPropertyFactsArguments(
  value: unknown,
): GetPropertyFactsArguments | null {
  return safeParseOrNull(getPropertyFactsArgumentsSchema, value);
}

export function parseResetPropertySearchArguments(
  value: unknown,
): ResetPropertySearchArguments | null {
  return safeParseOrNull(resetPropertySearchArgumentsSchema, value);
}

export function parseContactBancArguments(
  value: unknown,
): ContactBancArguments | null {
  return safeParseOrNull(contactBancArgumentsSchema, value);
}

export function parseModelDirective(value: unknown): ModelDirective | null {
  return safeParseOrNull(modelDirectiveSchema, value);
}
