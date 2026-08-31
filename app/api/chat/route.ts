import { randomUUID } from "node:crypto";

import {
  createBancConversationHandler,
  createBancKnowledgeSearch,
  createConversationTools,
  createOpenAIConversationModel,
  createPropertyPortfolio,
  parseConversationRequest,
  parseConversationResponse,
} from "@/lib/banc-conversation";
import { APPROVED_BANC_DOCUMENTS } from "@/lib/banc-content/approved-content";
import {
  lookupPropertyFacts,
  searchProperties,
} from "@/lib/property-search/server";

const portfolio = createPropertyPortfolio({
  search: searchProperties,
  getFacts: lookupPropertyFacts,
});
const knowledge = createBancKnowledgeSearch(APPROVED_BANC_DOCUMENTS);
const tools = createConversationTools({ portfolio, knowledge });
const model = createOpenAIConversationModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_CHAT_MODEL,
});
const handleConversation = createBancConversationHandler({ model, tools });

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid chat request." }, { status: 400 });
  }

  const chatRequest = parseConversationRequest(body);
  if (chatRequest === null) {
    return Response.json({ error: "Invalid chat request." }, { status: 400 });
  }

  const response = parseConversationResponse(
    await handleConversation(chatRequest, randomUUID()),
  );
  if (response === null) {
    return Response.json(
      { error: "Conversation service unavailable." },
      { status: 503 },
    );
  }

  return Response.json(response);
}
