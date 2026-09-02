'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, User } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
}

const mockReviews: Review[] = [
  {
    id: '1',
    name: 'Dawn',
    location: 'Leefe Way, Cuffley',
    rating: 5,
    text: 'We have just sold our house through Banc Property Group and it was such a positive experience. We achieved the asking price very quickly.',
  },
  {
    id: '2',
    name: 'Pembe',
    location: 'Goffs Crescent, Goffs Oak',
    rating: 5,
    text: 'Highly recommend Banc estate agent. They really have exceeded expectations and provide a professional service.',
  },
  {
    id: '3',
    name: 'Tammy',
    location: 'Hollybush Way, Cheshunt',
    rating: 5,
    text: 'Banc have been fantastic in the one year we have worked with them as tenants. All staff are lovely, work very hard to resolve issues and respond very quickly to all queries.',
  },
  {
    id: '4',
    name: 'George & Soulla',
    location: 'Tolmers Road, Cuffley',
    rating: 5,
    text: 'We sold our property with Banc and found our dream home with Banc, double win! We were so grateful for all the support from the team.',
  },
  {
    id: '5',
    name: 'Hazel',
    location: 'Pollards Close, Goffs Oak',
    rating: 5,
    text: 'Love the whole team, kept in touch the whole-time during viewing, sale and completion. Can highly recommend them.',
  },
];

interface LiveReviewFeedProps {
  /** Reviews to rotate through; renders nothing when empty. */
  reviews?: Review[];
}

export default function LiveReviewFeed({ reviews = mockReviews }: LiveReviewFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const count = reviews.length;

  useEffect(() => {
    if (count === 0) return;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const interval = setInterval(() => {
      setIsVisible(false);
      timeout = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % count);
        setIsVisible(true);
      }, 300);
    }, 5000);

    return () => {
      clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [count]);

  const review = reviews[currentIndex % Math.max(count, 1)];
  if (!review) return null;

  return (
    <div className="bg-gradient-to-r from-[#1a4d5c] to-[#2a5d6c] text-white py-3 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-4">
          {/* Live Indicator */}
          <div className="flex items-center gap-2 shrink-0">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium uppercase tracking-wider text-white/70">Reviews</span>
          </div>

          {/* Review Content */}
          <AnimatePresence mode="wait">
            {isVisible && (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex min-w-0 items-center gap-4 flex-1 justify-center"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="hidden sm:block">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{review.name}</span>
                      <span className="text-white/50 text-xs">• {review.location}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex min-w-0 items-center gap-2 text-sm text-white/90 max-w-lg">
                  <Quote className="w-4 h-4 text-white/40 shrink-0" />
                  <span className="truncate">{review.text}</span>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* Google Reviews Link */}
          <a
            href="/reviews"
            className="text-xs text-white/70 hover:text-white transition-colors shrink-0 hidden sm:block"
          >
            View all reviews
          </a>
        </div>
      </div>
    </div>
  );
}