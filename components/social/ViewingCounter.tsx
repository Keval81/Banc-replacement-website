'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Users, TrendingUp } from 'lucide-react';

interface ViewingCounterProps {
  propertyId: string;
  baseCount?: number;
}

export default function ViewingCounter({ propertyId, baseCount = 12 }: ViewingCounterProps) {
  const [viewerCount, setViewerCount] = useState(baseCount);
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    // Randomly fluctuate viewer count
    const interval = setInterval(() => {
      setViewerCount((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newCount = prev + change;
        // Keep between base-3 and base+5
        return Math.max(baseCount - 3, Math.min(baseCount + 5, newCount));
      });
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 1000);
    }, 15000);

    return () => clearInterval(interval);
  }, [baseCount]);

  // Generate urgency message
  const getUrgencyMessage = () => {
    if (viewerCount >= baseCount + 3) {
      return 'High interest today';
    }
    if (viewerCount >= baseCount) {
      return 'Popular property';
    }
    return 'Recently viewed';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium border border-orange-200"
    >
      <div className="relative">
        <Eye className="w-4 h-4" />
        {showPulse && (
          <motion.span
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            className="absolute inset-0 rounded-full bg-orange-400"
          />
        )}
      </div>
      
      <span className="flex items-center gap-1">
        <motion.span
          key={viewerCount}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-bold"
        >
          {viewerCount}
        </motion.span>
        <span className="text-orange-600/80">people viewing this today</span>
      </span>

      <span className="hidden sm:inline text-xs text-orange-500/70">
        • {getUrgencyMessage()}
      </span>
    </motion.div>
  );
}

// Counter for shortlist/favorites
export function ShortlistCounter({ count }: { count: number }) {
  return (
    <div className="inline-flex items-center gap-1.5 text-sm text-banc-muted-readable">
      <Users className="w-4 h-4" />
      <span>
        <strong className="text-banc-dark">{count}</strong> people have shortlisted this
      </span>
    </div>
  );
}

// Price drop alert
export function PriceDropAlert({ originalPrice, currentPrice, date }: { 
  originalPrice: number; 
  currentPrice: number;
  date: string;
}) {
  const drop = originalPrice - currentPrice;
  const percentage = Math.round((drop / originalPrice) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-full text-sm font-medium border border-red-200"
    >
      <TrendingUp className="w-4 h-4 rotate-180" />
      <span>Reduced by £{drop.toLocaleString()} ({percentage}%) on {date}</span>
    </motion.div>
  );
}