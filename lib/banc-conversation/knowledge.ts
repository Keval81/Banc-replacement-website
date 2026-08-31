import type { ApprovedBancDocument } from "../banc-content/types.ts";

export interface BancKnowledgeResult {
  documentId: string;
  title: string;
  href: `/${string}`;
  excerpt: string;
}

export interface BancKnowledge {
  search(query: string): Promise<BancKnowledgeResult[]>;
}

const MAX_RESULTS = 3;
const MAX_EXCERPT_LENGTH = 480;
const LOCAL_PATH = /^\/(?!\/)[a-z0-9][a-z0-9/_-]*$/i;
const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "at",
  "banc",
  "be",
  "do",
  "does",
  "for",
  "from",
  "group",
  "how",
  "i",
  "in",
  "is",
  "it",
  "like",
  "me",
  "of",
  "on",
  "or",
  "property",
  "properties",
  "provide",
  "the",
  "to",
  "what",
  "when",
  "with",
  "you",
  "your",
]);

function tokenize(value: string): string[] {
  return (value.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter(
    (token) => !STOP_WORDS.has(token),
  );
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

function resultFrom(document: ApprovedBancDocument): BancKnowledgeResult {
  return {
    documentId: document.id,
    title: document.title,
    href: document.href,
    excerpt: document.text.slice(0, MAX_EXCERPT_LENGTH).trim(),
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
    async search(query) {
      const queryTokens = tokenize(query);
      if (queryTokens.length === 0) {
        return [];
      }

      const queryPhrase = queryTokens.join(" ");

      return documents
        .map((document) => ({
          document,
          score: scoreDocument(document, queryTokens, queryPhrase),
        }))
        .filter(({ score }) => score > 0)
        .sort(
          (left, right) =>
            right.score - left.score ||
            left.document.id.localeCompare(right.document.id),
        )
        .slice(0, MAX_RESULTS)
        .map(({ document }) => resultFrom(document));
    },
  };
}
