import {
  parseConversationResponse,
  type ConversationAction,
  type ConversationDetails,
  type ConversationRequest,
  type PropertyConversationState,
} from "./banc-conversation/contracts.ts";
import {
  isAboutPageProperty,
  PAGE_PROPERTY_QUICK_REPLIES,
} from "./property-chat-page.ts";
import type { PropertyCardData } from "./property-view.ts";

export type SingleFlightRunner = <T>(action: () => Promise<T>) => Promise<boolean>;

export interface PropertyChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  properties?: PropertyCardData[];
  sources?: Array<{ title: string; href: string }>;
  handoff?: { callHref: string; whatsappHref: string };
  form?: { title: string; href: string };
  details?: ConversationDetails;
  action?: ConversationAction;
  timestamp: Date;
}

export interface PropertyChatMessageView {
  properties: PropertyCardData[];
  sources: Array<{ title: string; href: string }>;
  handoff?: { callHref: string; whatsappHref: string };
  form?: { title: string; href: string };
  details?: ConversationDetails;
}

interface RunPropertyChatTurnOptions {
  content: string;
  messages: readonly PropertyChatMessage[];
  context: PropertyConversationState;
  nextMessageId: () => string;
  now?: () => Date;
  request: (request: ConversationRequest) => Promise<unknown>;
  onUserMessage: (message: PropertyChatMessage) => void;
  onAssistantMessage: (message: PropertyChatMessage) => void;
  onContextChange: (context: PropertyConversationState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

// Short enough to sit two to a row on a phone.
const initialQuickReplies = [
  "Buy in Cuffley",
  "I'm looking to rent",
  "Value my home",
  "Schools in Cuffley",
] as const;

const singleResultQuickReplies = [
  "Tell me about this home",
  "Schools nearby",
  "Book a viewing",
] as const;

const resultQuickReplies = [
  "Tell me about the first one",
  "Compare the first two",
  "Which is the cheapest?",
] as const;

const connectionErrorMessage =
  "I'm having trouble connecting. Please try again or call us at 01707 877781.";

/**
 * Raised by the transport when the chat route answered with a user-facing
 * message (for example a 429 rate limit) that should replace the generic
 * connection copy.
 */
export class PropertyChatRequestError extends Error {
  readonly userMessage: string;

  constructor(userMessage: string) {
    super(userMessage);
    this.name = "PropertyChatRequestError";
    this.userMessage = userMessage;
  }
}

const MAX_USER_FACING_ERROR_LENGTH = 240;

export function userFacingChatError(error: unknown): string {
  if (
    error instanceof PropertyChatRequestError &&
    error.userMessage.trim().length > 0 &&
    error.userMessage.length <= MAX_USER_FACING_ERROR_LENGTH
  ) {
    return error.userMessage.trim();
  }
  return connectionErrorMessage;
}

export function createPropertyChatRequest(
  content: string,
  messages: readonly PropertyChatMessage[],
  context: PropertyConversationState,
): ConversationRequest {
  return {
    message: content.trim(),
    history: messages
      .slice(-20)
      .map((message) => ({ role: message.role, content: message.content })),
    context,
  };
}

function copyDetails(details: ConversationDetails | undefined): ConversationDetails | undefined {
  return details === undefined
    ? undefined
    : { title: details.title, items: details.items.map((item) => ({ ...item })) };
}

export function getPropertyChatMessageView(
  message: PropertyChatMessage,
): PropertyChatMessageView {
  return {
    properties: message.properties === undefined ? [] : [...message.properties],
    sources: message.sources?.map((source) => ({ ...source })) ?? [],
    handoff: message.handoff === undefined ? undefined : { ...message.handoff },
    form: message.form === undefined ? undefined : { ...message.form },
    details: copyDetails(message.details),
  };
}

export function getPropertyChatQuickReplies(
  context: PropertyConversationState,
): readonly string[] {
  if (isAboutPageProperty(context)) return PAGE_PROPERTY_QUICK_REPLIES;
  if (context.focusedPropertyId !== undefined && context.topic === "property_detail") {
    return PAGE_PROPERTY_QUICK_REPLIES;
  }
  if (context.resultPropertyIds.length === 0) return initialQuickReplies;
  const moreRemain = context.resultTotal !== undefined &&
    (context.resultOffset ?? 0) + context.resultPropertyIds.length < context.resultTotal;
  const replies = context.resultPropertyIds.length === 1
    ? singleResultQuickReplies
    : resultQuickReplies;
  return moreRemain ? [...replies.slice(0, 2), "Show more homes"] : replies;
}

export async function runPropertyChatTurn({
  content,
  messages,
  context,
  nextMessageId,
  now = () => new Date(),
  request,
  onUserMessage,
  onAssistantMessage,
  onContextChange,
  onLoadingChange,
}: RunPropertyChatTurnOptions): Promise<void> {
  const userMessage: PropertyChatMessage = {
    id: nextMessageId(),
    role: "user",
    content: content.trim(),
    timestamp: now(),
  };

  onUserMessage(userMessage);
  onLoadingChange(true);

  try {
    const response = parseConversationResponse(
      await request(createPropertyChatRequest(userMessage.content, messages, context)),
    );
    if (response === null) throw new Error("Invalid chat response");

    onContextChange(response.context);
    onAssistantMessage({
      id: nextMessageId(),
      role: "assistant",
      content: response.response,
      properties: response.properties,
      sources: response.sources?.map((source) => ({ ...source })),
      handoff: response.handoff === undefined ? undefined : { ...response.handoff },
      form: response.form === undefined ? undefined : { ...response.form },
      details: copyDetails(response.details),
      action: response.action,
      timestamp: now(),
    });
  } catch (error) {
    onAssistantMessage({
      id: nextMessageId(),
      role: "assistant",
      content: userFacingChatError(error),
      timestamp: now(),
    });
  } finally {
    onLoadingChange(false);
  }
}

export function createSingleFlightRunner(): SingleFlightRunner {
  let inFlight = false;

  return async <T>(action: () => Promise<T>): Promise<boolean> => {
    if (inFlight) return false;
    inFlight = true;
    try {
      await action();
      return true;
    } finally {
      inFlight = false;
    }
  };
}
