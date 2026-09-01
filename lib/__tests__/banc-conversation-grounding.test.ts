import assert from "node:assert/strict";
import test from "node:test";

import { verifyGroundedResponse } from "../banc-conversation/grounding.ts";
import type { SanitizedOperationResult } from "../banc-conversation/tools.ts";
import { createDefaultPropertySearchQuery } from "../property-search/query.ts";

const facts: SanitizedOperationResult[] = [{
  status: "property_facts",
  facts: [
    {
      id: "EA-1",
      title: "Oak House",
      address: "12 The Ridgeway, Cuffley",
      department: "sales",
      status: "for_sale",
      price: 750_000,
      priceDisplay: "£750,000",
      bedrooms: 5,
      bathrooms: 2,
      receptions: 2,
      propertyType: "house",
      tenure: "freehold",
      epc: "B",
      sqft: 1_800,
      features: ["garage", "swimming_pool"],
      summary: "A detached family home with a heated pool.",
    },
    {
      id: "EA-2",
      title: "Elm House",
      address: "4 Station Road, Cuffley",
      department: "sales",
      status: "for_sale",
      price: 650_000,
      priceDisplay: "£650,000",
      bedrooms: 4,
      bathrooms: 2,
      receptions: 1,
      propertyType: "house",
      tenure: "leasehold",
      epc: null,
      sqft: null,
      features: ["garden"],
      summary: "A semi-detached home near the station.",
    },
  ],
}];

const search: SanitizedOperationResult[] = [{
  status: "search_results",
  total: 7,
  requirements: {
    ...createDefaultPropertySearchQuery("sales"),
    location: "Cuffley",
    maxPrice: 800_000,
    minBedrooms: 4,
    features: ["parking"],
  },
  properties: [{
    id: "EA-1",
    title: "Oak House",
    address: "12 The Ridgeway, Cuffley",
    price: "£750,000",
    bedrooms: 5,
    bathrooms: 2,
    summary: "A detached family home.",
  }],
}];

function ok(text: string, results: SanitizedOperationResult[]): void {
  const verdict = verifyGroundedResponse(text, results);
  assert.equal(verdict.ok, true, `${text} → ${JSON.stringify(verdict)}`);
}

function rejected(
  text: string,
  results: SanitizedOperationResult[],
  reason?: RegExp,
): void {
  const verdict = verifyGroundedResponse(text, results);
  assert.equal(verdict.ok, false, text);
  if (reason !== undefined && !verdict.ok) assert.match(verdict.reason, reason);
}

test("accepts prose whose figures and features trace to the named property", () => {
  ok("Oak House is £750,000 with 5 bedrooms, 2 bathrooms and a garage.", facts);
  ok("Oak House has a swimming pool and an EPC rating of B; Elm House has a garden.", facts);
  ok("Elm House is the cheaper of the two at £650,000, and it's leasehold.", facts);
  ok("Oak House offers around 1,800 sq ft.", facts);
  ok("Oak House is £750k and Elm House is £0.65m.", facts);
  ok("Both homes have two bathrooms.", facts);
});

test("rejects figures or features that no in-scope property supports", () => {
  rejected("Elm House has a garage.", facts, /claim:garage/);
  rejected("Elm House has a swimming pool.", facts, /claim:(pool|swimming)/);
  rejected("Oak House has a garage and Elm House has a garage.", facts, /claim:garage/);
  rejected("Oak House has a garden and Elm House has a garden.", facts, /claim:garden/);
  rejected("Elm House costs £2 million.", facts, /number:2000000/);
  rejected("Elm House has 12 bedrooms.", facts, /number:12/);
  rejected("Elm House has an EPC rating of B.", facts, /claim:epc/);
  rejected("Oak House was refurbished in 2021.", facts, /number:2021/);
  rejected("Banc charges 1% commission.", facts, /percent/);
});

test("scopes numbers to search totals, requirements and shown properties", () => {
  ok("There are 7 homes in Cuffley under £800,000 with at least 4 bedrooms and parking, including Oak House at £750,000.", search);
  ok("I've added parking to your search and found 7 matches.", search);
  rejected("There are 8 matches.", search, /number:8/);
  rejected("Oak House has a garden.", search, /claim:garden/);
  ok("Would you like to add a garden or a garage to the search?", search);
});

test("rejects completed-action claims, links, phones and markup", () => {
  const reset: SanitizedOperationResult[] = [{ status: "reset" }];
  rejected("I've booked your viewing for Saturday.", reset, /completed_action/);
  rejected("Your offer has been submitted.", reset, /completed_action/);
  rejected("We'll call you shortly.", reset, /completed_action/);
  rejected("See https://bancproperty.com for more.", reset, /link/);
  rejected("Visit bancproperty.co.uk for more.", reset, /link/);
  rejected("Email info@bancproperty.com.", reset, /link/);
  rejected("Call 020 7946 0000 now.", reset, /phone/);
  rejected("Here's a list:\n- one\n- two", reset, /markup|number/);
  rejected("**Great news**", reset, /markup/);
  ok("Your search is cleared. What are you looking for now?", reset);
});

test("allows Banc's approved phone numbers and knowledge figures when they are in the excerpt", () => {
  const knowledge: SanitizedOperationResult[] = [{
    status: "knowledge",
    sources: [{
      documentId: "contact:cuffley",
      title: "Contact Banc",
      excerpt: "The Cuffley office opens 9am to 6pm and can be reached on 01707 877781. Tenancy deposits are capped at 5 weeks' rent.",
    }],
  }];
  ok("The Cuffley office is open 9am to 6pm — you can ring them on 01707 877781.", knowledge);
  ok("Deposits are capped at 5 weeks' rent for tenants.", knowledge);
  rejected("The office is open until 8pm.", knowledge, /number:8/);
  rejected("You can ring them on 01707 644101.", knowledge, /phone/);
});

test("bounds length and sentence count", () => {
  const reset: SanitizedOperationResult[] = [{ status: "reset" }];
  rejected("Sure. ".repeat(6), reset, /too_many_sentences/);
  rejected("x".repeat(701), reset, /too_long/);
  rejected("   ", reset, /empty/);
});
