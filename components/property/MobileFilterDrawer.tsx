"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";
import type { PropertyDepartment, PropertySearchFilters } from "@/lib/property-search/types";
import {
  MODAL_FOCUSABLE_SELECTOR,
  startModalFocusLifecycle,
} from "@/lib/property-search/modal-focus-lifecycle";
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
  const onCloseRef = React.useRef(onClose);
  React.useLayoutEffect(() => {
    onCloseRef.current = onClose;
  });

  React.useEffect(() => {
    if (!isOpen) return;

    const getFocusableElements = () =>
      Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>(MODAL_FOCUSABLE_SELECTOR) ?? [],
      );
    return startModalFocusLifecycle({
      getActiveElement: () => document.activeElement,
      getBodyOverflow: () => document.body.style.overflow,
      setBodyOverflow: (value) => { document.body.style.overflow = value; },
      getFocusableElements,
      containerContains: (element) =>
        element instanceof Node && Boolean(drawerRef.current?.contains(element)),
      addKeydownListener: (listener) =>
        document.addEventListener("keydown", listener as (event: KeyboardEvent) => void),
      removeKeydownListener: (listener) =>
        document.removeEventListener("keydown", listener as (event: KeyboardEvent) => void),
      requestFrame: (callback) => requestAnimationFrame(callback),
      cancelFrame: (frame) => cancelAnimationFrame(frame as number),
      onClose: () => onCloseRef.current(),
    });
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
            className="fixed inset-0 bg-banc-dark-deep/60 backdrop-blur-sm z-40 lg:hidden"
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
              "lg:hidden",
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
        "bg-white border border-banc-line",
        "text-sm font-medium text-banc-dark-deep",
        "hover:border-banc-focus hover:text-banc-focus",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2",
        className
      )}
      aria-label="Open filters"
    >
      <SlidersHorizontal className="w-4 h-4" />
      <span className="hidden sm:inline">Filters</span>
      {activeFilterCount > 0 && (
        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-banc-focus text-white text-xs font-semibold">
          {activeFilterCount}
        </span>
      )}
    </button>
  );
}

// Export types
export type { MobileFilterDrawerProps, MobileFilterButtonProps };
