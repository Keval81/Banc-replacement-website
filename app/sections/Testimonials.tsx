"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";

// Real Google reviews, presented as typographic pull-quotes — no stock faces
// attached to real reviewers (see DESIGN.md).
const testimonials = [
  {
    quote:
      "We have just sold our house through Banc Property Group and it was such a positive experience. I cannot speak highly enough of Andrew who couldn't have been more helpful throughout the entire process.",
    name: "Dawn P.",
    location: "Cuffley, Hertfordshire",
  },
  {
    quote:
      "Andrew, Nitesh and Vicky sold my house quickly and efficiently. Very professional friendly team supported me through the process. Would highly recommend.",
    name: "Iwona K.",
    location: "Potters Bar, Hertfordshire",
  },
  {
    quote:
      "The entire team were extremely helpful finding a rental property. The process was made extremely smooth and I would definitely recommend them to anyone.",
    name: "James M.",
    location: "Hadley Wood, London",
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
    const interval = setInterval(handleNext, 7000);
    return () => clearInterval(interval);
  }, [handleNext]);

  const t = testimonials[active];

  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto w-full max-w-[1400px] px-5 lg:px-10">
        <SectionHeader number="03" label="Clients" title="In their words" />

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_auto]">
          <div className="min-h-[180px] max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.figure
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45 }}
              >
                <blockquote className="font-serif text-2xl font-light leading-snug text-banc-dark sm:text-3xl">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-1 border-t border-banc-dark/15 pt-4">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-banc-dark">
                    {t.name}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-banc-grey">
                    {t.location}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-banc-grey">
                    Google review &middot; 5.0
                  </span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          <div className="flex items-start gap-3">
            <button
              onClick={handlePrev}
              aria-label="Previous testimonial"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-banc-dark/20 text-banc-dark transition-colors hover:border-banc-dark"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next testimonial"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-banc-dark/20 text-banc-dark transition-colors hover:border-banc-dark"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
