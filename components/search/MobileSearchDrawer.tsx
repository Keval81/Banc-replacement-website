"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { X, SlidersHorizontal, Grid3X3, List, Map } from "lucide-react";
import SearchFilters from "./SearchFilters";

interface MobileSearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: any;
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export default function MobileSearchDrawer({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
}: MobileSearchDrawerProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl max-h-[85vh] overflow-hidden md:hidden"
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1 bg-banc-grey/30 rounded-full" />
            </div>
            
            {/* Header with View Toggle */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5" />
                Filters & View
              </h2>
              
              {/* Mobile View Toggle */}
              <div className="flex items-center gap-1 bg-banc-grey-pale rounded-lg p-1">
                <button
                  onClick={() => onFilterChange({ view: "grid" })}
                  className={cn(
                    "p-2 rounded transition-colors",
                    filters.view === "grid" ? "bg-white shadow-sm text-[#4AC8E8]" : "text-banc-grey"
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onFilterChange({ view: "list" })}
                  className={cn(
                    "p-2 rounded transition-colors",
                    filters.view === "list" ? "bg-white shadow-sm text-[#4AC8E8]" : "text-banc-grey"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onFilterChange({ view: "map" })}
                  className={cn(
                    "p-2 rounded transition-colors",
                    filters.view === "map" ? "bg-white shadow-sm text-[#4AC8E8]" : "text-banc-grey"
                  )}
                >
                  <Map className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-120px)]">
              <SearchFilters
                filters={filters}
                onFilterChange={onFilterChange}
                onClearFilters={onClearFilters}
                hasActiveFilters={hasActiveFilters}
                isMobile
                onClose={onClose}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
