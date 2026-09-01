import { randomUUID } from "node:crypto";

import {
  createBancChatPost,
  createBancConversationHandler,
  createBancKnowledgeSearch,
  createConversationTools,
  createOpenAIConversationModel,
  createPropertyPortfolio,
} from "@/lib/banc-conversation";
import { APPROVED_BANC_DOCUMENTS } from "@/lib/banc-content/approved-content";
import {
  lookupPropertyFacts,
  searchProperties,
} from "@/lib/property-search/server";

export const POST = createBancChatPost({
  createConversationHandler: () => {
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
    return createBancConversationHandler({ model, tools, portfolio });
  },
  createRequestId: randomUUID,
});
