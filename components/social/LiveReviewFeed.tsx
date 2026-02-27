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
  date: string;
  propertyType: string;
}

const mockReviews: Review[] = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    location: 'Cuffley',
    rating: 5,
    text: 'Exceptional service from start to finish. Banc made selling our home stress-free.',
    date: '2 hours ago',
    propertyType: 'Detached House',
  },
  {
    id: '2',
    name: 'James Thompson',
    location: 'Brookmans Park',
    rating: 5,
    text: 'Professional, knowledgeable, and always available. Highly recommend!',
    date: '4 hours ago',
    propertyType: 'Semi-Detached',
  },
  {
    id: '3',
    name: 'Emma Wilson',
    location: 'Potters Bar',
    rating: 5,
    text: 'Found our dream home within weeks. The team really listened to our needs.',
    date: '6 hours ago',
    propertyType: 'Apartment',
  },
  {
    id: '4',
    name: 'Michael Brown',
    location: 'Welham Green',
    rating: 5,
    text: 'Outstanding marketing and negotiation skills. Got well above asking price!',
    date: '1 day ago',
    propertyType: 'Cottage',
  },
  {
    id: '5',
    name: 'Lisa Chen',
    location: 'Northaw',
    rating: 5,
    text: 'First-time buyers and they guided us through every step. Amazing experience.',
    date: '1 day ago',
    propertyType: 'Terraced House',
  },
];

export default function LiveReviewFeed() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % mockReviews.length);
        setIsVisible(true);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const review = mockReviews[currentIndex];

  return (
    <div className="bg-gradient-to-r from-[#1a4d5c] to-[#2a5d6c] text-white py-3 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-4">
          {/* Live Indicator */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-white/70">Live</span>
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
                className="flex items-center gap-4 flex-1 justify-center"
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

                <div className="hidden md:flex items-center gap-2 text-sm text-white/90 max-w-lg">
                  <Quote className="w-4 h-4 text-white/40 shrink-0" />
                  <span className="truncate">{review.text}</span>
                </div>

                <span className="text-xs text-white/50 shrink-0 hidden lg:block">{review.date}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google Reviews Link */}
          <a
            href="https://google.com/reviews"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/70 hover:text-white transition-colors shrink-0 hidden sm:block"
          >
            View all reviews
          </a>
        </div>
      </div>
    </div>
  );
}