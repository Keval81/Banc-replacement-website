"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { X, SlidersHorizontal } from "lucide-react";
import AdvancedSearch, { type SearchFilters } from "./AdvancedSearch";

// ============================================
// Types & Interfaces
// ============================================

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
  onClearFilters: () => void;
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
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
  isLoading,
  resultCount,
}: MobileFilterDrawerProps) {
  // Prevent body scroll when drawer is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key to close drawer
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

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
            className="fixed inset-0 bg-[#2C2F33]/60 backdrop-blur-sm z-40 md:hidden"
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
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
              filters={filters}
              onFilterChange={onFilterChange}
              onClearFilters={onClearFilters}
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
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl",
        "bg-white border border-[#E5E7EB]",
        "text-sm font-medium text-[#2C2F33]",
        "hover:border-[#1DBFDD] hover:text-[#1DBFDD]",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-[#1DBFDD] focus:ring-offset-2",
        className
      )}
      aria-label="Open filters"
    >
      <SlidersHorizontal className="w-4 h-4" />
      <span className="hidden sm:inline">Filters</span>
      {activeFilterCount > 0 && (
        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#1DBFDD] text-white text-xs font-semibold">
          {activeFilterCount}
        </span>
      )}
    </button>
  );
}

// Export types
export type { MobileFilterDrawerProps, MobileFilterButtonProps };
