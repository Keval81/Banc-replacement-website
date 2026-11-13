"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUp, Check, MessageCircle, RotateCcw, X, Phone } from "lucide-react";
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
import { ChatPropertyView } from "@/components/ai/ChatPropertyView";
import {
  listingFromHref,
  parsePropertyPeek,
  peekFromCard,
  type PropertyPeek,
} from "@/lib/property-chat-peek";
import { buildPropertyHref, type PropertyCardData } from "@/lib/property-view";
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

import {
  focusStateOnPageProperty,
  pagePropertyIdFromPath,
  PAGE_PROPERTY_WELCOME,
  splitChatLinks,
} from "@/lib/property-chat-page";

const transition = {
  type: "spring" as const,
  bounce: 0,
  duration: 0.35,
};

const landingContactLauncher = getLandingUi("aker").mobileContactLauncher;

// Shown once per visit: a nudge on every page would be nagging.
const INVITE_SEEN_KEY = "banc-bot-invite-seen";
const INVITE_DELAY_MS = 2500;
const INVITE_VISIBLE_MS = 9000;
const MAX_INPUT_HEIGHT_PX = 132;

function inviteAlreadySeen(): boolean {
  try {
    return window.sessionStorage.getItem(INVITE_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberInviteSeen(): void {
  try {
    window.sessionStorage.setItem(INVITE_SEEN_KEY, "1");
  } catch {
    // Private mode can refuse storage; the invitation then simply shows again.
  }
}

const WELCOME_MESSAGE =
  "Hello! I'm Banc Bot. I can search our current homes for sale or to rent, answer questions about a listing, or help you contact the team. What would you like to know?";

function createWelcomeMessage(onPropertyPage = false): PropertyChatMessage {
  return {
    id: "welcome",
    role: "assistant",
    content: onPropertyPage ? PAGE_PROPERTY_WELCOME : WELCOME_MESSAGE,
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

/** A home being looked at inside the panel. `property` is null until its details arrive. */
interface OpenHome {
  id: string;
  department: "sales" | "lettings";
  title: string;
  property: PropertyPeek | null;
  failed: boolean;
}

interface PropertyChatbotProps {
  mobileContactControlPlacement?: MobileContactControlPlacement;
  showProactivePrompt?: boolean;
  launcherClearance?: ChatLauncherClearance;
}

// Count-only: tells Banc's dashboard a property was opened from the chat. sendBeacon survives the
// navigation that follows the tap; a failure is silent by design (it must never block the visitor).
function reportPropertyOpened(propertyId: string): void {
  try {
    const body = new Blob([JSON.stringify({ kind: "chat_property_open", property: propertyId })], { type: "application/json" });
    navigator.sendBeacon?.("/api/chat/usage", body);
  } catch {
    // Counting is best-effort; the visitor's navigation always wins.
  }
}

export default function PropertyChatbot({
  mobileContactControlPlacement = "standard",
  showProactivePrompt = true,
  launcherClearance = "standard",
}: PropertyChatbotProps) {
  // On a listing (or that home's viewing or offer form) the visitor's first
  // question is about the home in front of them, so it starts in focus. The
  // panel remounts on every route change, so this is settled at mount.
  const pathname = usePathname();
  const pagePropertyId = pagePropertyIdFromPath(pathname);
  const [isOpen, setIsOpen] = useState(false);
  // The thread carried over from the previous page is adopted up front. The
  // panel starts closed, so the server and client agree on what is painted;
  // only what is behind the launcher differs.
  const [messages, setMessages] = useState<PropertyChatMessage[]>(() => {
    const stored = readStoredSession();
    return stored && stored.messages.length > 0
      ? stored.messages
      : [createWelcomeMessage(pagePropertyId !== null)];
  });
  const [input, setInput] = useState("");
  const [conversationContext, setConversationContext] =
    useState<PropertyConversationState>(
      () => {
        const state = readStoredSession()?.state ?? createInitialConversationState();
        return pagePropertyId === null ? state : focusStateOnPageProperty(state, pagePropertyId);
      },
    );
  const [isLoading, setIsLoading] = useState(false);
  const [openHome, setOpenHome] = useState<OpenHome | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const latestMessageRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const helpTriggerRef = useRef<HTMLButtonElement>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);
  const submissionRunnerRef = useRef(createSingleFlightRunner());
  // Seeded past any restored id so a resumed thread cannot mint a duplicate.
  const messageIdRef = useRef<number | null>(null);
  if (messageIdRef.current === null) {
    messageIdRef.current = highestMessageIndex(messages);
  }
  // The landing page has no bottom navigation, so the launcher sits lower there.
  const sitsLow = mobileContactControlPlacement === "unified-help";
  const clearsStickyActions = launcherClearance === "clears-sticky-actions";
  const quickReplies = getPropertyChatQuickReplies(conversationContext);

  // On a phone the panel is the whole screen, so the phone's own back
  // gesture has to step out of it (home view, then panel) instead of leaving
  // the page. Each step in is recorded as a history entry to step back over.
  const backStepsRef = useRef(0);
  const ignoredPopsRef = useRef(0);
  const openHomeRef = useRef(false);
  const recordBackStep = useCallback(() => {
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    window.history.pushState({ ...window.history.state, bancBotStep: true }, "");
    backStepsRef.current += 1;
  }, []);

  const openChat = useCallback(() => {
    setShowPrompt(false);
    setPromptDismissed(true);
    rememberInviteSeen();
    setIsOpen(true);
    recordBackStep();
  }, [recordBackStep]);

  /** Back to the site, from wherever in the panel the visitor is. */
  const closeChat = useCallback(() => {
    const steps = backStepsRef.current;
    backStepsRef.current = 0;
    openHomeRef.current = false;
    setOpenHome(null);
    setIsOpen(false);
    if (steps > 0) {
      ignoredPopsRef.current += 1;
      window.history.go(-steps);
    }
  }, []);

  /** Following a link out of the panel: the new page takes over the history. */
  const leaveChat = useCallback(() => {
    backStepsRef.current = 0;
    openHomeRef.current = false;
    setOpenHome(null);
    setIsOpen(false);
  }, []);

  const closeHome = useCallback(() => {
    openHomeRef.current = false;
    setOpenHome(null);
    if (backStepsRef.current > 1) {
      backStepsRef.current -= 1;
      ignoredPopsRef.current += 1;
      window.history.back();
    }
  }, []);

  const viewHome = useCallback(
    (listing: { id: string; department: "sales" | "lettings" }, title: string, card?: PropertyCardData) => {
      openHomeRef.current = true;
      setOpenHome({
        ...listing,
        title,
        property: card === undefined ? null : peekFromCard(card),
        failed: false,
      });
      recordBackStep();
      reportPropertyOpened(listing.id);
      void (async () => {
        let property: PropertyPeek | null = null;
        try {
          const response = await fetch(`/api/properties/${encodeURIComponent(listing.id)}`);
          property = response.ok ? parsePropertyPeek(await response.json()) : null;
        } catch {
          property = null;
        }
        setOpenHome((current) => {
          if (current === null || current.id !== listing.id) return current;
          // The card's photos and summary stay if the fuller record cannot be fetched.
          if (property === null) return { ...current, failed: current.property === null };
          return { ...current, property };
        });
      })();
    },
    [recordBackStep],
  );

  useEffect(() => {
    if (!isOpen) return;
    const stepBack = () => {
      if (ignoredPopsRef.current > 0) {
        ignoredPopsRef.current -= 1;
        return;
      }
      if (backStepsRef.current === 0) return;
      backStepsRef.current -= 1;
      if (openHomeRef.current) {
        openHomeRef.current = false;
        setOpenHome(null);
      } else {
        setIsOpen(false);
      }
    };
    window.addEventListener("popstate", stepBack);
    return () => window.removeEventListener("popstate", stepBack);
  }, [isOpen]);

  // A new reply is read from its first line, so the view goes to the top of
  // it. The visitor's own message and the typing dots keep the view at the end.
  useEffect(() => {
    const latest = messages.at(-1);
    if (latest?.role === "assistant" && messages.length > 1 && !isLoading) {
      latestMessageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

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
      // On a touch screen, focusing the message box would raise the keyboard
      // over the welcome before the visitor has read it.
      getInitialFocusElement: () =>
        window.matchMedia("(pointer: coarse)").matches
          ? titleRef.current
          : inputRef.current,
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

  // On a phone the panel fills the visible screen. The on-screen keyboard
  // shrinks the visual viewport but not the layout, so the panel follows the
  // visual viewport and the message box stays just above the keys.
  useEffect(() => {
    const panel = chatPanelRef.current;
    const viewport = window.visualViewport;
    if (!isOpen || panel === null || !viewport) return;

    const fit = () => {
      panel.style.setProperty("--chat-height", `${viewport.height}px`);
      panel.style.setProperty("--chat-top", `${viewport.offsetTop}px`);
    };
    fit();
    viewport.addEventListener("resize", fit);
    viewport.addEventListener("scroll", fit);
    return () => {
      viewport.removeEventListener("resize", fit);
      viewport.removeEventListener("scroll", fit);
    };
  }, [isOpen]);

  // A short invitation, once per visit, a moment after the page settles.
  useEffect(() => {
    if (!showProactivePrompt || promptDismissed) return;
    const timer = setTimeout(() => {
      if (inviteAlreadySeen()) return;
      rememberInviteSeen();
      setShowPrompt(true);
    }, INVITE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [promptDismissed, showProactivePrompt]);

  useEffect(() => {
    if (!showPrompt) return;
    const timer = setTimeout(() => setShowPrompt(false), INVITE_VISIBLE_MS);
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

  const resizeInput = useCallback(() => {
    const box = inputRef.current;
    if (box === null) return;
    box.style.height = "auto";
    box.style.height = `${Math.min(box.scrollHeight, MAX_INPUT_HEIGHT_PX)}px`;
  }, []);

  const askAboutOpenHome = useCallback(() => {
    if (openHome === null) return;
    setConversationContext((current) => focusStateOnPageProperty(current, openHome.id));
    closeHome();
    if (!window.matchMedia("(pointer: coarse)").matches) {
      window.requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [closeHome, openHome]);

  const fullListingHref = (property: { department: "sales" | "lettings"; id: string }) =>
    `${buildPropertyHref(
      property.department,
      property.id,
    )}?from=bot`;

  const hasConversation = messages.length > 1;
  const startNewConversation = useCallback(() => {
    if (isLoading) return;
    setMessages([createWelcomeMessage(pagePropertyId !== null)]);
    setConversationContext(
      pagePropertyId === null
        ? createInitialConversationState()
        : focusStateOnPageProperty(createInitialConversationState(), pagePropertyId),
    );
    setInput("");
    messageIdRef.current = 0;
    if (typeof window !== "undefined") clearPropertyChatSession(window.sessionStorage);
    inputRef.current?.focus();
  }, [isLoading, pagePropertyId]);

  const sendMessage = async (text: string = input) => {
    const content = text.trim();
    if (!content || isLoading) return;
    await submissionRunnerRef.current(async () => {
      const nextMessageId = () => {
        messageIdRef.current = (messageIdRef.current ?? 0) + 1;
        return `property-chat-${messageIdRef.current}`;
      };
      setInput("");
      if (inputRef.current) inputRef.current.style.height = "auto";
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

  const actionLink =
    "flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl px-4 text-[15px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2";

  return (
    <>
      {/* Launcher and invitation */}
      <AnimatePresence>
        {!isOpen && (
          <div
            data-chat-launcher
            className={`fixed right-[calc(1rem+env(safe-area-inset-right))] z-40 flex items-end gap-3 sm:right-[calc(1.5rem+env(safe-area-inset-right))] ${
              clearsStickyActions
                ? "bottom-[calc(9rem+env(safe-area-inset-bottom))] lg:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]"
                : "sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]"
            } ${
              sitsLow
                ? "bottom-[calc(1rem+env(safe-area-inset-bottom))]"
                : "bottom-[calc(9rem+env(safe-area-inset-bottom))]"
            }`}
          >
            <AnimatePresence>
              {showProactivePrompt && showPrompt && (
                <motion.div
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="relative mb-1.5"
                >
                  <button
                    type="button"
                    onClick={openChat}
                    className="block max-w-[15rem] cursor-pointer rounded-2xl rounded-br-md border border-banc-grey/15 bg-white py-3 pl-4 pr-9 text-left shadow-[0_10px_30px_rgba(0,0,0,0.16)] transition-shadow duration-200 hover:shadow-[0_14px_36px_rgba(0,0,0,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus"
                  >
                    <span className="block text-sm font-semibold leading-snug text-banc-dark">
                      Hi, I&apos;m Banc Bot.
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-banc-muted-readable">
                      I can help with any of our properties.
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPrompt(false);
                      setPromptDismissed(true);
                    }}
                    className="absolute right-1 top-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-banc-muted-readable transition-colors duration-200 hover:bg-banc-grey-pale hover:text-banc-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus"
                    aria-label="Dismiss"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              ref={helpTriggerRef}
              type="button"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={transition}
              onClick={openChat}
              className="relative flex h-14 w-14 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-white shadow-[0_10px_28px_rgba(0,0,0,0.28)] ring-1 ring-banc-dark-deep/10 transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-sky focus-visible:ring-offset-2 active:scale-95 motion-reduce:transition-none sm:h-16 sm:w-16"
              aria-label="Open Banc Bot"
            >
              <span className="block h-full w-full overflow-hidden rounded-full">
                <Image
                  src={landingContactLauncher.assistantAvatar.src}
                  alt={landingContactLauncher.assistantAvatar.alt}
                  width={64}
                  height={64}
                  className="h-full w-full scale-[1.04] object-cover"
                  aria-hidden="true"
                />
              </span>
              <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full bg-banc-sky ring-2 ring-white" />
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* Chat panel: the whole screen on a phone, a docked window from sm up */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatPanelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="property-chat-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={transition}
            className={`fixed inset-x-0 top-[var(--chat-top,0px)] z-50 flex h-[var(--chat-height,100dvh)] flex-col overflow-hidden bg-white sm:inset-x-auto sm:top-auto sm:right-[calc(1.5rem+env(safe-area-inset-right))] sm:h-[min(42.5rem,calc(100dvh-3rem))] sm:w-[26.25rem] sm:rounded-[20px] sm:border sm:border-banc-grey/15 sm:shadow-[0_24px_70px_rgba(0,0,0,0.3)] ${
              clearsStickyActions
                ? "sm:bottom-[calc(8rem+env(safe-area-inset-bottom))] sm:h-[min(42.5rem,calc(100dvh-9.5rem))] lg:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] lg:h-[min(42.5rem,calc(100dvh-3rem))]"
                : "sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]"
            }`}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between bg-banc-dark-deep px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] sm:pt-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-banc-cream ring-1 ring-white/25">
                    <Image
                      src={landingContactLauncher.assistantAvatar.src}
                      alt={landingContactLauncher.assistantAvatar.alt}
                      width={44}
                      height={44}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-banc-sky ring-2 ring-banc-dark-deep" aria-hidden="true" />
                </div>
                <div>
                  <p
                    id="property-chat-title"
                    ref={titleRef}
                    tabIndex={-1}
                    // Focus lands here on touch screens so the keyboard stays down; it is not a control, so no ring.
                    style={{ outline: "none", boxShadow: "none" }}
                    className="text-base font-semibold leading-tight text-white"
                  >
                    Banc Bot
                  </p>
                  <p className="text-xs text-white/60">
                    <span className="sm:hidden">Powered by AI</span>
                    <span className="hidden sm:inline">Property help, powered by AI</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {hasConversation && (
                  <button
                    type="button"
                    onClick={startNewConversation}
                    disabled={isLoading}
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-sky disabled:opacity-40"
                    aria-label="Start a new conversation"
                    title="Start a new conversation"
                  >
                    <RotateCcw className="h-[18px] w-[18px]" aria-hidden="true" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeChat}
                  className="flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-white/10 px-3.5 text-[13px] font-medium text-white transition-colors duration-200 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-sky sm:w-11 sm:bg-transparent sm:px-0 sm:text-white/70 sm:hover:bg-white/10 sm:hover:text-white"
                  aria-label="Close chat and go back to the site"
                >
                  <ArrowLeft className="h-4 w-4 sm:hidden" aria-hidden="true" />
                  <span className="sm:hidden">Back to site</span>
                  <X className="hidden h-5 w-5 sm:block" aria-hidden="true" />
                </button>
              </div>
            </div>

            {openHome !== null ? (
              <ChatPropertyView
                key={openHome.id}
                title={openHome.title}
                property={openHome.property}
                failed={openHome.failed}
                fullListingHref={fullListingHref(openHome)}
                viewingHref={`/book-viewing/${encodeURIComponent(openHome.id)}?from=bot`}
                onBack={closeHome}
                onAsk={askAboutOpenHome}
                onLeaveChat={leaveChat}
              />
            ) : (
            <>
            {/* Messages */}
            <div
              role="log"
              aria-live="polite"
              aria-busy={isLoading}
              aria-label="Conversation with Banc Bot"
              className="flex-1 space-y-4 overflow-y-auto overscroll-contain bg-banc-grey-pale/60 px-4 py-5"
            >
              {messages.map((message, index) => {
                const messageView = getPropertyChatMessageView(message);
                const chatLinks = splitChatLinks(messageView.sources, pathname);
                const isUser = message.role === "user";
                const hasActions =
                  chatLinks.listings.length > 0 ||
                  chatLinks.sources.length > 0 ||
                  messageView.form !== undefined ||
                  messageView.handoff !== undefined;
                return (
                  <motion.div
                    key={message.id}
                    ref={index === messages.length - 1 ? latestMessageRef : undefined}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex scroll-mt-3 flex-col gap-2.5 ${isUser ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-[18px] px-4 py-3 text-[15px] leading-[1.55] ${
                        isUser
                          ? "rounded-br-md bg-banc-dark-deep text-white"
                          : "rounded-bl-md border border-banc-grey/10 bg-white text-banc-dark shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                      }`}
                    >
                      {message.content}

                      {/* Schools, key features: rows instead of a paragraph */}
                      {messageView.details && (
                        <div className="mt-3 border-t border-banc-grey/10 pt-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-banc-muted-readable">
                            {messageView.details.title}
                          </p>
                          <ul className="mt-1.5 divide-y divide-banc-grey/10">
                            {messageView.details.items.map((item) => (
                              <li
                                key={`${item.label}-${item.note ?? ""}`}
                                className="flex items-start justify-between gap-3 py-2 text-sm"
                              >
                                <span className="flex min-w-0 items-start gap-2 font-medium text-banc-dark">
                                  {item.note === undefined && (
                                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-banc-focus" aria-hidden="true" />
                                  )}
                                  <span>{item.label}</span>
                                </span>
                                {item.note !== undefined && (
                                  <span className="flex-shrink-0 whitespace-nowrap pt-px text-xs text-banc-muted-readable">
                                    {item.note}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Property cards: swipe sideways through the matches */}
                    {messageView.properties.length > 0 && (
                      <div className="-mx-4 flex w-[calc(100%+2rem)] snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide">
                        {messageView.properties.map((property) => {
                          const imageUrl = getSafePropertyImageUrl(
                            property.images?.[0] ?? "",
                          );
                          return (
                            <button
                              key={property.id}
                              type="button"
                              onClick={() => viewHome(property, property.title, property)}
                              className="group w-[72%] flex-shrink-0 cursor-pointer snap-start overflow-hidden rounded-2xl border border-banc-grey/15 bg-white text-left shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus sm:w-[15rem]"
                            >
                              <span className="block aspect-[16/10] w-full overflow-hidden bg-banc-grey/20">
                                {imageUrl && (
                                  <Image
                                    src={imageUrl}
                                    alt={`${property.title} photo`}
                                    width={480}
                                    height={300}
                                    unoptimized
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
                                  />
                                )}
                              </span>
                              <span className="block px-3.5 pb-3 pt-2.5">
                                <span className="block text-base font-semibold leading-tight text-banc-dark">
                                  {property.price}
                                </span>
                                <span className="mt-1 line-clamp-2 text-sm leading-snug text-banc-dark">
                                  {property.title}
                                </span>
                                <span className="mt-1.5 flex items-center justify-between text-xs text-banc-muted-readable">
                                  <span>
                                    {property.stats.beds} bed
                                    {property.images.length > 1 ? ` · ${property.images.length} photos` : ""}
                                  </span>
                                  <span className="flex items-center gap-1 font-medium text-banc-focus">
                                    View
                                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                                  </span>
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {hasActions && (
                      <div className="flex w-full max-w-[88%] flex-col gap-2">
                        {/* Looking comes before booking: the home opens here, in the panel */}
                        {chatLinks.listings.map((listing) => {
                          const target = listingFromHref(listing.href);
                          return target === null ? null : (
                            <button
                              key={listing.href}
                              type="button"
                              onClick={() => viewHome(target, listing.title)}
                              className={`${actionLink} w-full bg-banc-focus text-left text-white hover:bg-banc-focus-hover`}
                            >
                              <span>View {listing.title}</span>
                              <ArrowRight className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                            </button>
                          );
                        })}

                        {messageView.form && (
                          <Link
                            href={messageView.form.href}
                            onClick={leaveChat}
                            className={`${actionLink} ${
                              chatLinks.listings.length > 0
                                ? "border border-banc-focus/30 bg-white text-banc-focus hover:bg-banc-grey-pale hover:text-banc-focus-hover"
                                : "bg-banc-focus text-white hover:bg-banc-focus-hover"
                            }`}
                          >
                            {messageView.form.title}
                            <ArrowRight className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                          </Link>
                        )}

                        {chatLinks.sources.length > 0 && (
                          <div className="rounded-xl border border-banc-grey/10 bg-white px-2 py-1.5">
                            <p className="px-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-banc-muted-readable">
                              From Banc&apos;s site
                            </p>
                            {chatLinks.sources.map((source) => (
                              <Link
                                key={source.href}
                                href={source.href}
                                onClick={leaveChat}
                                className="flex min-h-11 cursor-pointer items-center rounded-lg px-2 text-sm font-medium text-banc-focus underline-offset-2 transition-colors duration-200 hover:bg-banc-grey-pale hover:text-banc-focus-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2"
                              >
                                {source.title}
                              </Link>
                            ))}
                          </div>
                        )}

                        {messageView.handoff && (
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <a
                              href={messageView.handoff.callHref}
                              className="flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-banc-focus px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-banc-focus-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2"
                            >
                              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                              Call Banc
                            </a>
                            {messageView.handoff.whatsappHref && (
                              <a
                                href={messageView.handoff.whatsappHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#1EAD54] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
                              >
                                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                                WhatsApp Banc
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {isLoading && (
                <div className="flex justify-start" aria-label="Banc Bot is typing">
                  <div className="rounded-[18px] rounded-bl-md border border-banc-grey/10 bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-banc-grey/50" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-banc-grey/50 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-banc-grey/50 [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested next steps; out of the way once the visitor is typing */}
            <div
              className={`shrink-0 flex-wrap gap-2 border-t border-banc-grey/10 bg-white px-4 pb-1 pt-3 ${
                input.trim() ? "hidden" : "flex"
              }`}
            >
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    void sendMessage(reply);
                  }}
                  className="min-h-9 cursor-pointer rounded-full border border-banc-grey/20 bg-banc-grey-pale px-3.5 py-1.5 text-[13px] font-medium text-banc-dark transition-colors duration-200 hover:border-banc-focus hover:text-banc-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus disabled:opacity-50"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Message box */}
            <div className="flex shrink-0 items-end gap-2 bg-white px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2.5 sm:pb-4">
              <label htmlFor="property-chat-input" className="sr-only">
                Message Banc Bot
              </label>
              <textarea
                id="property-chat-input"
                ref={inputRef}
                rows={1}
                value={input}
                enterKeyHint="send"
                onChange={(e) => {
                  setInput(e.target.value);
                  resizeInput();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder="Ask about a home, school or area"
                className="min-h-12 flex-1 resize-none rounded-3xl border border-banc-grey/25 bg-banc-grey-pale/70 px-4 py-3 text-base leading-6 text-banc-dark placeholder:text-banc-muted-readable transition-colors duration-200 focus:border-banc-focus focus:bg-white focus:outline-none focus:ring-2 focus:ring-banc-focus/25"
              />
              <button
                type="button"
                onClick={() => {
                  void sendMessage();
                }}
                disabled={isLoading || !input.trim()}
                className="flex h-12 w-12 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-banc-focus text-white transition-colors duration-200 hover:bg-banc-focus-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2 disabled:cursor-default disabled:bg-banc-grey/30"
                aria-label="Send message"
              >
                <ArrowUp className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
