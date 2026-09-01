import { BANC_CONTACT, BANC_MAYFAIR_CONTACT } from "../banc-contact.ts";
import type { SanitizedOperationResult } from "./tools.ts";

/**
 * Server-side grounding checks for model-written prose.
 *
 * The model is allowed to word the reply naturally, but every number, price,
 * count, feature and property attribution it makes must be traceable to the
 * sanitized trusted results for the turn. Anything that cannot be traced is
 * rejected so the caller can fall back to server-authored wording.
 */

export const MAX_GROUNDED_RESPONSE_CHARACTERS = 700;
export const MAX_GROUNDED_RESPONSE_SENTENCES = 5;

const APPROVED_PHONE_DIGITS = new Set(
  [BANC_CONTACT.displayPhone, BANC_MAYFAIR_CONTACT.displayPhone].map((phone) =>
    phone.replaceAll(/\D/g, "")
  ),
);

const LINK_PATTERN =
  /\b(?:https?:\/\/|www\.|mailto:|tel:)|\[[^\]]+\]\([^)]+\)|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|(?:[A-Z0-9-]+\.)+(?:com|co\.uk|uk|org|net|io|info|biz|me|app|dev|ai)(?:\/[^\s]*)?\b/i;
const PHONE_PATTERN = /(?:\+?\d[\d\s().-]{7,}\d)/g;
const COMPLETED_ACTION_PATTERN =
  /\b(?:(?:i(?:'ve| have)?|we(?:'ve| have)?|has been|have been|is|was|are|were)\s+(?:now\s+)?(?:booked|arranged|scheduled|confirmed|submitted|registered|sent|reserved|secured|logged|passed on|forwarded|emailed|notified|actioned)|(?:booking|viewing|valuation|offer|appointment)\s+(?:is|has been|was)\s+(?:booked|confirmed|arranged|scheduled|submitted|accepted)|(?:will|i'll|we'll)\s+(?:call|phone|ring|email|text|contact)\s+you\b)/i;

const NUMBER_WORDS: Record<string, number> = {
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
};

const NUMBER_PATTERN =
  /£?\s?(\d[\d,]*(?:\.\d+)?)\s?(million|thousand|m|k|%|pcm|pw|sq\s?ft|sqft|am|pm)?\b/gi;
const ORDINAL_PATTERN = /\b\d+(?:st|nd|rd|th)\b/gi;

/**
 * Words that assert a concrete property, place or policy fact. A sentence may
 * use one of these only when a trusted entity in scope contains the same term.
 */
const CLAIM_VOCABULARY = new Set([
  "acre",
  "annexe",
  "annex",
  "balcony",
  "basement",
  "cellar",
  "chain",
  "charge",
  "cinema",
  "commission",
  "conservatory",
  "deposit",
  "detached",
  "discount",
  "driveway",
  "en-suite",
  "ensuite",
  "epc",
  "fee",
  "fireplace",
  "freehold",
  "garage",
  "garden",
  "gym",
  "kitchen",
  "landscaped",
  "leasehold",
  "loft",
  "lounge",
  "office",
  "orangery",
  "outbuilding",
  "paddock",
  "parking",
  "patio",
  "pool",
  "porch",
  "refurbished",
  "renovated",
  "school",
  "semi-detached",
  "shower",
  "stable",
  "station",
  "study",
  "swimming",
  "terrace",
  "terraced",
  "tour",
  "utility",
  "wallpaper",
  "wardrobe",
  "workshop",
]);

const CLAIM_SYNONYMS: Record<string, readonly string[]> = {
  "en-suite": ["ensuite", "en_suite", "en suite"],
  ensuite: ["en-suite", "en_suite", "en suite"],
  pool: ["swimming_pool", "swimming pool"],
  swimming: ["swimming_pool", "swimming pool"],
  chain: ["chain_free", "chain free"],
  tour: ["virtual_tour", "video_tour", "virtual tour", "video tour"],
};

interface TrustedEntity {
  /** Lower-cased names that identify this entity inside a sentence. */
  names: string[];
  /** Normalised numeric values the entity is allowed to justify. */
  numbers: Set<string>;
  /** Lower-cased tokens the entity is allowed to justify. */
  tokens: Set<string>;
}

interface GroundingContext {
  entities: TrustedEntity[];
  globalNumbers: Set<string>;
  globalTokens: Set<string>;
  percentAllowed: boolean;
}

function tokensOf(value: string | null | undefined): string[] {
  if (typeof value !== "string") return [];
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .match(/[a-z0-9][a-z0-9'-]*/g) ?? [];
}

function singular(token: string): string {
  if (token.length > 4 && token.endsWith("ies")) return `${token.slice(0, -3)}y`;
  if (
    token.length > 3 &&
    token.endsWith("s") &&
    !token.endsWith("ss") &&
    !token.endsWith("us") &&
    !token.endsWith("is")
  ) {
    return token.slice(0, -1);
  }
  return token;
}

function normalisedTokens(value: string | null | undefined): string[] {
  return tokensOf(value).map(singular);
}

function digitsOf(value: string | number | null | undefined): string[] {
  if (value === null || value === undefined) return [];
  const text = typeof value === "number" ? String(value) : value;
  return (text.match(/\d[\d,]*(?:\.\d+)?/g) ?? []).map(normaliseNumber);
}

function normaliseNumber(raw: string): string {
  const cleaned = raw.replaceAll(",", "");
  const numeric = Number(cleaned);
  return Number.isFinite(numeric) ? String(numeric) : cleaned;
}

function scaledNumber(raw: string, suffix: string | undefined): string {
  const base = Number(raw.replaceAll(",", ""));
  if (!Number.isFinite(base)) return raw;
  switch (suffix?.toLowerCase().replaceAll(/\s/g, "")) {
    case "million":
    case "m":
      return String(base * 1_000_000);
    case "thousand":
    case "k":
      return String(base * 1_000);
    default:
      return String(base);
  }
}

function addAll<T>(target: Set<T>, values: Iterable<T>): void {
  for (const value of values) target.add(value);
}

function entityFromProperty(input: {
  title: string;
  address?: string;
  numbers: Array<string | number | null | undefined>;
  texts: Array<string | null | undefined>;
}): TrustedEntity {
  const numbers = new Set<string>();
  for (const value of input.numbers) addAll(numbers, digitsOf(value));
  addAll(numbers, digitsOf(input.title));
  addAll(numbers, digitsOf(input.address));

  const tokens = new Set<string>();
  for (const text of [input.title, input.address, ...input.texts]) {
    addAll(tokens, normalisedTokens(text));
  }

  const names = [input.title.toLowerCase().trim()];
  const titleTokens = tokensOf(input.title);
  if (titleTokens.length >= 2) {
    names.push(titleTokens.slice(0, 2).join(" "));
  }
  return { names: names.filter((name) => name.length > 0), numbers, tokens };
}

export function createGroundingContext(
  results: readonly SanitizedOperationResult[],
): GroundingContext {
  const entities: TrustedEntity[] = [];
  const globalNumbers = new Set<string>();
  const globalTokens = new Set<string>();
  let percentAllowed = false;

  for (const result of results) {
    switch (result.status) {
      case "search_results":
      case "no_results": {
        globalNumbers.add(String(result.total));
        const query = result.requirements;
        for (const value of [
          query.minPrice,
          query.maxPrice,
          query.minBedrooms,
          query.maxBedrooms,
          query.minBathrooms,
        ]) {
          if (typeof value === "number") globalNumbers.add(String(value));
        }
        for (const feature of query.features) {
          addAll(globalTokens, normalisedTokens(feature));
        }
        for (const type of query.propertyTypes) {
          addAll(globalTokens, normalisedTokens(type));
        }
        for (const tenure of query.tenures) {
          addAll(globalTokens, normalisedTokens(tenure));
        }
        if (query.location !== undefined) {
          addAll(globalTokens, normalisedTokens(query.location));
        }
        for (const property of result.properties) {
          entities.push(entityFromProperty({
            title: property.title,
            address: property.address,
            numbers: [property.price, property.bedrooms, property.bathrooms],
            texts: [property.summary],
          }));
        }
        break;
      }
      case "property_facts":
        for (const fact of result.facts) {
          entities.push(entityFromProperty({
            title: fact.title,
            address: fact.address,
            numbers: [
              fact.price,
              fact.priceDisplay,
              fact.bedrooms,
              fact.bathrooms,
              fact.receptions,
              fact.sqft,
            ],
            texts: [
              fact.summary,
              fact.propertyType,
              fact.tenure,
              fact.epc === null ? null : `epc ${fact.epc}`,
              ...fact.features,
            ],
          }));
        }
        break;
      case "knowledge":
        for (const source of result.sources) {
          const entity = entityFromProperty({
            title: source.title,
            numbers: [source.excerpt],
            texts: [source.excerpt],
          });
          // Knowledge excerpts are not property names; make their evidence global.
          addAll(globalNumbers, entity.numbers);
          addAll(globalTokens, entity.tokens);
          if (source.excerpt.includes("%")) percentAllowed = true;
        }
        break;
      case "clarification_required":
        addAll(globalNumbers, digitsOf(result.question));
        addAll(globalTokens, normalisedTokens(result.question));
        break;
      case "reset":
      case "contact":
        break;
    }
  }

  return { entities, globalNumbers, globalTokens, percentAllowed };
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}

function replaceNumberWords(sentence: string): string {
  return sentence.replaceAll(/\b([a-z]+)\b/gi, (word) => {
    const value = NUMBER_WORDS[word.toLowerCase()];
    return value === undefined ? word : String(value);
  });
}

function sentenceNumbers(sentence: string): Array<{ value: string }> {
  const prepared = replaceNumberWords(sentence).replaceAll(ORDINAL_PATTERN, "");
  const found: Array<{ value: string }> = [];
  for (const match of prepared.matchAll(NUMBER_PATTERN)) {
    const raw = match[1];
    const suffix = match[2];
    if (raw === undefined) continue;
    found.push({ value: scaledNumber(raw, suffix) });
  }
  return found;
}

function claimTokens(sentence: string): string[] {
  return tokensOf(sentence)
    .map(singular)
    .filter((token) => CLAIM_VOCABULARY.has(token));
}

function entityJustifiesToken(entity: Pick<TrustedEntity, "tokens">, token: string): boolean {
  if (entity.tokens.has(token)) return true;
  const synonyms = CLAIM_SYNONYMS[token] ?? [];
  return synonyms.some((synonym) =>
    normalisedTokens(synonym).every((part) => entity.tokens.has(part))
  );
}

function mentionedEntities(
  text: string,
  entities: readonly TrustedEntity[],
): TrustedEntity[] {
  const lowered = text.toLowerCase();
  return entities.filter((entity) =>
    entity.names.some((name) => lowered.includes(name))
  );
}

const CLAUSE_SPLIT_PATTERN = /\s+(?:and|but|while|whereas|although)\s+|[;,]\s+/i;

interface ScopedClause {
  text: string;
  scope: TrustedEntity[];
}

/**
 * Splits a sentence into clauses and attributes each clause to the trusted
 * entities it names. A clause that names nothing inherits the sentence scope,
 * and a sentence that names nothing is checked against every entity.
 */
function scopedClauses(
  sentence: string,
  context: GroundingContext,
): ScopedClause[] {
  const sentenceScope = mentionedEntities(sentence, context.entities);
  const fallbackScope = sentenceScope.length > 0 ? sentenceScope : context.entities;
  return sentence
    .split(CLAUSE_SPLIT_PATTERN)
    .map((clause) => clause.trim())
    .filter((clause) => clause.length > 0)
    .map((clause) => {
      const clauseScope = mentionedEntities(clause, context.entities);
      return {
        text: clause,
        scope: clauseScope.length > 0 ? clauseScope : fallbackScope,
      };
    });
}

function containsUnapprovedPhone(text: string): boolean {
  for (const match of text.matchAll(PHONE_PATTERN)) {
    const digits = match[0].replaceAll(/\D/g, "");
    if (!APPROVED_PHONE_DIGITS.has(digits)) return true;
  }
  return false;
}

export type GroundingVerdict =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * Validates model prose against the trusted results for the turn.
 */
export function verifyGroundedResponse(
  text: string,
  results: readonly SanitizedOperationResult[],
): GroundingVerdict {
  const trimmed = text.trim();
  if (trimmed.length === 0) return { ok: false, reason: "empty" };
  if (trimmed.length > MAX_GROUNDED_RESPONSE_CHARACTERS) {
    return { ok: false, reason: "too_long" };
  }
  if (LINK_PATTERN.test(trimmed)) return { ok: false, reason: "link" };
  if (containsUnapprovedPhone(trimmed)) return { ok: false, reason: "phone" };
  if (COMPLETED_ACTION_PATTERN.test(trimmed)) {
    return { ok: false, reason: "completed_action" };
  }
  if (/[<>{}[\]`*#_]/.test(trimmed)) return { ok: false, reason: "markup" };

  const sentences = splitSentences(trimmed);
  if (sentences.length > MAX_GROUNDED_RESPONSE_SENTENCES) {
    return { ok: false, reason: "too_many_sentences" };
  }

  const context = createGroundingContext(results);

  for (const sentence of sentences) {
    if (/\d\s?%/.test(sentence) && !context.percentAllowed) {
      return { ok: false, reason: "percent" };
    }
    const isQuestion = sentence.includes("?");

    for (const clause of scopedClauses(sentence, context)) {
      const allowedNumbers = new Set(context.globalNumbers);
      for (const entity of clause.scope) addAll(allowedNumbers, entity.numbers);

      for (const number of sentenceNumbers(clause.text)) {
        if (!allowedNumbers.has(number.value)) {
          return { ok: false, reason: `number:${number.value}` };
        }
      }

      // Questions may float a filter ("Would you like to add parking?")
      // without asserting a fact about a property.
      if (isQuestion) continue;
      for (const token of claimTokens(clause.text)) {
        const justified =
          entityJustifiesToken({ tokens: context.globalTokens }, token) ||
          clause.scope.some((entity) => entityJustifiesToken(entity, token));
        if (!justified) return { ok: false, reason: `claim:${token}` };
      }
    }
  }

  return { ok: true };
}
