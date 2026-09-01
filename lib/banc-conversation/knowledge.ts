import type { ApprovedBancDocument } from "../banc-content/types.ts";

export interface BancKnowledgeResult {
  documentId: string;
  title: string;
  href: `/${string}`;
  excerpt: string;
}

export interface BancKnowledge {
  search(query: string, signal?: AbortSignal): Promise<BancKnowledgeResult[]>;
}

const MAX_RESULTS = 3;
const MAX_EXCERPT_LENGTH = 480;
const MIN_RELATIVE_SCORE = 0.25;
const LOCAL_PATH = /^\/(?!\/)[a-z0-9][a-z0-9/_-]*$/i;
const UNSUPPORTED_TOPIC_TOKENS = new Set(["news"]);
const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "at",
  "about",
  "available",
  "banc",
  "be",
  "can",
  "could",
  "do",
  "does",
  "explain",
  "find",
  "for",
  "from",
  "guide",
  "group",
  "had",
  "has",
  "have",
  "help",
  "how",
  "i",
  "in",
  "information",
  "info",
  "is",
  "it",
  "like",
  "know",
  "me",
  "need",
  "needed",
  "of",
  "on",
  "or",
  "process",
  "property",
  "properties",
  "provide",
  "please",
  "should",
  "tell",
  "there",
  "the",
  "this",
  "to",
  "what",
  "when",
  "where",
  "which",
  "with",
  "work",
  "works",
  "want",
  "was",
  "were",
  "would",
  "you",
  "your",
]);

const TOKEN_FAMILIES = [
  ["apply", "applicant", "applicants", "application", "applications", "applying"],
  ["buy", "buyer", "buyers", "buying", "purchase", "purchasing"],
  ["document", "documents"],
  ["family", "families"],
  ["fee", "fees"],
  ["landlord", "landlords"],
  ["letting", "lettings"],
  ["move", "moving"],
  ["offer", "offers"],
  ["open", "opening"],
  ["reference", "references", "referencing"],
  ["rent", "rental", "renting"],
  ["sell", "sale", "seller", "sellers", "selling"],
  ["service", "services"],
  ["tenant", "tenants"],
  ["valuation", "valuations"],
  ["view", "viewing", "viewings"],
] as const;

const CANONICAL_TOKEN = new Map<string, string>(
  TOKEN_FAMILIES.flatMap(([canonical, ...variants]) =>
    [canonical, ...variants].map((token) => [token, canonical] as const)
  ),
);
const INVARIANT_PLURAL_TOKENS = new Set(["series", "species"]);

function normalizeToken(token: string): string {
  const canonicalToken = CANONICAL_TOKEN.get(token);
  if (canonicalToken) {
    return canonicalToken;
  }
  let singularToken = token;
  if (
    token.length > 4 &&
    token.endsWith("ies") &&
    !INVARIANT_PLURAL_TOKENS.has(token)
  ) {
    singularToken = `${token.slice(0, -3)}y`;
  } else if (
    token.length > 3 &&
    token.endsWith("s") &&
    !token.endsWith("ss") &&
    !token.endsWith("is") &&
    !token.endsWith("us")
  ) {
    singularToken = token.slice(0, -1);
  }
  return CANONICAL_TOKEN.get(singularToken) ?? singularToken;
}

function rawTokens(value: string): string[] {
  return value.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

function tokenize(value: string): string[] {
  return rawTokens(value).filter(
    (token) => !STOP_WORDS.has(token),
  ).map(normalizeToken);
}

function normalizedPhrase(value: string): string {
  return tokenize(value).join(" ");
}

function tokenSet(value: string): ReadonlySet<string> {
  return new Set(tokenize(value));
}

function containsPhrase(value: string, phrase: string): boolean {
  return (
    value === phrase ||
    value.startsWith(`${phrase} `) ||
    value.endsWith(` ${phrase}`) ||
    value.includes(` ${phrase} `)
  );
}

function excerptFromPassage(
  passage: string,
  queryTokens: readonly string[],
): string {
  const evidence = passage.trim();
  const targetTokens = new Set(queryTokens);
  const occurrences = [...evidence.matchAll(/[a-z0-9]+/gi)]
    .map((match) => ({
      end: (match.index ?? 0) + match[0].length,
      start: match.index ?? 0,
      token: normalizeToken(match[0].toLowerCase()),
    }))
    .filter(({ token }) => targetTokens.has(token));
  const counts = new Map<string, number>();
  let coveredTokens = 0;
  let left = 0;
  let bestStart = -1;
  let bestEnd = -1;

  for (let right = 0; right < occurrences.length; right += 1) {
    const rightOccurrence = occurrences[right];
    const rightCount = counts.get(rightOccurrence.token) ?? 0;
    counts.set(rightOccurrence.token, rightCount + 1);
    if (rightCount === 0) {
      coveredTokens += 1;
    }

    while (coveredTokens === targetTokens.size && left <= right) {
      const leftOccurrence = occurrences[left];
      if (
        bestStart === -1 ||
        rightOccurrence.end - leftOccurrence.start < bestEnd - bestStart
      ) {
        bestStart = leftOccurrence.start;
        bestEnd = rightOccurrence.end;
      }
      const leftCount = counts.get(leftOccurrence.token) ?? 0;
      counts.set(leftOccurrence.token, leftCount - 1);
      if (leftCount === 1) {
        coveredTokens -= 1;
      }
      left += 1;
    }
  }

  if (bestStart === -1 || bestEnd - bestStart > MAX_EXCERPT_LENGTH) {
    return evidence.slice(0, MAX_EXCERPT_LENGTH).trim();
  }

  const evidenceLength = bestEnd - bestStart;
  const contextBefore = Math.floor((MAX_EXCERPT_LENGTH - evidenceLength) / 2);
  const excerptStart = Math.max(0, bestStart - contextBefore);
  const excerptEnd = Math.min(evidence.length, excerptStart + MAX_EXCERPT_LENGTH);
  return evidence
    .slice(Math.max(0, excerptEnd - MAX_EXCERPT_LENGTH), excerptEnd)
    .trim();
}

function matchingExcerpt(
  document: ApprovedBancDocument,
  queryTokens: readonly string[],
): string | null {
  const uniqueQueryTokens = new Set(queryTokens);
  const metadataTokens = new Set([
    ...tokenize(document.title),
    ...document.aliases.flatMap(tokenize),
    ...tokenize(document.sectionTitle),
    ...tokenize(document.href),
  ]);
  const hasEveryQueryToken = (tokens: ReadonlySet<string>) =>
    [...uniqueQueryTokens].every((token) => tokens.has(token));

  if (hasEveryQueryToken(metadataTokens)) {
    return excerptFromPassage(document.text, queryTokens);
  }

  const passages = document.text
    .split(/\n\s*\n/)
    .map((passage) => passage.trim())
    .filter(Boolean);
  for (const passage of passages) {
    const passageTokens = new Set([
      ...metadataTokens,
      ...tokenize(passage),
    ]);
    if (hasEveryQueryToken(passageTokens)) {
      return excerptFromPassage(passage, queryTokens);
    }
  }

  return null;
}

function scoreDocument(
  document: ApprovedBancDocument,
  queryTokens: readonly string[],
  queryPhrase: string,
): number {
  const titlePhrase = normalizedPhrase(document.title);
  const aliasPhrases = document.aliases.map(normalizedPhrase).filter(Boolean);
  const titleTokens = tokenSet(document.title);
  const aliasTokens = new Set(document.aliases.flatMap(tokenize));
  const sectionTokens = tokenSet(document.sectionTitle);
  const bodyTokens = tokenSet(document.text);

  let score = 0;

  if (queryPhrase === titlePhrase) {
    score += 100;
  } else if (titlePhrase && containsPhrase(queryPhrase, titlePhrase)) {
    score += 50;
  }

  for (const aliasPhrase of aliasPhrases) {
    if (queryPhrase === aliasPhrase) {
      score += 90;
    } else if (containsPhrase(queryPhrase, aliasPhrase)) {
      score += 45;
    }
  }

  for (const token of queryTokens) {
    if (titleTokens.has(token)) {
      score += 12;
    }
    if (aliasTokens.has(token)) {
      score += 10;
    }
    if (sectionTokens.has(token)) {
      score += 4;
    }
    if (bodyTokens.has(token)) {
      score += 1;
    }
  }

  return score;
}

function resultFrom(
  document: ApprovedBancDocument,
  excerpt: string,
): BancKnowledgeResult {
  return {
    documentId: document.id,
    title: document.title,
    href: document.href,
    excerpt: excerpt.slice(0, MAX_EXCERPT_LENGTH).trim(),
  };
}

export function createBancKnowledgeSearch(
  documents: readonly ApprovedBancDocument[],
): BancKnowledge {
  for (const document of documents) {
    if (!LOCAL_PATH.test(document.href)) {
      throw new TypeError(
        `Approved Banc document href must be a single-slash local path: ${document.href}`,
      );
    }
  }

  return {
    async search(query, signal) {
      signal?.throwIfAborted();
      if (rawTokens(query).some((token) => UNSUPPORTED_TOPIC_TOKENS.has(token))) {
        return [];
      }
      const queryTokens = tokenize(query);
      if (queryTokens.length === 0) {
        return [];
      }

      const queryPhrase = queryTokens.join(" ");

      const rankedDocuments: Array<{
        document: ApprovedBancDocument;
        excerpt: string;
        score: number;
      }> = [];
      for (const document of documents) {
        const score = scoreDocument(document, queryTokens, queryPhrase);
        const excerpt = matchingExcerpt(document, queryTokens);
        if (score > 0 && excerpt !== null) {
          rankedDocuments.push({ document, excerpt, score });
        }
      }
      rankedDocuments.sort(
        (left, right) =>
          right.score - left.score ||
          left.document.id.localeCompare(right.document.id),
      );
      const minimumScore = (rankedDocuments[0]?.score ?? 0) * MIN_RELATIVE_SCORE;
      const results = rankedDocuments
        .filter(({ score }) => score >= minimumScore)
        .slice(0, MAX_RESULTS)
        .map(({ document, excerpt }) => resultFrom(document, excerpt));
      signal?.throwIfAborted();
      return results;
    },
  };
}
