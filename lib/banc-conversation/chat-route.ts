import {
  parseConversationRequest,
  parseConversationResponse,
  type ConversationRequest,
} from "./contracts.ts";

type ConversationHandler = (
  request: ConversationRequest,
  requestId: string,
) => Promise<unknown>;

interface BancChatPostDependencies {
  createConversationHandler: () => ConversationHandler;
  createRequestId: () => string;
}

export function createBancChatPost({
  createConversationHandler,
  createRequestId,
}: BancChatPostDependencies) {
  const handleConversation = createConversationHandler();

  return async function POST(request: Request): Promise<Response> {
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
      await handleConversation(chatRequest, createRequestId()),
    );
    if (response === null) {
      return Response.json(
        { error: "Conversation service unavailable." },
        { status: 503 },
      );
    }

    return Response.json(response);
  };
}
