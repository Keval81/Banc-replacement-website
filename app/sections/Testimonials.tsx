"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    quote:
      "We have just sold our house through Banc Property Group and it was such a positive experience. I cannot speak highly enough of Andrew who couldn't have been more helpful throughout the entire process.",
    name: "Dawn P.",
    location: "Cuffley, Hertfordshire",
    src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
  },
  {
    quote:
      "Andrew, Nitesh and Vicky sold my house quickly and efficiently. Very professional friendly team supported me through the process. Would highly recommend.",
    name: "Iwona K.",
    location: "Potters Bar, Hertfordshire",
    src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
  },
  {
    quote:
      "The entire team were extremely helpful finding a rental property. The process was made extremely smooth and I would definitely recommend them to anyone.",
    name: "James M.",
    location: "Hadley Wood, London",
    src: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=400&auto=format&fit=crop",
  },
  {
    quote:
      "Banc delivered a seamless, premium service from valuation to completion. The marketing was flawless and we achieved a record price within two weeks.",
    name: "Sophia H.",
    location: "Cuffley, Hertfordshire",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop",
  },
  {
    quote:
      "The Premier Homes team handled every detail with discretion and care. Truly best-in-class service for our luxury property sale.",
    name: "Amelia R.",
    location: "Mayfair, London",
    src: "https://images.unsplash.com/photo-1557053910-d9eadeed1c58?q=80&w=400&auto=format&fit=crop",
  },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);

  const handleNext = useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length);
  }, []);

  const handlePrev = useCallback(() => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(handleNext, 6000);
    return () => clearInterval(interval);
  }, [handleNext]);

  const isActive = (index: number) => index === active;

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-12 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-banc-grey mb-3">Testimonials</p>
          <h2 className="text-3xl font-medium text-banc-dark sm:text-4xl font-serif">
            What our clients say about BANC
          </h2>
        </div>

        <div className="relative grid grid-cols-1 gap-y-10 md:grid-cols-2 md:gap-x-16 lg:gap-x-20 items-center">
          {/* Stacked Image Section */}
          <div className="flex items-center justify-center">
            <div className="relative h-72 w-full max-w-xs sm:h-80">
              <AnimatePresence>
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.name}
                    initial={{ opacity: 0, scale: 0.9, y: 50, rotate: `${Math.floor(Math.random() * 16) - 8}deg` }}
                    animate={{
                      opacity: isActive(index) ? 1 : 0.4,
                      scale: isActive(index) ? 1 : 0.9,
                      y: isActive(index) ? 0 : 20,
                      zIndex: isActive(index) ? testimonials.length : testimonials.length - Math.abs(index - active),
                      rotate: isActive(index) ? "0deg" : `${Math.floor(Math.random() * 16) - 8}deg`,
                    }}
                    exit={{ opacity: 0, scale: 0.9, y: -50 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="absolute inset-0 origin-bottom"
                  >
                    <Image
                      src={testimonial.src}
                      alt={testimonial.name}
                      fill
                      sizes="320px"
                      className="rounded-2xl object-cover shadow-2xl"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Quote Section */}
          <div className="flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-banc-sky text-banc-sky" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-lg leading-relaxed text-banc-dark-mid lg:text-xl">
                  &ldquo;{testimonials[active].quote}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="mt-6">
                  <p className="text-base font-semibold text-banc-dark">
                    {testimonials[active].name}
                  </p>
                  <p className="text-sm text-banc-grey">
                    {testimonials[active].location}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={handlePrev}
                aria-label="Previous testimonial"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-banc-grey-pale transition-colors duration-200 hover:bg-banc-sky/10 cursor-pointer"
              >
                <ArrowLeft className="h-5 w-5 text-banc-dark" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next testimonial"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-banc-grey-pale transition-colors duration-200 hover:bg-banc-sky/10 cursor-pointer"
              >
                <ArrowRight className="h-5 w-5 text-banc-dark" />
              </button>

              {/* Dots */}
              <div className="flex gap-2 ml-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActive(index)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      active === index ? "w-6 bg-banc-sky" : "w-2 bg-banc-grey/30"
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
