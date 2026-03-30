"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, Scale, ChevronUp, ChevronDown } from "lucide-react";
import { useComparison } from "@/app/hooks/usePropertyComparison";

interface CompareBarProps {
  className?: string;
}

export default function CompareBar({ className }: CompareBarProps) {
  const { comparedProperties, removeFromComparison, clearComparison } = useComparison();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (comparedProperties.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow-2xl",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-[#4AC8E8]" />
          <span className="font-medium">
            Compare ({comparedProperties.length}/3)
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded md:hidden"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearComparison}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
          <Link href="/compare">
            <Button
              size="sm"
              className="bg-[#4AC8E8] hover:bg-[#1A9BBF]"
              disabled={comparedProperties.length < 2}
            >
              Compare Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Property Thumbnails */}
      <AnimatePresence>
        {(isExpanded || !isMobile) && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-4 p-4 overflow-x-auto">
              {comparedProperties.map((property) => (
                <motion.div
                  key={property.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex-shrink-0 w-40 bg-gray-50 rounded-lg overflow-hidden"
                >
                  <div className="relative aspect-[4/3]">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFromComparison(property.id)}
                      className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{property.title}</p>
                    <p className="text-xs text-[#4AC8E8] font-semibold">
                      {property.price}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {/* Empty Slots */}
              {Array.from({ length: 3 - comparedProperties.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex-shrink-0 w-40 h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs"
                >
                  Add property
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
