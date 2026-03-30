'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles, ThumbsUp } from 'lucide-react';

interface MatchScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  reasons?: string[];
}

export default function MatchScore({ 
  score, 
  size = 'md', 
  showLabel = true,
  reasons 
}: MatchScoreProps) {
  // Determine color based on score
  const getColor = () => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-banc-grey bg-banc-grey-pale border-banc-grey/20';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-10 h-10 text-xs';
      case 'lg':
        return 'w-16 h-16 text-lg';
      default:
        return 'w-12 h-12 text-sm';
    }
  };

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative group">
      {/* Score Badge */}
      <div className={`relative ${getSizeClasses()}`}>
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="40%"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-banc-grey/20"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50%"
            cy="50%"
            r="40%"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-banc-grey'}
          />
        </svg>
        
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${size === 'lg' ? 'text-xl' : 'text-sm'}`}>
            {score}%
          </span>
          {showLabel && size !== 'sm' && (
            <span className="text-[10px] text-banc-grey">Match</span>
          )}
        </div>

        {/* Sparkle for high matches */}
        {score >= 85 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center"
          >
            <Sparkles className="w-3 h-3 text-white" />
          </motion.div>
        )}
      </div>

      {/* Tooltip with reasons */}
      {reasons && reasons.length > 0 && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          <div className="bg-banc-dark-deep text-white text-xs rounded-lg p-3 shadow-lg">
            <p className="font-semibold mb-2 flex items-center gap-1">
              <ThumbsUp className="w-3 h-3" />
              Why this matches
            </p>
            <ul className="space-y-1">
              {reasons.slice(0, 3).map((reason, index) => (
                <li key={index} className="flex items-start gap-1">
                  <Check className="w-3 h-3 text-green-400 mt-0.5 shrink-0" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-banc-dark-deep rotate-45" />
          </div>
        </div>
      )}
    </div>
  );
}