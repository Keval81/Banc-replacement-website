"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import type { MobileWhatsappPanelPlacement } from "@/lib/landing-ui";

interface FloatingWhatsAppProps {
  phoneNumber?: string;
  message?: string;
  position?: "bottom-right" | "bottom-left";
  hideOnScrollDown?: boolean;
  className?: string;
  panelPlacement?: MobileWhatsappPanelPlacement;
}

interface AnalyticsWindow extends Window {
  gtag?: (
    command: "event",
    eventName: string,
    parameters: Record<string, string>
  ) => void;
}

const DEFAULT_PHONE = "447707877781"; // Banc's number with country code
const DEFAULT_MESSAGE = "Hi, I'm interested in a property I saw on your website.";

export function FloatingWhatsApp({
  phoneNumber = DEFAULT_PHONE,
  message = DEFAULT_MESSAGE,
  position = "bottom-right",
  hideOnScrollDown = true,
  className,
  panelPlacement = "above-trigger",
}: FloatingWhatsAppProps) {
  const isMobile = useIsMobile();
  const scrollDirection = useScrollDirection({ threshold: 50 });
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (!hideOnScrollDown) {
        setIsVisible(true);
        return;
      }

      if (scrollDirection === "down") {
        setIsVisible(false);
        setIsExpanded(false);
      } else if (scrollDirection === "up") {
        setIsVisible(true);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [scrollDirection, hideOnScrollDown]);

  // Don't show on desktop unless explicitly desired
  if (!isMobile) {
    return null;
  }

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  // On mobile, WhatsApp is positioned bottom-left above footer area
  const positionClasses = {
    "bottom-right":
      "right-[calc(1rem+env(safe-area-inset-right))] bottom-[calc(9rem+env(safe-area-inset-bottom))]",
    "bottom-left":
      "left-[calc(1rem+env(safe-area-inset-left))] bottom-[calc(9rem+env(safe-area-inset-bottom))]",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={cn(
            "fixed z-40 flex flex-col items-end gap-2",
            positionClasses[position],
            className
          )}
        >
          {/* Expanded message */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={
                  panelPlacement === "left-of-trigger"
                    ? { opacity: 0, scale: 0.9, x: 12 }
                    : { opacity: 0, scale: 0.8, y: 20 }
                }
                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                exit={
                  panelPlacement === "left-of-trigger"
                    ? { opacity: 0, scale: 0.9, x: 12 }
                    : { opacity: 0, scale: 0.8, y: 20 }
                }
                className={cn(
                  "rounded-2xl rounded-br-none bg-white p-4 shadow-lg dark:bg-card",
                  panelPlacement === "left-of-trigger"
                    ? "absolute bottom-0 right-[calc(100%+0.75rem)] w-[min(12.5rem,calc(100vw-6.5rem))]"
                    : "mb-2 max-w-[200px]"
                )}
              >
                <p className="text-sm text-foreground">
                  Need help? Chat with us on WhatsApp!
                </p>
                <div className="mt-2 flex gap-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-lg bg-[#25D366] px-3 py-2 text-center text-sm font-medium text-white hover:bg-[#128C7E]"
                    onClick={() => {
                      const analyticsWindow = window as AnalyticsWindow;
                      if (analyticsWindow.gtag) {
                        analyticsWindow.gtag("event", "whatsapp_click", {
                          event_category: "engagement",
                          event_label: "floating_button",
                        });
                      }
                    }}
                  >
                    Chat Now
                  </a>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="rounded-lg bg-muted px-3 py-2 text-sm hover:bg-muted/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-colors",
              "bg-[#25D366] text-white hover:bg-[#128C7E]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
            )}
            aria-label={isExpanded ? "Close WhatsApp chat" : "Open WhatsApp chat"}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isExpanded ? (
                <X className="h-6 w-6" />
              ) : (
                <MessageCircle className="h-6 w-6 fill-current" />
              )}
            </motion.div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Variant for property pages with pre-filled property reference
interface PropertyWhatsAppProps {
  propertyRef: string;
  propertyAddress: string;
  phoneNumber?: string;
}

export function PropertyWhatsAppButton({
  propertyRef,
  propertyAddress,
  phoneNumber = DEFAULT_PHONE,
}: PropertyWhatsAppProps) {
  const message = `Hi, I'm interested in property ${propertyRef} at ${propertyAddress}. Can you provide more information?`;
  
  return (
    <FloatingWhatsApp
      phoneNumber={phoneNumber}
      message={message}
      hideOnScrollDown={false}
    />
  );
}

// Desktop inline WhatsApp button
interface DesktopWhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function DesktopWhatsAppButton({
  phoneNumber = DEFAULT_PHONE,
  message = DEFAULT_MESSAGE,
  variant = "primary",
  size = "md",
  className,
}: DesktopWhatsAppButtonProps) {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  const variantClasses = {
    primary: "bg-[#25D366] text-white hover:bg-[#128C7E]",
    outline: "border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10",
    ghost: "text-[#25D366] hover:bg-[#25D366]/10",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 rounded-xl font-medium transition-colors",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      <MessageCircle className={cn("fill-current", size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5")} />
      <span>WhatsApp</span>
    </a>
  );
}
