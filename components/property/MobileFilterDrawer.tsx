"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";
import type { PropertyDepartment, PropertySearchFilters } from "@/lib/property-search/types";
import AdvancedSearch from "./AdvancedSearchView";

// ============================================
// Types & Interfaces
// ============================================

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  department: PropertyDepartment;
  filters: PropertySearchFilters;
  onFilterChange: (filters: Partial<PropertySearchFilters>) => void;
  onClearFilters: () => void;
  onSearch?: () => void;
  hasActiveFilters: boolean;
  isLoading?: boolean;
  resultCount?: number;
}

// ============================================
// Main Component
// ============================================

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  department,
  filters,
  onFilterChange,
  onClearFilters,
  onSearch,
  hasActiveFilters,
  isLoading,
  resultCount,
}: MobileFilterDrawerProps) {
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const previouslyFocused = React.useRef<HTMLElement | null>(null);
  const onCloseRef = React.useRef(onClose);
  React.useLayoutEffect(() => {
    onCloseRef.current = onClose;
  });

  React.useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusableSelector = [
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "[tabindex]:not([tabindex='-1'])",
    ].join(",");
    const focusableElements = () =>
      Array.from(drawerRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? []);
    const animationFrame = requestAnimationFrame(() => focusableElements()[0]?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const elements = focusableElements();
      if (elements.length === 0) {
        event.preventDefault();
        return;
      }
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!drawerRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(animationFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      previouslyFocused.current?.focus();
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1A1917]/60 backdrop-blur-sm z-40 md:hidden"
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ 
              type: "spring", 
              damping: 30, 
              stiffness: 300,
              mass: 0.8
            }}
            className={cn(
              "fixed top-0 right-0 bottom-0 z-50 w-full max-w-md",
              "bg-white shadow-2xl",
              "md:hidden",
              "flex flex-col"
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Property filters"
          >
            {/* Advanced Search Component */}
            <AdvancedSearch
              department={department}
              filters={filters}
              onFilterChange={onFilterChange}
              onClearFilters={onClearFilters}
              onSearch={onSearch}
              hasActiveFilters={hasActiveFilters}
              isMobile
              onClose={onClose}
              isLoading={isLoading}
              resultCount={resultCount}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================
// Mobile Filter Toggle Button
// ============================================

interface MobileFilterButtonProps {
  onClick: () => void;
  activeFilterCount: number;
  className?: string;
}

export function MobileFilterButton({ 
  onClick, 
  activeFilterCount,
  className 
}: MobileFilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 px-4 py-2.5 rounded-xl",
        "bg-white border border-[#E0DFDC]",
        "text-sm font-medium text-[#1A1917]",
        "hover:border-[#4AC8E8] hover:text-[#4AC8E8]",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4AC8E8] focus-visible:ring-offset-2",
        className
      )}
      aria-label="Open filters"
    >
      <SlidersHorizontal className="w-4 h-4" />
      <span className="hidden sm:inline">Filters</span>
      {activeFilterCount > 0 && (
        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#4AC8E8] text-white text-xs font-semibold">
          {activeFilterCount}
        </span>
      )}
    </button>
  );
}

// Export types
export type { MobileFilterDrawerProps, MobileFilterButtonProps };
