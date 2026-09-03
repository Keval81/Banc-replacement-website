"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { CircleHelp, MessageCircle, RotateCcw, X, Send, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  createInitialConversationState,
  type PropertyConversationState,
} from "@/lib/banc-conversation/contracts";
import {
  PropertyChatRequestError,
  createSingleFlightRunner,
  getPropertyChatMessageView,
  getPropertyChatQuickReplies,
  runPropertyChatTurn,
  type PropertyChatMessage,
} from "@/lib/property-chat-submit";
import {
  clearPropertyChatSession,
  loadPropertyChatSession,
  savePropertyChatSession,
  type PropertyChatSession,
} from "@/lib/property-chat-session";
import { buildPropertyHref } from "@/lib/property-view";
import { getSafePropertyImageUrl } from "@/lib/property-detail-view";
import {
  MODAL_FOCUSABLE_SELECTOR,
  startModalFocusLifecycle,
} from "@/lib/property-search/modal-focus-lifecycle";
import {
  getLandingUi,
  type ChatLauncherClearance,
  type MobileContactControlPlacement,
} from "@/lib/landing-ui";

const transition = {
  type: "spring" as const,
  bounce: 0,
  duration: 0.35,
};

const landingContactLauncher = getLandingUi("aker").mobileContactLauncher;

const WELCOME_MESSAGE =
  "Hello! I'm Banc Bot. I can search our current homes for sale or to rent, answer questions about a listing, or help you contact the team. What would you like to know?";

function createWelcomeMessage(): PropertyChatMessage {
  return {
    id: "welcome",
    role: "assistant",
    content: WELCOME_MESSAGE,
    timestamp: new Date(),
  };
}

const RATE_LIMIT_STATUS = 429;

// The panel unmounts on every route change, so the thread lives in
// sessionStorage rather than in component state alone.
function readStoredSession(): PropertyChatSession | null {
  if (typeof window === "undefined") return null;
  return loadPropertyChatSession(window.sessionStorage);
}

// Restored ids must not collide with the ones this mount goes on to mint.
function highestMessageIndex(messages: readonly PropertyChatMessage[]): number {
  return messages.reduce((highest, message) => {
    const match = /^property-chat-(\d+)$/.exec(message.id);
    const index = match ? Number(match[1]) : 0;
    return index > highest ? index : highest;
  }, 0);
}

interface PropertyChatbotProps {
  mobileContactControlPlacement?: MobileContactControlPlacement;
  showProactivePrompt?: boolean;
  launcherClearance?: ChatLauncherClearance;
}

export default function PropertyChatbot({
  mobileContactControlPlacement = "standard",
  showProactivePrompt = true,
  launcherClearance = "standard",
}: PropertyChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  // The thread carried over from the previous page is adopted up front. The
  // panel starts closed, so the server and client agree on what is painted;
  // only what is behind the launcher differs.
  const [messages, setMessages] = useState<PropertyChatMessage[]>(() => {
    const stored = readStoredSession();
    return stored && stored.messages.length > 0
      ? stored.messages
      : [createWelcomeMessage()];
  });
  const [input, setInput] = useState("");
  const [conversationContext, setConversationContext] =
    useState<PropertyConversationState>(
      () => readStoredSession()?.state ?? createInitialConversationState(),
    );
  const [isLoading, setIsLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const firstHelpOptionRef = useRef<HTMLButtonElement>(null);
  const helpTriggerRef = useRef<HTMLButtonElement>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);
  const submissionRunnerRef = useRef(createSingleFlightRunner());
  // Seeded past any restored id so a resumed thread cannot mint a duplicate.
  const messageIdRef = useRef<number | null>(null);
  if (messageIdRef.current === null) {
    messageIdRef.current = highestMessageIndex(messages);
  }
  const usesUnifiedHelp = mobileContactControlPlacement === "unified-help";
  const clearsStickyActions = launcherClearance === "clears-sticky-actions";
  const quickReplies = getPropertyChatQuickReplies(conversationContext);
  const openChat = useCallback(() => {
    setIsHelpMenuOpen(false);
    setShowPrompt(false);
    setPromptDismissed(true);
    setIsOpen(true);
  }, []);
  const closeChat = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const panel = chatPanelRef.current;
    if (!isOpen || panel === null) return;

    return startModalFocusLifecycle({
      getActiveElement: () => document.activeElement,
      getBodyOverflow: () => document.body.style.overflow,
      setBodyOverflow: (value) => { document.body.style.overflow = value; },
      getFocusableElements: () => [
        ...panel.querySelectorAll<HTMLElement>(MODAL_FOCUSABLE_SELECTOR),
      ],
      getInitialFocusElement: () => inputRef.current,
      containerContains: (element) =>
        element instanceof Node && panel.contains(element),
      addKeydownListener: (listener) =>
        document.addEventListener("keydown", listener),
      removeKeydownListener: (listener) =>
        document.removeEventListener("keydown", listener),
      requestFrame: (callback) => window.requestAnimationFrame(callback),
      cancelFrame: (frame) => window.cancelAnimationFrame(frame as number),
      onClose: closeChat,
      restoreFocus: () => helpTriggerRef.current?.focus(),
    });
  }, [closeChat, isOpen]);

  useEffect(() => {
    if (!usesUnifiedHelp || !isHelpMenuOpen) return;

    const frame = window.requestAnimationFrame(() => {
      firstHelpOptionRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isHelpMenuOpen, usesUnifiedHelp]);

  // Show prompt bubble after 8 seconds if chat hasn't been opened
  useEffect(() => {
    if (!showProactivePrompt || promptDismissed) return;
    const timer = setTimeout(() => setShowPrompt(true), 3500);
    return () => clearTimeout(timer);
  }, [promptDismissed, showProactivePrompt]);

  // Auto-hide prompt after 15 seconds
  useEffect(() => {
    if (!showPrompt) return;
    const timer = setTimeout(() => setShowPrompt(false), 15000);
    return () => clearTimeout(timer);
  }, [showPrompt]);

  // Write the thread back on every change so the next page can pick it up.
  useEffect(() => {
    if (typeof window === "undefined") return;
    savePropertyChatSession(window.sessionStorage, {
      messages,
      state: conversationContext,
    });
  }, [messages, conversationContext]);

  const hasConversation = messages.length > 1;
  const startNewConversation = useCallback(() => {
    if (isLoading) return;
    setMessages([createWelcomeMessage()]);
    setConversationContext(createInitialConversationState());
    setInput("");
    messageIdRef.current = 0;
    if (typeof window !== "undefined") clearPropertyChatSession(window.sessionStorage);
    inputRef.current?.focus();
  }, [isLoading]);

  const sendMessage = async (text: string = input) => {
    const content = text.trim();
    if (!content || isLoading) return;
    await submissionRunnerRef.current(async () => {
      const nextMessageId = () => {
        messageIdRef.current = (messageIdRef.current ?? 0) + 1;
        return `property-chat-${messageIdRef.current}`;
      };
      setInput("");
      await runPropertyChatTurn({
        content,
        messages,
        context: conversationContext,
        nextMessageId,
        request: async (requestBody) => {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });
          if (!response.ok) {
            if (response.status === RATE_LIMIT_STATUS) {
              const payload = (await response.json().catch(() => null)) as
                | { error?: unknown }
                | null;
              if (typeof payload?.error === "string") {
                throw new PropertyChatRequestError(payload.error);
              }
            }
            throw new Error("Chat request failed");
          }
          return response.json();
        },
        onUserMessage: (message) => {
          setMessages((previous) => [...previous, message]);
        },
        onAssistantMessage: (message) => {
          setMessages((previous) => [...previous, message]);
        },
        onContextChange: setConversationContext,
        onLoadingChange: setIsLoading,
      });
    });
  };

  return (
    <>
      {/* Floating Button + Prompt Bubble */}
      <AnimatePresence>
        {!isOpen && (
          <div
            className={`fixed right-[calc(1rem+env(safe-area-inset-right))] z-40 flex items-end gap-3 sm:right-[calc(1.5rem+env(safe-area-inset-right))] ${
              clearsStickyActions
                ? "bottom-[calc(9rem+env(safe-area-inset-bottom))] lg:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]"
                : "sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]"
            } ${
              usesUnifiedHelp
                ? "bottom-[calc(1rem+env(safe-area-inset-bottom))] flex-col"
                : "bottom-[calc(9rem+env(safe-area-inset-bottom))]"
            }`}
          >
            {/* Speech Bubble Prompt */}
            <AnimatePresence>
              {showProactivePrompt && showPrompt && (
                <motion.div
                  initial={{ opacity: 0, x: 10, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 10, scale: 0.9 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                  className="relative mb-1"
                >
                  <button
                    onClick={openChat}
                    className="block max-w-[220px] rounded-[10px] bg-white px-4 py-3 text-left shadow-lg border border-banc-grey/15 cursor-pointer hover:shadow-xl transition-shadow duration-200"
                  >
                    <p className="text-sm font-medium text-banc-dark leading-snug">
                      Talk to Banc Bot about any current property
                    </p>
                    <p className="text-xs text-banc-grey mt-1">
                      Ask about a home you&apos;re buying or renting →
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

            <AnimatePresence>
              {usesUnifiedHelp && isHelpMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="w-56 overflow-hidden rounded-[14px] border border-banc-grey/15 bg-white p-2 shadow-2xl"
                  onKeyDown={(event) => {
                    if (event.key !== "Escape") return;
                    event.preventDefault();
                    setIsHelpMenuOpen(false);
                    window.requestAnimationFrame(() => {
                      helpTriggerRef.current?.focus();
                    });
                  }}
                >
                  <button
                    ref={firstHelpOptionRef}
                    type="button"
                    onClick={openChat}
                    className="flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-[10px] px-3 text-left text-sm font-medium text-banc-dark transition-colors duration-200 hover:bg-banc-grey-pale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-sky"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-banc-cream ring-1 ring-banc-dark-deep/10">
                      <Image
                        src={landingContactLauncher.assistantAvatar.src}
                        alt={landingContactLauncher.assistantAvatar.alt}
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    </span>
                    {landingContactLauncher.assistantLabel}
                  </button>
                  <a
                    href={landingContactLauncher.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-[10px] px-3 text-sm font-medium text-banc-dark transition-colors duration-200 hover:bg-banc-grey-pale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white">
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    </span>
                    {landingContactLauncher.whatsappLabel}
                  </a>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat Button */}
            <motion.button
              ref={helpTriggerRef}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={transition}
              onClick={() =>
                usesUnifiedHelp
                  ? setIsHelpMenuOpen((current) => !current)
                  : openChat()
              }
              className={
                usesUnifiedHelp
                  ? "flex h-12 flex-shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/20 bg-banc-dark-deep px-4 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(0,0,0,0.3)] transition-colors duration-200 hover:bg-banc-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-sky focus-visible:ring-offset-2"
                  : "flex h-14 w-14 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-banc-dark-deep text-white shadow-lg transition-colors duration-200 hover:bg-banc-dark"
              }
              aria-label={
                usesUnifiedHelp
                  ? isHelpMenuOpen
                    ? "Close help options"
                    : "Open help options"
                  : "Open Banc Bot"
              }
              aria-expanded={usesUnifiedHelp ? isHelpMenuOpen : undefined}
            >
              {usesUnifiedHelp ? (
                isHelpMenuOpen ? (
                  <X className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <CircleHelp className="h-5 w-5" aria-hidden="true" />
                )
              ) : (
                <span
                  className="h-12 w-12 overflow-hidden rounded-full bg-banc-cream"
                  aria-hidden="true"
                >
                  <Image
                    src={landingContactLauncher.assistantAvatar.src}
                    alt={landingContactLauncher.assistantAvatar.alt}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </span>
              )}
              {usesUnifiedHelp ? (
                <span>{landingContactLauncher.label}</span>
              ) : (
                <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-banc-sky ring-2 ring-white" />
              )}
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatPanelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="property-chat-title"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={transition}
            className={`fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-[calc(1rem+env(safe-area-inset-left))] right-[calc(1rem+env(safe-area-inset-right))] z-50 sm:left-auto sm:right-[calc(1.5rem+env(safe-area-inset-right))] sm:w-[380px] ${
              clearsStickyActions
                ? "sm:bottom-[calc(8rem+env(safe-area-inset-bottom))] lg:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]"
                : "sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]"
            }`}
          >
            <div className="flex flex-col overflow-hidden rounded-[16px] border border-banc-grey/15 bg-white shadow-2xl max-h-[80dvh] sm:max-h-[520px]">
              {/* Header */}
              <div className="flex items-center justify-between bg-banc-dark-deep px-4 py-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-banc-cream ring-1 ring-white/20">
                    <Image
                      src={landingContactLauncher.assistantAvatar.src}
                      alt={landingContactLauncher.assistantAvatar.alt}
                      width={36}
                      height={36}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p
                      id="property-chat-title"
                      className="text-sm font-semibold text-white"
                    >
                      Banc Bot
                    </p>
                    <p className="text-[10px] text-white/50">Property help, powered by AI</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {hasConversation && (
                    <button
                      type="button"
                      onClick={startNewConversation}
                      disabled={isLoading}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-colors duration-200 hover:bg-white/10 hover:text-white disabled:opacity-40 cursor-pointer"
                      aria-label="Start a new conversation"
                      title="Start a new conversation"
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                  <button
                    onClick={closeChat}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white transition-colors duration-200 cursor-pointer"
                    aria-label="Close chat"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div
                role="log"
                aria-live="polite"
                aria-busy={isLoading}
                aria-label="Conversation with Banc Bot"
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-banc-grey-pale/50"
              >
                {messages.map((message) => {
                  const messageView = getPropertyChatMessageView(message);
                  return (
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
                      {messageView.properties.length > 0 && (
                        <div className="mt-2.5 space-y-2">
                          {messageView.properties.map((property) => {
                            const imageUrl = getSafePropertyImageUrl(
                              property.images?.[0] ?? "",
                            );
                            return (
                              <Link
                                key={property.id}
                                href={buildPropertyHref(
                                  property.department,
                                  property.id,
                                )}
                                onClick={closeChat}
                                className="flex min-h-14 items-center gap-3 rounded-lg bg-banc-grey-pale p-2.5 transition-colors duration-200 hover:bg-banc-grey/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus"
                              >
                                <div className="h-10 w-14 flex-shrink-0 overflow-hidden rounded bg-banc-grey/20">
                                  {imageUrl && (
                                    <Image
                                      src={imageUrl}
                                      alt={`${property.title} thumbnail`}
                                      width={56}
                                      height={40}
                                      unoptimized
                                      className="h-full w-full object-cover"
                                    />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-xs font-medium text-banc-dark">
                                    {property.title}
                                  </p>
                                  <p className="text-[10px] text-banc-grey">
                                    {property.stats.beds} bed · {property.price}
                                  </p>
                                  <p className="truncate text-[10px] text-banc-grey">
                                    {property.address}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      {messageView.sources.length > 0 && (
                        <div className="mt-2.5 space-y-1.5 border-t border-banc-grey/10 pt-2.5">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-banc-grey">
                            Sources
                          </p>
                          {messageView.sources.map((source) => (
                            <Link
                              key={source.href}
                              href={source.href}
                              onClick={closeChat}
                              className="flex min-h-11 cursor-pointer items-center rounded-lg px-2 text-sm font-medium text-banc-focus underline-offset-2 transition-colors duration-200 hover:bg-banc-grey-pale hover:text-banc-focus-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2"
                            >
                              {source.title}
                            </Link>
                          ))}
                        </div>
                      )}

                      {messageView.handoff && (
                        <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
                          <a
                            href={messageView.handoff.callHref}
                            className="flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-banc-focus px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-banc-focus-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2"
                          >
                            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                            Call Banc
                          </a>
                          <a
                            href={messageView.handoff.whatsappHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#25D366] px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#1EAD54] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
                          >
                            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                            WhatsApp Banc
                          </a>
                        </div>
                      )}
                    </div>
                    </motion.div>
                  );
                })}

                {isLoading && (
                  <div className="flex justify-start" aria-label="Banc Bot is typing">
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
              <div className="flex gap-2 overflow-x-auto px-4 py-2.5 border-t border-banc-grey/10 bg-white shrink-0 scrollbar-hide">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      void sendMessage(reply);
                    }}
                    className="flex-shrink-0 rounded-full disabled:opacity-50 border border-banc-grey/20 bg-banc-grey-pale px-3 py-1.5 text-xs text-banc-dark hover:border-banc-sky hover:text-banc-sky transition-colors duration-200 cursor-pointer whitespace-nowrap"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="flex items-center gap-2 border-t border-banc-grey/10 bg-white p-3 shrink-0">
                <label htmlFor="property-chat-input" className="sr-only">
                  Message Banc Bot
                </label>
                <Input
                  id="property-chat-input"
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void sendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 h-10 text-sm border-banc-grey/20 focus:border-banc-sky"
                  style={{ fontSize: "16px" }}
                />
                <button
                  type="button"
                  onClick={() => {
                    void sendMessage();
                  }}
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
