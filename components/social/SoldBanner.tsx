'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { X, MapPin, Clock, TrendingUp } from 'lucide-react';
import Image from 'next/image';

interface SoldProperty {
  id: string;
  address: string;
  location: string;
  price: number;
  soldPrice: number;
  daysOnMarket: number;
  image: string;
}

const mockSoldProperties: SoldProperty[] = [
  {
    id: '1',
    address: '12 Station Road',
    location: 'Cuffley',
    price: 800000,
    soldPrice: 850000,
    daysOnMarket: 14,
    image: '/images/houses/house1.jpg',
  },
  {
    id: '2',
    address: '24 The Avenue',
    location: 'Potters Bar',
    price: 675000,
    soldPrice: 720000,
    daysOnMarket: 9,
    image: '/images/houses/house2.jpg',
  },
  {
    id: '3',
    address: '5 Brookmans Avenue',
    location: 'Brookmans Park',
    price: 950000,
    soldPrice: 985000,
    daysOnMarket: 11,
    image: '/images/houses/house3.jpg',
  },
  {
    id: '4',
    address: '18 Bulls Lane',
    location: 'Welham Green',
    price: 550000,
    soldPrice: 575000,
    daysOnMarket: 18,
    image: '/images/houses/house4.jpg',
  },
  {
    id: '5',
    address: '7 Cuffley Hill',
    location: 'Cuffley',
    price: 425000,
    soldPrice: 445000,
    daysOnMarket: 16,
    image: '/images/houses/house5.jpg',
  },
  {
    id: '6',
    address: '3 Warrengate Road',
    location: 'North Mymms',
    price: 1200000,
    soldPrice: 1250000,
    daysOnMarket: 8,
    image: '/images/houses/house6.jpg',
  },
];

function formatPropertyText(property: SoldProperty): string {
  const percentageAchieved = ((property.soldPrice / property.price) * 100).toFixed(0);
  return `📍 JUST SOLD: ${property.address}, ${property.location} - £${property.soldPrice.toLocaleString()} (${percentageAchieved}% of asking, sold in ${property.daysOnMarket} days)`;
}

export default function SoldBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState(0);
  const pathname = usePathname();

  // Only show on homepage
  const isHomepage = pathname === '/';

  // Get current property for desktop card
  const currentProperty = mockSoldProperties[currentPropertyIndex];

  useEffect(() => {
    if (!isHomepage) return;

    // Show banner after 5 seconds
    const showTimer = setTimeout(() => {
      setShowBanner(true);
    }, 5000);

    return () => clearTimeout(showTimer);
  }, [isHomepage]);

  // Rotate properties every 8 seconds for desktop card
  useEffect(() => {
    if (!showBanner) return;

    const rotateTimer = setInterval(() => {
      setCurrentPropertyIndex((prev) => (prev + 1) % mockSoldProperties.length);
    }, 8000);

    return () => clearInterval(rotateTimer);
  }, [showBanner]);

  // Don't render if not on homepage
  if (!isHomepage) return null;

  // Create scrolling text content (duplicate for seamless loop)
  const scrollingContent = [...mockSoldProperties, ...mockSoldProperties]
    .map(formatPropertyText)
    .join(' • ');

  // Calculate percentage achieved for current property
  const percentageAchieved = currentProperty
    ? ((currentProperty.soldPrice / currentProperty.price) * 100).toFixed(0)
    : '0';

  return (
    <AnimatePresence>
      {showBanner && (
        <>
          {/* MOBILE: Thin News Ticker - Fixed above footer nav */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-[70px] left-0 right-0 z-40 md:hidden"
          >
            <div 
              className="relative h-11 overflow-hidden"
              style={{ backgroundColor: '#4AC8E8' }}
            >
              {/* Scrolling Text Container */}
              <div
                className="absolute inset-0 flex items-center overflow-hidden"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
              >
                <div
                  className={`whitespace-nowrap flex items-center text-white text-sm font-medium ${
                    isPaused ? '' : 'animate-marquee'
                  }`}
                  style={{
                    animationPlayState: isPaused ? 'paused' : 'running',
                    animationDuration: '120s', // Much slower for mobile readability
                  }}
                >
                  <span className="px-4">{scrollingContent} • </span>
                  <span className="px-4">{scrollingContent} • </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowBanner(false)}
                className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center z-10 touch-target-sm"
                style={{ 
                  backgroundColor: '#4AC8E8',
                  background: 'linear-gradient(to left, #4AC8E8 70%, transparent)'
                }}
                aria-label="Close banner"
              >
                <X className="w-4 h-4 text-white" strokeWidth={3} />
              </button>

              {/* Gradient fade on right edge */}
              <div 
                className="absolute right-12 top-0 bottom-0 w-8 pointer-events-none"
                style={{
                  background: 'linear-gradient(to left, #4AC8E8, transparent)'
                }}
              />
            </div>
          </motion.div>

          {/* DESKTOP: Popup Card Style - Bottom Left */}
          <motion.div
            initial={{ opacity: 0, x: -50, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -50, y: 20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed bottom-6 left-6 z-40 hidden md:block"
          >
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-[380px] border border-banc-grey/10">
              {/* Header */}
              <div 
                className="px-4 py-2 flex items-center justify-between"
                style={{ backgroundColor: '#4AC8E8' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-semibold">JUST SOLD</span>
                  <span className="text-white/80 text-xs">•</span>
                  <span className="text-white/90 text-xs">
                    {currentPropertyIndex + 1} of {mockSoldProperties.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowBanner(false)}
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors touch-target-sm"
                  aria-label="Close banner"
                >
                  <X className="w-4 h-4 text-white" strokeWidth={2.5} />
                </button>
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentProperty.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex"
                >
                  {/* Image */}
                  <div className="relative w-28 h-28 flex-shrink-0 bg-banc-grey-pale">
                    <Image
                      src={currentProperty.image}
                      alt={`${currentProperty.address}`}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                    <div 
                      className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: '#4AC8E8' }}
                    >
                      SOLD
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 p-3 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-banc-dark text-sm leading-tight">
                        {currentProperty.address}
                      </h4>
                      <div className="flex items-center gap-1 text-banc-grey text-xs mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{currentProperty.location}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs text-banc-grey line-through">
                          £{currentProperty.price.toLocaleString()}
                        </span>
                        <span className="font-bold text-banc-dark">
                          £{currentProperty.soldPrice.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] text-banc-grey">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          <span className="text-green-600 font-medium">{percentageAchieved}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{currentProperty.daysOnMarket} days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Progress Dots */}
              <div className="px-3 py-2 flex items-center justify-center gap-1.5 border-t border-banc-grey/10">
                {mockSoldProperties.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPropertyIndex(index)}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 touch-target-sm ${
                      index === currentPropertyIndex
                        ? 'w-4'
                        : 'hover:opacity-70'
                    }`}
                    style={{
                      backgroundColor: index === currentPropertyIndex ? '#4AC8E8' : '#D1D5DB',
                    }}
                    aria-label={`View property ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
