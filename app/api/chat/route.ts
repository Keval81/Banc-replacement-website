import {
  createPropertyConversationHandler,
  parsePropertyConversationRequest,
} from "@/lib/property-conversation";
import { createOpenAIPropertyConversationClient } from "@/lib/property-conversation/openai";
import {
  lookupPropertyFacts,
  searchProperties,
} from "@/lib/property-search/server";

const handlePropertyConversation = createPropertyConversationHandler({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_CHAT_MODEL,
  createModelRunner: ({ apiKey, model }) =>
    createOpenAIPropertyConversationClient({ apiKey, model }),
  search: searchProperties,
  lookupFacts: lookupPropertyFacts,
});

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid chat request." }, { status: 400 });
  }

  const chatRequest = parsePropertyConversationRequest(body);
  if (chatRequest === null) {
    return Response.json({ error: "Invalid chat request." }, { status: 400 });
  }

  return Response.json(await handlePropertyConversation(chatRequest));
}
