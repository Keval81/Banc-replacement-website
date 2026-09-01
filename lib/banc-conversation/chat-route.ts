import {
  parseConversationRequest,
  parseConversationResponse,
  type ConversationRequest,
} from "./contracts.ts";
import {
  clientKeyFromRequest,
  createInMemoryRateLimiter,
  type RateLimiter,
} from "./rate-limit.ts";

type ConversationHandler = (
  request: ConversationRequest,
  requestId: string,
) => Promise<unknown>;

interface BancChatPostDependencies {
  createConversationHandler: () => ConversationHandler;
  createRequestId: () => string;
  rateLimiter?: RateLimiter;
  clientKey?: (request: Request) => string;
  logger?: (event: { category: "handler_error"; requestId: string }) => void;
}

/** Generous ceiling: message (2k) + 20 history messages (2k each) + context. */
export const MAX_CHAT_REQUEST_BYTES = 64 * 1_024;

export const RATE_LIMITED_RESPONSE_COPY =
  "You're sending messages quickly. Please wait a moment and try again.";

export function createBancChatPost({
  createConversationHandler,
  createRequestId,
  rateLimiter = createInMemoryRateLimiter(),
  clientKey = clientKeyFromRequest,
  logger = (event) => console.error(event),
}: BancChatPostDependencies) {
  const handleConversation = createConversationHandler();

  return async function POST(request: Request): Promise<Response> {
    const declaredLength = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(declaredLength) && declaredLength > MAX_CHAT_REQUEST_BYTES) {
      return Response.json({ error: "Chat request too large." }, { status: 413 });
    }

    const decision = rateLimiter.check(clientKey(request));
    if (!decision.allowed) {
      return Response.json(
        { error: RATE_LIMITED_RESPONSE_COPY },
        {
          status: 429,
          headers: { "Retry-After": String(decision.retryAfterSeconds) },
        },
      );
    }

    let rawBody: string;
    try {
      rawBody = await request.text();
    } catch {
      return Response.json({ error: "Invalid chat request." }, { status: 400 });
    }
    if (rawBody.length > MAX_CHAT_REQUEST_BYTES) {
      return Response.json({ error: "Chat request too large." }, { status: 413 });
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return Response.json({ error: "Invalid chat request." }, { status: 400 });
    }

    const chatRequest = parseConversationRequest(body);
    if (chatRequest === null) {
      return Response.json({ error: "Invalid chat request." }, { status: 400 });
    }

    const requestId = createRequestId();
    let handled: unknown;
    try {
      handled = await handleConversation(chatRequest, requestId);
    } catch {
      try {
        logger({ category: "handler_error", requestId });
      } catch {
        // Diagnostics must never break the response path.
      }
      return Response.json(
        { error: "Conversation service unavailable." },
        { status: 503 },
      );
    }

    const response = parseConversationResponse(handled);
    if (response === null) {
      return Response.json(
        { error: "Conversation service unavailable." },
        { status: 503 },
      );
    }

    return Response.json(response, {
      headers: { "Cache-Control": "no-store" },
    });
  };
}
