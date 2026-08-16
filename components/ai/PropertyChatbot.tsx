"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Loader2, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  properties?: Array<{
    id: string;
    title: string;
    bedrooms: number;
    price: number;
    location: string;
    images?: string[];
  }>;
  action?: string;
  timestamp: Date;
}

const quickReplies = [
  "Find me a 3-bed in Cuffley",
  "What's my property worth?",
  "Book a viewing",
];

const transition = {
  type: "spring" as const,
  bounce: 0,
  duration: 0.35,
};

export default function PropertyChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm Banc's property assistant. I can help you find properties, arrange viewings, or get a valuation. How can I help?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setShowPrompt(false);
      setPromptDismissed(true);
    }
  }, [isOpen]);

  // Show prompt bubble after 8 seconds if chat hasn't been opened
  useEffect(() => {
    if (promptDismissed) return;
    const timer = setTimeout(() => setShowPrompt(true), 3500);
    return () => clearTimeout(timer);
  }, [promptDismissed]);

  // Auto-hide prompt after 15 seconds
  useEffect(() => {
    if (!showPrompt) return;
    const timer = setTimeout(() => setShowPrompt(false), 15000);
    return () => clearTimeout(timer);
  }, [showPrompt]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response || "I'm sorry, could you rephrase that?",
          properties: data.properties,
          action: data.action,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I'm having trouble connecting. Please try again or call us at 01707 877781.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button + Prompt Bubble */}
      <AnimatePresence>
        {!isOpen && (
          <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 flex items-end gap-3">
            {/* Speech Bubble Prompt */}
            <AnimatePresence>
              {showPrompt && (
                <motion.div
                  initial={{ opacity: 0, x: 10, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 10, scale: 0.9 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                  className="relative mb-1"
                >
                  <button
                    onClick={() => {
                      setShowPrompt(false);
                      setPromptDismissed(true);
                      setIsOpen(true);
                    }}
                    className="block max-w-[220px] rounded-[10px] bg-white px-4 py-3 text-left shadow-lg border border-banc-grey/15 cursor-pointer hover:shadow-xl transition-shadow duration-200"
                  >
                    <p className="text-sm font-medium text-banc-dark leading-snug">
                      Talk to our chatbot about any of our current properties
                    </p>
                    <p className="text-xs text-banc-grey mt-1">
                      Ask about any home we&apos;re selling →
                    </p>
                  </button>
                  {/* Close button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPrompt(false);
                      setPromptDismissed(true);
                    }}
                    className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-banc-grey/20 text-banc-grey hover:bg-banc-grey/40 transition-colors duration-200 cursor-pointer"
                    aria-label="Dismiss"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {/* Tail pointing right toward the chat button */}
                  <div className="absolute right-[-6px] bottom-5 h-3 w-3 rotate-45 bg-white border-r border-b border-banc-grey/15" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat Button */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={transition}
              onClick={() => setIsOpen(true)}
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-banc-dark-deep text-white shadow-lg hover:bg-banc-dark transition-colors duration-200 cursor-pointer"
              aria-label="Open chat"
            >
              <MessageCircle className="h-6 w-6" />
              <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-banc-sky ring-2 ring-white" />
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={transition}
            className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-auto sm:right-6 z-50 sm:w-[380px]"
          >
            <div className="flex flex-col overflow-hidden rounded-[16px] border border-banc-grey/15 bg-white shadow-2xl max-h-[80dvh] sm:max-h-[520px]">
              {/* Header */}
              <div className="flex items-center justify-between bg-banc-dark-deep px-4 py-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-banc-sky/20">
                    <Image
                      src="/banc-logo-blue.png"
                      alt="Banc"
                      width={20}
                      height={20}
                      className="h-5 w-auto brightness-0 invert"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Banc Assistant</p>
                    <p className="text-[10px] text-white/50">Property help, powered by AI</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white transition-colors duration-200 cursor-pointer"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-banc-grey-pale/50">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        message.role === "user"
                          ? "bg-banc-dark-deep text-white rounded-br-sm"
                          : "bg-white text-banc-dark border border-banc-grey/10 shadow-sm rounded-bl-sm"
                      }`}
                    >
                      {message.content}

                      {/* Property cards */}
                      {message.properties && message.properties.length > 0 && (
                        <div className="mt-2.5 space-y-2">
                          {message.properties.map((property) => (
                            <a
                              key={property.id}
                              href={`/sales/properties/${property.id}`}
                              className="flex items-center gap-3 rounded-lg bg-banc-grey-pale p-2.5 hover:bg-banc-grey/10 transition-colors duration-200"
                            >
                              <div className="h-10 w-14 flex-shrink-0 overflow-hidden rounded bg-banc-grey/20">
                                {property.images?.[0] && (
                                  <img src={property.images[0]} alt="" className="h-full w-full object-cover" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-banc-dark truncate">{property.title}</p>
                                <p className="text-[10px] text-banc-grey">
                                  {property.bedrooms} bed · £{property.price.toLocaleString()}
                                </p>
                              </div>
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Action buttons */}
                      {message.action === "valuation" && (
                        <a href="/valuation" className="mt-2.5 flex items-center justify-center gap-2 rounded-lg bg-banc-sky px-3 py-2 text-xs font-medium text-white hover:bg-banc-sky-dark transition-colors duration-200">
                          <Tag className="h-3.5 w-3.5" />
                          Get Free Valuation
                        </a>
                      )}
                      {message.action === "viewing" && (
                        <a href="/contact" className="mt-2.5 flex items-center justify-center gap-2 rounded-lg bg-banc-sky px-3 py-2 text-xs font-medium text-white hover:bg-banc-sky-dark transition-colors duration-200">
                          <Calendar className="h-3.5 w-3.5" />
                          Contact Us
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-sm bg-white border border-banc-grey/10 shadow-sm px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-banc-grey/40 animate-pulse" />
                        <span className="h-1.5 w-1.5 rounded-full bg-banc-grey/40 animate-pulse [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-banc-grey/40 animate-pulse [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              {messages.length < 3 && (
                <div className="flex gap-2 overflow-x-auto px-4 py-2.5 border-t border-banc-grey/10 bg-white shrink-0 scrollbar-hide">
                  {quickReplies.map((reply) => (
                    <button
                      key={reply}
                      onClick={() => {
                        setInput(reply);
                        inputRef.current?.focus();
                      }}
                      className="flex-shrink-0 rounded-full border border-banc-grey/20 bg-banc-grey-pale px-3 py-1.5 text-xs text-banc-dark hover:border-banc-sky hover:text-banc-sky transition-colors duration-200 cursor-pointer whitespace-nowrap"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="flex items-center gap-2 border-t border-banc-grey/10 bg-white p-3 shrink-0">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 h-10 text-sm border-banc-grey/20 focus:border-banc-sky"
                  style={{ fontSize: "16px" }}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-banc-dark-deep text-white hover:bg-banc-dark transition-colors duration-200 disabled:opacity-40 cursor-pointer"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
