import {
  parseConversationResponse,
  type ConversationAction,
  type ConversationRequest,
  type PropertyConversationState,
} from "./banc-conversation/contracts.ts";
import type { PropertyCardData } from "./property-view.ts";

export type SingleFlightRunner = <T>(action: () => Promise<T>) => Promise<boolean>;

export interface PropertyChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  properties?: PropertyCardData[];
  sources?: Array<{ title: string; href: string }>;
  handoff?: { callHref: string; whatsappHref: string };
  action?: ConversationAction;
  timestamp: Date;
}

export interface PropertyChatMessageView {
  properties: PropertyCardData[];
  sources: Array<{ title: string; href: string }>;
  handoff?: { callHref: string; whatsappHref: string };
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

const initialQuickReplies = [
  "I want to buy a 3-bed in Cuffley",
  "I'm looking to rent",
  "I need to speak to the Banc team",
] as const;

const resultQuickReplies = ["Tell me about the first property"] as const;

const connectionErrorMessage =
  "I'm having trouble connecting. Please try again or call us at 01707 877781.";

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

export function getPropertyChatMessageView(
  message: PropertyChatMessage,
): PropertyChatMessageView {
  return {
    properties: message.properties === undefined ? [] : [...message.properties],
    sources: message.sources?.map((source) => ({ ...source })) ?? [],
    handoff: message.handoff === undefined ? undefined : { ...message.handoff },
  };
}

export function getPropertyChatQuickReplies(
  context: PropertyConversationState,
): readonly string[] {
  return context.resultPropertyIds.length > 0
    ? resultQuickReplies
    : initialQuickReplies;
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
      action: response.action,
      timestamp: now(),
    });
  } catch {
    onAssistantMessage({
      id: nextMessageId(),
      role: "assistant",
      content: connectionErrorMessage,
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
