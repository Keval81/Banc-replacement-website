import { z } from "zod";

import {
  SEARCH_FEATURES,
  SEARCH_PROPERTY_TYPES,
  type SearchFeature,
  type SearchPropertyType,
} from "./crm/property-source.ts";
import {
  createDefaultPropertySearchQuery,
  propertySearchQuerySchema,
  switchSearchDepartment,
} from "./property-search/query.ts";
import type {
  PropertyDepartment,
  PropertySearch,
  PropertySearchQuery,
  PropertySearchResult,
} from "./property-search/types.ts";
import type { PropertyCardData } from "./property-view.ts";

export interface ChatSearchContext {
  query: PropertySearchQuery;
}

export interface PropertyChatRequest {
  message: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  context?: ChatSearchContext;
}

export interface PropertyChatResponse {
  response: string;
  action: "clarify_department" | "search" | "no_results" | "contact_team";
  properties?: PropertyCardData[];
  context?: ChatSearchContext;
}

export interface PropertyChatPatch {
  department?: PropertyDepartment;
  location?: string;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  propertyTypes?: SearchPropertyType[];
  features?: SearchFeature[];
  sort?: "price_asc";
}

const messageSchema = z.string().trim().min(1).max(2_000);
const historyMessageSchema = z
  .object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(2_000),
  })
  .strict();
const propertyChatRequestSchema = z
  .object({
    message: messageSchema,
    history: z.array(historyMessageSchema).max(20),
    context: z
      .object({ query: propertySearchQuerySchema })
      .strict()
      .optional(),
  })
  .strict();

const NUMBER_WORDS: Readonly<Record<string, number>> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

const PROPERTY_TYPE_ALIASES: ReadonlyArray<
  readonly [RegExp, SearchPropertyType]
> = [
  [/\b(?:flat|apartment|studio|penthouse)\b/i, "flat"],
  [/\bmaisonette\b/i, "maisonette"],
  [/\bbungalow\b/i, "bungalow"],
  [/\b(?:land|plot)\b/i, "land"],
  [/\b(?:commercial|office|retail|shop)\b/i, "commercial"],
  [/\b(?:house|home|cottage|villa)\b/i, "house"],
];

const FEATURE_PATTERNS: Readonly<Record<SearchFeature, RegExp>> = {
  garden: /\b(?:garden|outside space|patio|terrace)\b/i,
  parking: /\b(?:parking|driveway|off[- ]street parking)\b/i,
  garage: /\bgarage\b/i,
  balcony: /\bbalcony\b/i,
  conservatory: /\bconservator(?:y|ies)\b/i,
  fireplace: /\b(?:fireplace|log burner|wood burner)\b/i,
  period_features: /\b(?:period features?|character features?)\b/i,
  new_home: /\b(?:new build|new home|newly built)\b/i,
  chain_free: /\b(?:chain free|no chain|no onward chain)\b/i,
  virtual_tour: /\bvirtual tour\b/i,
  video_tour: /\bvideo tour\b/i,
};

const SALES_INTENT = /\b(?:buy|buying|purchase|purchasing)\b|\bfor sale\b/i;
const LETTINGS_INTENT = /\b(?:rent|renting|rental)\b|\bto let\b|\bpcm\b/i;

const CLARIFY_DEPARTMENT = "Are you looking to buy or rent?";
const NO_RESULTS =
  "I couldn't find an exact match. Try widening the location or removing one filter.";
const SEARCH_UNAVAILABLE =
  "Live listings are temporarily unavailable. Please try again shortly or call Banc on 01707 877781.";
const MISSING_FACT =
  "The listing doesn't specify that. The Banc team can confirm it for you.";
const VIEWING_HANDOFF =
  "The chatbot can't book viewings or check availability. Please contact the Banc team or call Banc on 01707 877781.";
const VALUATION_HANDOFF =
  "The chatbot can't provide or submit a valuation. Please contact the Banc team or call Banc on 01707 877781.";
const TRANSACTION_HANDOFF =
  "The chatbot can't complete that transaction. Please contact the Banc team or call Banc on 01707 877781.";
const HUMAN_HANDOFF =
  "You can speak with the Banc team by calling 01707 877781 or using the contact page.";

function parseCount(message: string, subject: "bed" | "bath"): number | undefined {
  const match = message.match(
    new RegExp(
      `\\b(\\d+|${Object.keys(NUMBER_WORDS).join("|")})[-\\s]*(?:${subject}|${subject}room)s?\\b`,
      "i",
    ),
  );
  if (!match?.[1]) return undefined;
  const raw = match[1].toLowerCase();
  const value = NUMBER_WORDS[raw] ?? Number(raw);
  return Number.isSafeInteger(value) && value >= 0 ? value : undefined;
}

function parsePrice(message: string): number | undefined {
  const match = message.match(
    /\b(?:under|below|up to|max|maximum)\s*£?\s*(\d[\d,]*(?:\.\d+)?)\s*(k|m)?\b/i,
  );
  if (!match?.[1]) return undefined;
  const numeric = Number(match[1].replaceAll(",", ""));
  const multiplier = match[2]?.toLowerCase() === "m"
    ? 1_000_000
    : match[2]?.toLowerCase() === "k"
      ? 1_000
      : 1;
  const value = Math.round(numeric * multiplier);
  return Number.isSafeInteger(value) && value >= 0 ? value : undefined;
}

function parseLocation(message: string): string | undefined {
  const match = message.match(
    /\b(?:in|near)\s+([a-z0-9][a-z0-9 '\u2019-]*?)(?=\s+(?:under|below|up to|max(?:imum)?|with|for|at|from|having|that|which)\b|\s+\d+\s*(?:bed|bath)|[?!,.]|$)/i,
  );
  const location = match?.[1]?.trim();
  return location && location.length <= 120 ? location : undefined;
}

function parseDepartment(message: string): PropertyDepartment | "ambiguous" | undefined {
  const sales = SALES_INTENT.test(message);
  const lettings = LETTINGS_INTENT.test(message);
  if (sales && lettings) return "ambiguous";
  if (sales) return "sales";
  if (lettings) return "lettings";
  return undefined;
}

export function parsePropertyChatPatch(message: string): PropertyChatPatch {
  const patch: PropertyChatPatch = {};
  const department = parseDepartment(message);
  if (department !== undefined && department !== "ambiguous") {
    patch.department = department;
  }

  const location = parseLocation(message);
  if (location !== undefined) patch.location = location;
  const maxPrice = parsePrice(message);
  if (maxPrice !== undefined) patch.maxPrice = maxPrice;
  const minBedrooms = parseCount(message, "bed");
  if (minBedrooms !== undefined) patch.minBedrooms = minBedrooms;
  const minBathrooms = parseCount(message, "bath");
  if (minBathrooms !== undefined) patch.minBathrooms = minBathrooms;

  const propertyTypes = PROPERTY_TYPE_ALIASES
    .filter(([pattern]) => pattern.test(message))
    .map(([, propertyType]) => propertyType);
  if (propertyTypes.length > 0) {
    patch.propertyTypes = SEARCH_PROPERTY_TYPES.filter((propertyType) =>
      propertyTypes.includes(propertyType),
    );
  }

  const features = SEARCH_FEATURES.filter((feature) =>
    FEATURE_PATTERNS[feature].test(message),
  );
  if (features.length > 0) patch.features = features;
  if (/\bcheaper\b/i.test(message)) patch.sort = "price_asc";
  return patch;
}

export function parsePropertyChatRequest(value: unknown): PropertyChatRequest | null {
  if (typeof value === "object" && value !== null && "context" in value) {
    const context = (value as { context?: unknown }).context;
    if (context !== undefined) {
      if (typeof context !== "object" || context === null || !("query" in context)) {
        return null;
      }
      const query = (context as { query?: unknown }).query;
      if (typeof query !== "object" || query === null) return null;
      const requiredKeys = [
        "department",
        "propertyTypes",
        "tenures",
        "features",
        "statuses",
        "sort",
        "page",
        "pageSize",
      ];
      if (!requiredKeys.every((key) => Object.hasOwn(query, key))) return null;
    }
  }
  const parsed = propertyChatRequestSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function withContext(
  response: Omit<PropertyChatResponse, "context">,
  context: ChatSearchContext | undefined,
): PropertyChatResponse {
  return context === undefined ? response : { ...response, context };
}

function isViewingRequest(message: string): boolean {
  return (
    /\b(?:book|arrange|schedule)\b[^.!?]{0,50}\bviewing\b/i.test(message) ||
    /\bview(?:ing)?\b/i.test(message) ||
    /\b(?:see|visit)\s+(?:this|that|the|a)\s+(?:property|home|house|flat|listing)\b/i.test(
      message,
    ) ||
    /\b(?:reserve|reservation)\b/i.test(message) ||
    /\b(?:check|confirm|tell me)\b[^.!?]{0,30}\bavailability\b/i.test(message)
  );
}

function isValuationRequest(message: string): boolean {
  return (
    /\bvaluation\b/i.test(message) ||
    /\bvalue\s+my\b/i.test(message) ||
    /\b(?:what(?:'s| is)|how much is)\s+my\s+(?:property|home|house|flat)\s+worth\b/i.test(
      message,
    ) ||
    /\b(?:sell|selling|let|letting|rent out)\s+my\b/i.test(message)
  );
}

function isUnsupportedTransaction(message: string): boolean {
  return /\b(?:submit|make|place)\b[^.!?]{0,30}\boffer\b|\b(?:apply|register|sign up)\b|\bproperty alert\b|\b(?:fees?|commission|mortgage|finance|loan)\b/i.test(
    message,
  );
}

function isHumanContactRequest(message: string): boolean {
  return /\b(?:speak|talk|chat)\s+(?:to|with)\s+(?:a\s+)?(?:person|human|agent|the Banc team)\b|\bcontact\s+(?:the\s+)?Banc team\b/i.test(
    message,
  );
}

function isMissingFactQuestion(message: string): boolean {
  return (
    /\b(?:does|do|has|have|is|are)\s+(?:this|that|it|the property|the listing)\b/i.test(
      message,
    ) ||
    /\bwhat(?:'s| is)\s+(?:the\s+)?(?:tenure|council tax|epc|broadband)\b/i.test(
      message,
    ) ||
    /\bhow\s+(?:old|large|fast)\b/i.test(message)
  );
}

function mergeFeatures(
  current: readonly SearchFeature[],
  added: readonly SearchFeature[] | undefined,
): SearchFeature[] {
  if (added === undefined) return [...current];
  const selected = new Set([...current, ...added]);
  return SEARCH_FEATURES.filter((feature) => selected.has(feature));
}

function createSearchQuery(
  current: PropertySearchQuery | undefined,
  historyPatch: PropertyChatPatch,
  messagePatch: PropertyChatPatch,
): PropertySearchQuery | null {
  const department =
    messagePatch.department ?? current?.department ?? historyPatch.department;
  if (department === undefined) return null;

  const base = current === undefined
    ? createDefaultPropertySearchQuery(department)
    : switchSearchDepartment(current, department);
  const priorPatch = current === undefined ? historyPatch : {};
  const combined = { ...priorPatch, ...messagePatch };
  const features = mergeFeatures(base.features, [
    ...(priorPatch.features ?? []),
    ...(messagePatch.features ?? []),
  ]);

  return propertySearchQuerySchema.parse({
    ...base,
    ...combined,
    department,
    features,
    page: 1,
    pageSize: 3,
  });
}

function isSafePropertyCard(
  property: PropertyCardData,
  query: PropertySearchQuery,
): boolean {
  if (
    typeof property.id !== "string" ||
    typeof property.title !== "string" ||
    typeof property.address !== "string" ||
    typeof property.price !== "string" ||
    typeof property.priceNum !== "number" ||
    !Number.isFinite(property.priceNum) ||
    property.priceNum < 0 ||
    !Array.isArray(property.tags) ||
    !property.tags.every((tag) => typeof tag === "string") ||
    typeof property.stats?.beds !== "number" ||
    !Number.isSafeInteger(property.stats.beds) ||
    property.stats.beds < 0 ||
    typeof property.stats?.baths !== "number" ||
    !Number.isSafeInteger(property.stats.baths) ||
    property.stats.baths < 0 ||
    !Array.isArray(property.images) ||
    !property.images.every((image) => typeof image === "string") ||
    typeof property.summary !== "string" ||
    !SEARCH_PROPERTY_TYPES.includes(property.propertyType as SearchPropertyType) ||
    property.department !== query.department ||
    !query.statuses.some((status) => status === property.status)
  ) {
    return false;
  }
  return true;
}

function isSafeSearchResult(
  result: PropertySearchResult,
  query: PropertySearchQuery,
): boolean {
  if (
    result.query.department !== query.department ||
    result.page !== 1 ||
    result.pageSize !== 3 ||
    !Number.isSafeInteger(result.total) ||
    result.total < 0 ||
    !Number.isSafeInteger(result.totalPages) ||
    result.totalPages !== (result.total === 0 ? 0 : Math.ceil(result.total / 3)) ||
    !Array.isArray(result.properties) ||
    (result.total === 0 && result.properties.length !== 0) ||
    (result.total > 0 && result.properties.length === 0) ||
    result.properties.length > result.total
  ) {
    return false;
  }
  return result.properties.every((property) => isSafePropertyCard(property, query));
}

function lastUserPatch(request: PropertyChatRequest): PropertyChatPatch {
  if (request.context !== undefined) return {};
  const previous = request.history.findLast((message) => message.role === "user");
  return previous === undefined ? {} : parsePropertyChatPatch(previous.content);
}

export function createPropertyChatHandler(search: PropertySearch) {
  return async (request: PropertyChatRequest): Promise<PropertyChatResponse> => {
    const currentContext = request.context;

    if (isViewingRequest(request.message)) {
      return withContext(
        { response: VIEWING_HANDOFF, action: "contact_team" },
        currentContext,
      );
    }
    if (isValuationRequest(request.message)) {
      return withContext(
        { response: VALUATION_HANDOFF, action: "contact_team" },
        currentContext,
      );
    }
    if (isUnsupportedTransaction(request.message)) {
      return withContext(
        { response: TRANSACTION_HANDOFF, action: "contact_team" },
        currentContext,
      );
    }
    if (isHumanContactRequest(request.message)) {
      return withContext(
        { response: HUMAN_HANDOFF, action: "contact_team" },
        currentContext,
      );
    }
    if (isMissingFactQuestion(request.message)) {
      return withContext(
        { response: MISSING_FACT, action: "contact_team" },
        currentContext,
      );
    }

    if (parseDepartment(request.message) === "ambiguous") {
      return { response: CLARIFY_DEPARTMENT, action: "clarify_department" };
    }

    let currentQuery: PropertySearchQuery | undefined;
    try {
      currentQuery = currentContext === undefined
        ? undefined
        : propertySearchQuerySchema.parse(currentContext.query);
    } catch {
      return { response: SEARCH_UNAVAILABLE, action: "contact_team" };
    }

    let query: PropertySearchQuery | null;
    try {
      query = createSearchQuery(
        currentQuery,
        lastUserPatch(request),
        parsePropertyChatPatch(request.message),
      );
    } catch {
      return { response: SEARCH_UNAVAILABLE, action: "contact_team" };
    }
    if (query === null) {
      return { response: CLARIFY_DEPARTMENT, action: "clarify_department" };
    }

    const context = { query };
    try {
      const result = await search(query);
      if (!isSafeSearchResult(result, query)) {
        return { response: SEARCH_UNAVAILABLE, action: "contact_team" };
      }
      if (result.total === 0) {
        return { response: NO_RESULTS, action: "no_results", context };
      }

      const noun = result.total === 1 ? "property" : "properties";
      return {
        response: `I found ${result.total} matching ${noun}. Here are the first results.`,
        action: "search",
        properties: result.properties.slice(0, 3),
        context,
      };
    } catch {
      return { response: SEARCH_UNAVAILABLE, action: "contact_team" };
    }
  };
}
