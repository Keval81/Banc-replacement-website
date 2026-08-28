import assert from "node:assert/strict";
import test from "node:test";

import type {
  PropertyConversationContext,
  PropertyConversationTurn,
} from "../property-conversation/tools.ts";
import { createPropertyConversationTools } from "../property-conversation/tools.ts";
import { createDefaultPropertySearchQuery } from "../property-search/query.ts";
import type {
  PropertySearch,
  PropertySearchQuery,
  PropertySearchResult,
} from "../property-search/types.ts";
import type { PropertyCardData } from "../property-view.ts";
import type { PropertyFacts } from "../property-conversation/contracts.ts";

function card(
  id: string,
  overrides: Partial<PropertyCardData> = {},
): PropertyCardData {
  return {
    id,
    title: `Property ${id}`,
    address: "Cuffley, Hertfordshire",
    price: "£750,000",
    priceNum: 750000,
    tags: [],
    stats: { beds: 3, baths: 2 },
    images: [`https://images.example.test/${id}.jpg`],
    summary: `Summary for ${id}.`,
    propertyType: "house",
    department: "sales",
    status: "for_sale",
    ...overrides,
  };
}

function facts(id: string): PropertyFacts {
  return {
    id,
    title: `Property ${id}`,
    address: "Cuffley, Hertfordshire",
    department: "sales",
    status: "for_sale",
    price: 750000,
    priceDisplay: "£750,000",
    bedrooms: 3,
    bathrooms: 2,
    receptions: 1,
    propertyType: "house",
    tenure: "freehold",
    epc: "C",
    sqft: 1400,
    features: ["garden"],
    summary: `Summary for ${id}.`,
  };
}

function searchResult(
  query: PropertySearchQuery,
  properties: PropertyCardData[],
  overrides: Partial<PropertySearchResult> = {},
): PropertySearchResult {
  return {
    query,
    properties,
    total: properties.length,
    page: 1,
    pageSize: 3,
    totalPages: properties.length === 0 ? 0 : Math.ceil(properties.length / 3),
    lastSyncedAt: "2026-08-28T09:00:00.000Z",
    ...overrides,
  };
}

function turn(
  currentMessage: string,
  context: Partial<PropertyConversationContext> = {},
): PropertyConversationTurn {
  return {
    currentMessage,
    context: {
      resultPropertyIds: [],
      ...context,
    },
  };
}

test("search tool lets exact current-message bedroom intent override broader tool arguments", async () => {
  let seenQuery: PropertySearchQuery | undefined;
  const search: PropertySearch = async (query) => {
    seenQuery = query;
    return searchResult(query, [card("EA-1"), card("EA-2"), card("EA-3")], {
      total: 5,
      totalPages: 2,
    });
  };
  const tools = createPropertyConversationTools({
    search,
    lookupFacts: async () => [],
  });

  const result = await tools.executeTool("search_properties", {
    department: "sales",
    location: "Cuffley",
    bedrooms: { mode: "minimum", value: 3 },
  }, turn("Find me a 3 bed in Cuffley"));

  assert.deepEqual(seenQuery, {
    ...createDefaultPropertySearchQuery("sales"),
    location: "Cuffley",
    minBedrooms: 3,
    maxBedrooms: 3,
    page: 1,
    pageSize: 3,
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.name, "search_properties");
    assert.deepEqual(result.context.resultPropertyIds, ["EA-1", "EA-2", "EA-3"]);
    assert.equal(result.context.resultFingerprint, "sales:EA-1|EA-2|EA-3");
    assert.equal(result.properties?.length, 3);
  }
});

test("search tool removes an old exact maximum when the current message asks for a minimum", async () => {
  let seenQuery: PropertySearchQuery | undefined;
  const search: PropertySearch = async (query) => {
    seenQuery = query;
    return searchResult(query, []);
  };
  const tools = createPropertyConversationTools({
    search,
    lookupFacts: async () => [],
  });

  await tools.executeTool("search_properties", {}, turn("Show at least 3 bedrooms", {
    query: {
      ...createDefaultPropertySearchQuery("sales"),
      location: "Cuffley",
      minBedrooms: 3,
      maxBedrooms: 3,
    },
  }));

  assert.equal(seenQuery?.minBedrooms, 3);
  assert.equal(seenQuery?.maxBedrooms, undefined);
});

test("search tool replaces both bedroom bounds while preserving unrelated filters", async () => {
  let seenQuery: PropertySearchQuery | undefined;
  const search: PropertySearch = async (query) => {
    seenQuery = query;
    return searchResult(query, []);
  };
  const tools = createPropertyConversationTools({
    search,
    lookupFacts: async () => [],
  });

  await tools.executeTool("search_properties", {
    features: ["parking"],
  }, turn("Make that four bedrooms", {
    query: {
      ...createDefaultPropertySearchQuery("sales"),
      location: "Cuffley",
      minPrice: 500000,
      maxPrice: 900000,
      minBedrooms: 3,
      maxBedrooms: 3,
      features: ["garden"],
    },
  }));

  assert.deepEqual(seenQuery, {
    ...createDefaultPropertySearchQuery("sales"),
    location: "Cuffley",
    minPrice: 500000,
    maxPrice: 900000,
    minBedrooms: 4,
    maxBedrooms: 4,
    features: ["parking"],
    page: 1,
    pageSize: 3,
  });
});

test("search tool clears only the named null filter", async () => {
  let seenQuery: PropertySearchQuery | undefined;
  const search: PropertySearch = async (query) => {
    seenQuery = query;
    return searchResult(query, []);
  };
  const tools = createPropertyConversationTools({
    search,
    lookupFacts: async () => [],
  });

  await tools.executeTool("search_properties", {
    location: null,
  }, turn("Keep looking", {
    query: {
      ...createDefaultPropertySearchQuery("sales"),
      location: "Cuffley",
      minPrice: 500000,
      maxPrice: 900000,
      minBedrooms: 3,
      features: ["parking"],
    },
  }));

  assert.deepEqual(seenQuery, {
    ...createDefaultPropertySearchQuery("sales"),
    minPrice: 500000,
    maxPrice: 900000,
    minBedrooms: 3,
    features: ["parking"],
    page: 1,
    pageSize: 3,
  });
});

test("reset tool clears all search state", async () => {
  const tools = createPropertyConversationTools({
    search: async (query) => searchResult(query, []),
    lookupFacts: async () => [],
  });

  const result = await tools.executeTool("reset_property_search", {}, turn("start again", {
    query: {
      ...createDefaultPropertySearchQuery("sales"),
      location: "Cuffley",
      minBedrooms: 3,
      maxBedrooms: 3,
    },
    resultPropertyIds: ["EA-1"],
    focusedPropertyId: "EA-1",
    resultFingerprint: "sales:EA-1",
  }));

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.context, { resultPropertyIds: [] });
  }
});

test("fact lookups authorize active ids only and focus a single requested property", async () => {
  let seenIds: readonly string[] | undefined;
  const tools = createPropertyConversationTools({
    search: async (query) => searchResult(query, []),
    lookupFacts: async (ids) => {
      seenIds = ids;
      return ids.map((id) => facts(id));
    },
  });

  const result = await tools.executeTool("get_property_facts", {
    propertyIds: ["EA-2"],
  }, turn("Tell me about the first one", {
    resultPropertyIds: ["EA-2", "EA-3"],
  }));

  assert.deepEqual(seenIds, ["EA-2"]);
  assert.equal(result.ok, true);
  if (result.ok && result.name === "get_property_facts") {
    assert.deepEqual(result.facts.map((fact) => fact.id), ["EA-2"]);
    assert.equal(result.context.focusedPropertyId, "EA-2");
  }
});

test("fact lookups fail closed for out-of-context ids and preserve valid focus for comparisons", async () => {
  let calls = 0;
  const tools = createPropertyConversationTools({
    search: async (query) => searchResult(query, []),
    lookupFacts: async (ids) => {
      calls += 1;
      return ids.map((id) => facts(id));
    },
  });

  const unauthorized = await tools.executeTool("get_property_facts", {
    propertyIds: ["EA-404"],
  }, turn("Tell me about that one", {
    resultPropertyIds: ["EA-1", "EA-2"],
    focusedPropertyId: "EA-1",
  }));
  assert.equal(unauthorized.ok, false);
  assert.equal(calls, 0);

  const comparison = await tools.executeTool("get_property_facts", {
    propertyIds: ["EA-2", "EA-1"],
  }, turn("Compare the first two", {
    resultPropertyIds: ["EA-1", "EA-2"],
    focusedPropertyId: "EA-1",
  }));
  assert.equal(comparison.ok, true);
  if (comparison.ok && comparison.name === "get_property_facts") {
    assert.equal(comparison.context.focusedPropertyId, "EA-1");
    assert.deepEqual(comparison.facts.map((fact) => fact.id), ["EA-2", "EA-1"]);
  }
});

test("unchanged ordered ids suppress cards while changed ids emit at most three cards", async () => {
  const tools = createPropertyConversationTools({
    search: async (query) => searchResult(query, [
      card("EA-1"),
      card("EA-2"),
      card("EA-3"),
      card("EA-4"),
    ], {
      total: 4,
      totalPages: 2,
    }),
    lookupFacts: async () => [],
  });

  const unchanged = await tools.executeTool("search_properties", {
    department: "sales",
  }, turn("Show me the same again", {
    query: createDefaultPropertySearchQuery("sales"),
    resultPropertyIds: ["EA-1", "EA-2", "EA-3"],
    resultFingerprint: "sales:EA-1|EA-2|EA-3",
  }));

  assert.equal(unchanged.ok, true);
  if (unchanged.ok && unchanged.name === "search_properties") {
    assert.equal(unchanged.properties, undefined);
    assert.equal(unchanged.context.resultFingerprint, "sales:EA-1|EA-2|EA-3");
  }

  const changed = await tools.executeTool("search_properties", {
    department: "sales",
    sort: "price_asc",
  }, turn("Cheaper", {
    query: createDefaultPropertySearchQuery("sales"),
    resultPropertyIds: ["EA-9", "EA-8", "EA-7"],
    resultFingerprint: "sales:EA-9|EA-8|EA-7",
  }));

  assert.equal(changed.ok, true);
  if (changed.ok && changed.name === "search_properties") {
    assert.deepEqual(changed.context.resultPropertyIds, ["EA-1", "EA-2", "EA-3"]);
    assert.equal(changed.context.resultFingerprint, "sales:EA-1|EA-2|EA-3");
    assert.equal(changed.properties?.length, 3);
  }
});

test("invalid tools and arguments fail closed", async () => {
  const tools = createPropertyConversationTools({
    search: async (query) => searchResult(query, []),
    lookupFacts: async () => [],
  });

  assert.deepEqual(
    await tools.executeTool("unknown_tool", {}, turn("hello")),
    {
      ok: false,
      name: "unknown_tool",
      code: "invalid_tool",
    },
  );

  assert.deepEqual(
    await tools.executeTool("search_properties", {
      bedrooms: { mode: "minimum", value: 3, extra: true },
    }, turn("hello")),
    {
      ok: false,
      name: "search_properties",
      code: "invalid_arguments",
    },
  );
});

test("contact categories return fixed Banc handoff copy instead of model text", async () => {
  const tools = createPropertyConversationTools({
    search: async (query) => searchResult(query, []),
    lookupFacts: async () => [],
  });

  const viewing = await tools.executeTool("contact_banc", {
    reason: "viewing",
  }, turn("Book a viewing"));
  const fees = await tools.executeTool("contact_banc", {
    reason: "fees_finance_legal",
  }, turn("Can you advise on legal fees?"));

  assert.equal(viewing.ok, true);
  assert.equal(fees.ok, true);
  if (
    viewing.ok &&
    fees.ok &&
    viewing.name === "contact_banc" &&
    fees.name === "contact_banc"
  ) {
    assert.equal(
      viewing.message,
      "The chatbot can't book viewings or check availability. Please contact the Banc team or call Banc on 01707 877781.",
    );
    assert.equal(
      fees.message,
      "The chatbot can't advise on fees, finance, or legal matters. Please contact the Banc team or call Banc on 01707 877781.",
    );
  }
});
