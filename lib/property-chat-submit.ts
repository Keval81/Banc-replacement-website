import {
  parsePropertyConversationResponse,
  type PropertyConversationAction,
  type PropertyConversationContext,
  type PropertyConversationRequest,
} from "./property-conversation/index.ts";
import type { PropertyCardData } from "./property-view.ts";

export type SingleFlightRunner = <T>(action: () => Promise<T>) => Promise<boolean>;

export interface PropertyChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  properties?: PropertyCardData[];
  action?: PropertyConversationAction;
  timestamp: Date;
}

export interface PropertyChatMessageView {
  properties: PropertyCardData[];
  showContactAction: boolean;
}

interface RunPropertyChatTurnOptions {
  content: string;
  messages: readonly PropertyChatMessage[];
  context: PropertyConversationContext;
  nextMessageId: () => string;
  now?: () => Date;
  request: (request: PropertyConversationRequest) => Promise<unknown>;
  onUserMessage: (message: PropertyChatMessage) => void;
  onAssistantMessage: (message: PropertyChatMessage) => void;
  onContextChange: (context: PropertyConversationContext) => void;
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
  context: PropertyConversationContext,
): PropertyConversationRequest {
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
    showContactAction: message.action === "contact_team",
  };
}

export function getPropertyChatQuickReplies(
  context: PropertyConversationContext,
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
    const response = parsePropertyConversationResponse(
      await request(createPropertyChatRequest(userMessage.content, messages, context)),
    );
    if (response === null) throw new Error("Invalid chat response");

    onContextChange(response.context);
    onAssistantMessage({
      id: nextMessageId(),
      role: "assistant",
      content: response.response,
      properties: response.properties,
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
