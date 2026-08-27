import { z } from "zod";

import {
  SEARCH_FEATURES,
  SEARCH_PROPERTY_TYPES,
  type SearchFeature,
  type SearchPropertyType,
} from "./crm/property-source.ts";
import {
  createDefaultPropertySearchQuery,
  MAX_PROPERTY_SEARCH_PRICE,
  POSTGRES_SIGNED_INTEGER_MAX,
  propertySearchQuerySchema,
  switchSearchDepartment,
} from "./property-search/query.ts";
import type {
  PropertyDepartment,
  PropertySearch,
  PropertySearchQuery,
  PropertySearchResult,
} from "./property-search/types.ts";
import { getSafeExternalUrl } from "./property-detail-view.ts";
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

const REQUIRED_PROPERTY_QUERY_KEYS = [
  "department",
  "propertyTypes",
  "tenures",
  "features",
  "statuses",
  "sort",
  "page",
  "pageSize",
] as const;

function hasCompletePropertySearchQuery(value: unknown): boolean {
  return typeof value === "object" &&
    value !== null &&
    REQUIRED_PROPERTY_QUERY_KEYS.every((key) => Object.hasOwn(value, key));
}

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
  [/\b(?:houses?|homes?|cottage|villa)\b/i, "house"],
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

const GENERIC_LOCATION_NOUNS = new Set([
  "house",
  "home",
  "property",
  "listing",
  "area",
  "place",
  "neighborhood",
  "neighbourhood",
  "one",
]);

const GENERIC_LOCATION_MODIFIERS = new Set([
  "this",
  "that",
  "the",
  "a",
  "an",
  "my",
  "our",
  "your",
  "its",
  "local",
  "surrounding",
  "nearby",
  "immediate",
  "current",
  "same",
  "particular",
]);

function parseCount(
  message: string,
  subject: "bed" | "bath",
): { matched: boolean; value?: number } {
  const numberWords = Object.keys(NUMBER_WORDS).join("|");
  const phrase = message.match(
    new RegExp(
      `(?:^|[^\\w,.])([+-]?[\\d.,]+(?:\\s+[\\d.,]+)*(?:[a-z]+)?|${numberWords})[-\\s]+(?:${subject}|${subject}room)s?\\b`,
      "i",
    ),
  );
  if (!phrase?.[1]) return { matched: false };
  const raw = phrase[1].toLowerCase();
  const wordValue = NUMBER_WORDS[raw];
  const numericShaped = /^[+-]?[\d.,]/.test(raw);
  if (wordValue === undefined && !numericShaped) return { matched: false };
  if (
    wordValue === undefined &&
    !/^[+-]?(?:\d{1,3}(?:,\d{3})+|\d+)$/.test(raw)
  ) {
    throw new RangeError("Count is outside the supported search range");
  }
  const value = wordValue ?? Number(raw.replaceAll(",", ""));
  if (
    !Number.isSafeInteger(value) ||
    value < 0 ||
    value > POSTGRES_SIGNED_INTEGER_MAX
  ) {
    throw new RangeError("Count is outside the supported search range");
  }
  return { matched: true, value };
}

const PRICE_PREFIX_CUE = String.raw`(?:budget\s+(?:of\s+at\s+most|set\s+at|of|is)|under|below|less\s+than|up\s+to|no\s+more\s+than|at\s+most|max(?:imum)?(?:\s+of)?|budget)`;
const PRICE_SUFFIX_CUE = String.raw`(?:max(?:imum)?|or\s+(?:less|under)|budget)`;
const PRICE_UNIT_PATTERN = /^(?:k|m|thousand|million)$/i;
const PRICE_NUMBER_PATTERN =
  /^[+-]?(?:(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?|\.\d+)$/;

interface PriceCandidate {
  index: number;
  end: number;
  rawNumber: string;
  rawUnit?: string;
}

function prefixPriceCandidates(message: string): PriceCandidate[] {
  const candidates: PriceCandidate[] = [];
  const cuePattern = new RegExp(String.raw`\b${PRICE_PREFIX_CUE}`, "gi");
  for (const cue of message.matchAll(cuePattern)) {
    if (cue.index === undefined) continue;
    const cueEnd = cue.index + cue[0].length;
    const afterCue = message.slice(cueEnd);
    const separator = afterCue.match(/^\s*[:=\-]?\s*/)?.[0] ?? "";
    const remainder = afterCue.slice(separator.length);
    const amount = remainder.match(
      /^(£)?\s*([+-]?[\d.,]+(?:\s+[\d.,]+)*)(?:\s*(k|m|thousand|million)\b)?/i,
    );
    if (amount === null) {
      if (/^(?:£\s*|[+-]?[\d.,])/.test(remainder)) {
        throw new RangeError("Price is outside the supported search range");
      }
      continue;
    }
    const amountStart = cueEnd + separator.length;
    candidates.push({
      index: cue.index,
      end: amountStart + amount[0].length,
      rawNumber: amount[2],
      rawUnit: amount[3],
    });
  }
  return candidates;
}

function suffixPriceCandidates(message: string): PriceCandidate[] {
  const candidates: PriceCandidate[] = [];
  const cuePattern = new RegExp(String.raw`\b${PRICE_SUFFIX_CUE}\b`, "gi");
  for (const cue of message.matchAll(cuePattern)) {
    if (cue.index === undefined) continue;
    const beforeCue = message.slice(0, cue.index);
    const amount = beforeCue.match(
      /(?:^|[^\w,.])((?:£)?\s*([+-]?[\d.,]+(?:\s+[\d.,]+)*)(?:\s*([a-z]+))?)([\s,;:\-]*)$/i,
    );
    if (amount === null) {
      if (/£\s*\S+(?:\s+\S+)?[\s,;:\-]*$/i.test(beforeCue)) {
        throw new RangeError("Price is outside the supported search range");
      }
      continue;
    }
    const trailingSeparators = amount[4] ?? "";
    candidates.push({
      index: amount.index ?? cue.index,
      end: cue.index - trailingSeparators.length,
      rawNumber: amount[2],
      rawUnit: amount[3],
    });
  }
  return candidates;
}

function isCountCeilingTail(value: string): boolean {
  return /^[\s,]*(?:(?:(?:and|or)\s+)?[a-z][a-z-]*(?:\s+|,\s*)){0,12}(?:bed|bedroom|bath|bathroom)s?\b/i.test(
    value,
  );
}

function normalizePriceNumber(
  rawNumber: string,
  end: number,
): { number: string; end: number } {
  const withoutTrailingPunctuation = rawNumber.slice(0, -1);
  if (
    /[,.]$/.test(rawNumber) &&
    PRICE_NUMBER_PATTERN.test(withoutTrailingPunctuation)
  ) {
    return { number: withoutTrailingPunctuation, end: end - 1 };
  }
  return { number: rawNumber, end };
}

function hasMalformedPriceContinuation(value: string): boolean {
  if (/^[\w]/.test(value)) return true;
  if (/^[,.]\s*\d/.test(value)) return true;
  return /^[,.](?!$|\s)/.test(value);
}

function parsePrice(message: string): { matched: boolean; value?: number } {
  const candidates = [
    ...prefixPriceCandidates(message),
    ...suffixPriceCandidates(message),
  ].sort((left, right) => left.index - right.index || left.end - right.end);
  let firstPrice: number | undefined;

  for (const candidate of candidates) {
    const normalized = normalizePriceNumber(candidate.rawNumber, candidate.end);
    const unit = candidate.rawUnit?.toLowerCase();
    const tail = message.slice(normalized.end);
    const isCountCandidate =
      (unit !== undefined && /^(?:bed|bedroom|bath|bathroom)s?$/.test(unit)) ||
      isCountCeilingTail(tail);
    if (isCountCandidate) continue;

    if (
      !PRICE_NUMBER_PATTERN.test(normalized.number) ||
      (unit !== undefined && !PRICE_UNIT_PATTERN.test(unit)) ||
      hasMalformedPriceContinuation(tail) ||
      /^\s+(?:hundred|thousands?|millions?|billions?|trillions?)\b/i.test(tail)
    ) {
      throw new RangeError("Price is outside the supported search range");
    }

    const numeric = Number(normalized.number.replaceAll(",", ""));
    const multiplier = unit === "m" || unit === "million"
      ? 1_000_000
      : unit === "k" || unit === "thousand"
        ? 1_000
        : 1;
    const value = Math.round(numeric * multiplier);
    if (
      !Number.isSafeInteger(value) ||
      value < 0 ||
      value > MAX_PROPERTY_SEARCH_PRICE
    ) {
      throw new RangeError("Price is outside the supported search range");
    }
    firstPrice ??= value;
  }

  return firstPrice === undefined
    ? { matched: false }
    : { matched: true, value: firstPrice };
}

function parseLocation(message: string): string | undefined {
  const matches = [
    ...message.matchAll(
      /(?=\b(?:in|near)\s+([a-z0-9][a-z0-9 '\u2019-]*?)(?=\s+(?:under|below|up to|max(?:imum)?|with|for|at|from|have|has|having|that|which)\b|\s+\d+\s*(?:bed|bath)|[?!,.]|$))/gi,
    ),
  ];
  const location = matches
    .map((match) => match[1]?.trim())
    .filter((candidate): candidate is string => candidate !== undefined)
    .filter(
      (candidate) => !isGenericLocationCandidate(candidate),
    )
    .at(-1);
  return location && location.length <= 120 ? location : undefined;
}

function isGenericLocationCandidate(candidate: string): boolean {
  const normalized = candidate.toLowerCase().trim().replace(/\s+/g, " ");
  if (/^(?:this|that|it|here|there)$/.test(normalized)) return true;

  const tokens = normalized.split(" ");
  const finalToken = tokens.at(-1);
  if (finalToken === undefined || !GENERIC_LOCATION_NOUNS.has(finalToken)) {
    return false;
  }
  return tokens.slice(0, -1).every((token) =>
    GENERIC_LOCATION_MODIFIERS.has(token)
  );
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
  const parsedPrice = parsePrice(message);
  if (parsedPrice.matched && parsedPrice.value !== undefined) {
    patch.maxPrice = parsedPrice.value;
  }
  const minBedrooms = parseCount(message, "bed");
  if (minBedrooms.matched) patch.minBedrooms = minBedrooms.value;
  const minBathrooms = parseCount(message, "bath");
  if (minBathrooms.matched) patch.minBathrooms = minBathrooms.value;

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
      if (!hasCompletePropertySearchQuery(query)) return null;
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
    /\bis\s+there\s+(?:parking|(?:fibre\s+)?broadband|a\s+(?:garage|garden|balcony|fireplace|conservatory))\b/i.test(
      message,
    ) ||
    /\bare\s+(?:there\s+)?(?:any\s+|good\s+|local\s+)?(?:schools?|stations?|transport links?|shops?)\b/i.test(
      message,
    ) ||
    /\b(?:does|do|has|have|is|are)\s+(?:this|that|it|the property|the listing)\b/i.test(
      message,
    ) ||
    /\bwhat(?:'s| is)?\s+(?:the\s+)?(?:tenure|council tax|epc|broadband)\b/i.test(
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
  const department = messagePatch.department ?? current?.department;
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

const safePropertyCardSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    address: z.string(),
    price: z.string(),
    priceNum: z.number().finite().nonnegative(),
    tags: z.array(z.string()),
    stats: z
      .object({
        beds: z.number().int().nonnegative(),
        baths: z.number().int().nonnegative(),
        sqft: z.number().finite().positive().optional(),
        epc: z.string().optional(),
      })
      .strict(),
    images: z.array(z.string()),
    summary: z.string(),
    propertyType: z.enum(SEARCH_PROPERTY_TYPES),
    department: z.enum(["sales", "lettings"]),
    status: z.enum(["for_sale", "under_offer", "to_let", "let_agreed"]),
  })
  .strict();

const safeSearchResultSchema = z
  .object({
    query: propertySearchQuerySchema,
    properties: z.array(safePropertyCardSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
    lastSyncedAt: z.string().datetime({ offset: true }).nullable(),
  })
  .strict();

function arraysEqual<T>(left: readonly T[], right: readonly T[]): boolean {
  return left.length === right.length &&
    left.every((value, index) => value === right[index]);
}

function searchQueriesEqual(
  left: PropertySearchQuery,
  right: PropertySearchQuery,
): boolean {
  return left.department === right.department &&
    left.location === right.location &&
    left.minPrice === right.minPrice &&
    left.maxPrice === right.maxPrice &&
    left.minBedrooms === right.minBedrooms &&
    left.minBathrooms === right.minBathrooms &&
    arraysEqual(left.propertyTypes, right.propertyTypes) &&
    arraysEqual(left.tenures, right.tenures) &&
    arraysEqual(left.features, right.features) &&
    arraysEqual(left.statuses, right.statuses) &&
    left.sort === right.sort &&
    left.page === right.page &&
    left.pageSize === right.pageSize;
}

function rawValuesEqual(left: unknown, right: unknown): boolean {
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => rawValuesEqual(value, right[index]));
  }
  if (
    typeof left === "object" ||
    typeof right === "object" ||
    left === null ||
    right === null
  ) {
    if (
      typeof left !== "object" ||
      typeof right !== "object" ||
      left === null ||
      right === null
    ) {
      return false;
    }
    const leftRecord = left as Record<string, unknown>;
    const rightRecord = right as Record<string, unknown>;
    const leftKeys = Object.keys(leftRecord).sort();
    const rightKeys = Object.keys(rightRecord).sort();
    return arraysEqual(leftKeys, rightKeys) &&
      leftKeys.every((key) => rawValuesEqual(leftRecord[key], rightRecord[key]));
  }
  return Object.is(left, right);
}

function parseSafeSearchResult(
  value: unknown,
  query: PropertySearchQuery,
): PropertySearchResult | null {
  if (
    typeof value !== "object" ||
    value === null ||
    !("query" in value) ||
    !hasCompletePropertySearchQuery(value.query) ||
    !rawValuesEqual(value.query, query)
  ) {
    return null;
  }
  const parsed = safeSearchResultSchema.safeParse(value);
  if (!parsed.success) return null;
  const result = parsed.data;
  const expectedProperties = Math.min(3, result.total);
  if (
    !searchQueriesEqual(result.query, query) ||
    result.page !== 1 ||
    result.pageSize !== 3 ||
    result.totalPages !== (result.total === 0 ? 0 : Math.ceil(result.total / 3)) ||
    result.properties.length !== expectedProperties ||
    result.properties.some(
      (property) =>
        property.department !== query.department ||
        !query.statuses.some((status) => status === property.status),
    )
  ) {
    return null;
  }

  return {
    ...result,
    properties: result.properties.map((property) => ({
      ...property,
      images: property.images
        .map(getSafeExternalUrl)
        .filter((image): image is string => image !== null),
    })),
  };
}

function clarificationHistoryPatch(
  request: PropertyChatRequest,
  messagePatch: PropertyChatPatch,
): PropertyChatPatch {
  if (request.context !== undefined || messagePatch.department === undefined) return {};
  const assistant = request.history.at(-1);
  const user = request.history.at(-2);
  if (
    assistant?.role !== "assistant" ||
    assistant.content !== CLARIFY_DEPARTMENT ||
    user?.role !== "user"
  ) {
    return {};
  }

  const criteria = { ...parsePropertyChatPatch(user.content) };
  delete criteria.department;
  return criteria;
}

export function createPropertyChatHandler(search: PropertySearch) {
  return async (request: PropertyChatRequest): Promise<PropertyChatResponse> => {
    const currentContext = request.context;
    const departmentIntent = parseDepartment(request.message);

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
    const hasExplicitSearchIntent =
      departmentIntent !== undefined || parseLocation(request.message) !== undefined;
    if (
      currentContext !== undefined &&
      !hasExplicitSearchIntent &&
      isMissingFactQuestion(request.message)
    ) {
      return withContext(
        { response: MISSING_FACT, action: "contact_team" },
        currentContext,
      );
    }

    if (departmentIntent === "ambiguous") {
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
      const messagePatch = parsePropertyChatPatch(request.message);
      query = createSearchQuery(
        currentQuery,
        clarificationHistoryPatch(request, messagePatch),
        messagePatch,
      );
    } catch {
      return { response: SEARCH_UNAVAILABLE, action: "contact_team" };
    }
    if (query === null) {
      return { response: CLARIFY_DEPARTMENT, action: "clarify_department" };
    }

    const context = { query };
    try {
      const result = parseSafeSearchResult(await search(query), query);
      if (result === null) {
        return {
          response: SEARCH_UNAVAILABLE,
          action: "contact_team",
          context,
        };
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
      return { response: SEARCH_UNAVAILABLE, action: "contact_team", context };
    }
  };
}
