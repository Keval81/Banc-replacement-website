'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Train, Crown, Home, Trees } from 'lucide-react';
import { generateSmartDescription } from '@/lib/ai/chat';

interface SmartDescriptionProps {
  property: {
    features: string[];
    bedrooms: number;
    location: string;
    propertyType: string;
    nearbySchools?: boolean;
    transportLinks?: boolean;
  };
  variant?: 'badges' | 'text';
}

export default function SmartDescription({ property, variant = 'badges' }: SmartDescriptionProps) {
  const highlights = useMemo(() => {
    return generateSmartDescription(property);
  }, [property]);

  if (highlights.length === 0) return null;

  const iconMap: Record<string, React.ReactNode> = {
    'Perfect for families': <Users className="w-3.5 h-3.5" />,
    'Great for commuters': <Train className="w-3.5 h-3.5" />,
    'Luxury living': <Crown className="w-3.5 h-3.5" />,
    'Ideal for first-time buyers': <Home className="w-3.5 h-3.5" />,
    'Outdoor space to enjoy': <Trees className="w-3.5 h-3.5" />,
  };

  if (variant === 'text') {
    return (
      <p className="text-banc-muted-readable italic">
        {highlights.join(' • ')}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {highlights.map((highlight, index) => (
        <motion.span
          key={highlight}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="inline-flex items-center gap-1.5 text-xs font-medium bg-gradient-to-r from-banc-teal/10 to-banc-teal/5 text-banc-teal px-2.5 py-1 rounded-full border border-banc-teal/20"
        >
          {iconMap[highlight]}
          {highlight}
        </motion.span>
      ))}
    </div>
  );
}