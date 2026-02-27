"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Search, 
  Heart, 
  User, 
  Phone,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  className?: string;
}

const navItems = [
  { 
    name: "Home", 
    href: "/", 
    icon: Home,
    exact: true 
  },
  { 
    name: "Search", 
    href: "/sales/properties", 
    icon: Search,
    exact: false 
  },
  { 
    name: "Saved", 
    href: "/favorites", 
    icon: Heart,
    exact: false 
  },
  { 
    name: "Contact", 
    href: "/contact", 
    icon: MessageSquare,
    exact: false 
  },
  { 
    name: "Call", 
    href: "tel:01707877781", 
    icon: Phone,
    exact: false,
    isExternal: true 
  },
];

export function MobileBottomNav({ className }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg lg:hidden",
        "safe-area-pb", // Handle iOS safe area
        className
      )}
      aria-label="Mobile navigation"
    >
      <div className="mx-auto flex max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname.startsWith(item.href);
          
          const Icon = item.icon;

          if (item.isExternal) {
            return (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex flex-col items-center gap-1 py-3 px-4 min-w-[64px]",
                  "active:scale-95 transition-transform"
                )}
                aria-label={`Call us at ${item.href.replace("tel:", "")}`}
              >
                <div className="relative">
                  <Icon 
                    className={cn(
                      "h-6 w-6 transition-colors",
                      "text-muted-foreground group-active:text-primary"
                    )} 
                  />
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors",
                  "text-muted-foreground"
                )}>
                  {item.name}
                </span>
              </a>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex flex-col items-center gap-1 py-3 px-4 min-w-[64px]",
                "active:scale-95 transition-transform"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    "h-6 w-6 transition-colors",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground group-hover:text-foreground"
                  )} 
                />
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground group-hover:text-foreground"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Alternative: Sticky CTA bar for property pages
interface MobilePropertyCTAProps {
  propertyRef?: string;
  onCall?: () => void;
  onEnquire?: () => void;
  className?: string;
}

export function MobilePropertyCTA({
  propertyRef,
  onCall,
  onEnquire,
  className,
}: MobilePropertyCTAProps) {
  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background p-4 lg:hidden",
        className
      )}
    >
      <div className="flex gap-3">
        <a
          href="tel:01707877781"
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 font-medium",
            "border border-border bg-muted text-foreground",
            "active:scale-[0.98] transition-transform"
          )}
          onClick={onCall}
        >
          <Phone className="h-5 w-5" />
          Call
        </a>
        <button
          onClick={onEnquire}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 font-medium",
            "bg-primary text-primary-foreground",
            "active:scale-[0.98] transition-transform"
          )}
        >
          <MessageSquare className="h-5 w-5" />
          Enquire
        </button>
      </div>
    </div>
  );
}
