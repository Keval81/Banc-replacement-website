// Custom hook for chatbot functionality
import { useState, useCallback } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  properties?: any[];
  action?: string;
  timestamp: Date;
}

interface UseChatbotOptions {
  initialMessages?: Message[];
  onPropertyClick?: (property: any) => void;
}

export function useChatbot(options: UseChatbotOptions = {}) {
  const [messages, setMessages] = useState<Message[]>(
    options.initialMessages || [
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hi! I'm Banc, your AI property assistant. How can I help you today?",
        timestamp: new Date(),
      },
    ]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            history: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        const data = await response.json();

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            data.response ||
            "I'm sorry, I didn't understand that. Could you rephrase?",
          properties: data.properties,
          action: data.action,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        return assistantMessage;
      } catch (err) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            "I'm having trouble connecting. Please try again or call us at 01707 640 777.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setError('Failed to send message');
        return errorMessage;
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hi! I'm Banc, your AI property assistant. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
    setError(null);
  }, []);

  const addSystemMessage = useCallback((content: string) => {
    const systemMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, systemMessage]);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    addSystemMessage,
    hasMessages: messages.length > 0,
  };
}