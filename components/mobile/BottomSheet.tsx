"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
  snapPoints?: number[];
  initialSnap?: number;
  showHandle?: boolean;
  showCloseButton?: boolean;
  backdrop?: boolean;
  dismissOnBackdropClick?: boolean;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  className,
  snapPoints = [0.3, 0.6, 0.9],
  initialSnap = 0,
  showHandle = true,
  showCloseButton = true,
  backdrop = true,
  dismissOnBackdropClick = true,
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);

  // Convert snap points to pixel values (assuming viewport height)
  const getSnapPixels = (index: number) => {
    if (typeof window === "undefined") return 0;
    const vh = window.innerHeight;
    return vh * (1 - snapPoints[index]);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    // If swiped down fast, close
    if (velocity > 500 || offset > 150) {
      onClose();
      return;
    }

    // Find nearest snap point
    const currentY = y.get();
    const snapPixels = snapPoints.map((_, i) => getSnapPixels(i));
    const closestSnap = snapPixels.reduce((prev, curr, index) => {
      return Math.abs(curr - currentY) < Math.abs(snapPixels[prev] - currentY) ? index : prev;
    }, 0);

    setCurrentSnap(closestSnap);
  };

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          {backdrop && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={dismissOnBackdropClick ? onClose : undefined}
              aria-hidden="true"
            />
          )}

          {/* Sheet */}
          <motion.div
            ref={constraintsRef}
            initial={{ y: "100%" }}
            animate={{ y: getSnapPixels(currentSnap) }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            style={{ y }}
            className={cn(
              "fixed left-0 right-0 bottom-0 z-50 rounded-t-3xl bg-background shadow-2xl",
              "max-h-[90vh] flex flex-col",
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "bottom-sheet-title" : undefined}
          >
            {/* Handle */}
            {showHandle && (
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
              </div>
            )}

            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                {title && (
                  <h2 id="bottom-sheet-title" className="text-lg font-semibold">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-muted transition-colors"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Simplified version for mobile filters
interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  onApply?: () => void;
  onClear?: () => void;
  applyLabel?: string;
  clearLabel?: string;
}

export function MobileFilterSheet({
  isOpen,
  onClose,
  children,
  title = "Filters",
  onApply,
  onClear,
  applyLabel = "Apply",
  clearLabel = "Clear",
}: MobileFilterSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      snapPoints={[0.5, 0.85]}
      initialSnap={1}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3 p-4 border-t border-border bg-background">
          {onClear && (
            <button
              onClick={onClear}
              className="flex-1 px-4 py-3 rounded-xl border border-border font-medium text-foreground hover:bg-muted transition-colors"
            >
              {clearLabel}
            </button>
          )}
          {onApply && (
            <button
              onClick={onApply}
              className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              {applyLabel}
            </button>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
