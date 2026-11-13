"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="border-b border-banc-dark/15">
      {items.map((item, index) => (
        <div
          key={index}
          className="border-t border-banc-dark/15"
        >
          <button
            onClick={() => toggleItem(index)}
            className="flex min-h-11 w-full items-center justify-between gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2"
            aria-expanded={openIndex === index}
          >
            <span className={cn(
              "font-semibold text-banc-dark-deep",
              openIndex === index && "text-banc-focus"
            )}>
              {item.question}
            </span>
            <ChevronDown className={cn(
              "h-5 w-5 flex-shrink-0 text-banc-muted-readable transition-transform duration-200 motion-reduce:transition-none",
              openIndex === index && "rotate-180 text-banc-focus"
            )} />
          </button>
          
          <div
            className={cn(
              "grid transition-all duration-300 ease-in-out motion-reduce:transition-none",
              openIndex === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}
          >
            <div className="overflow-hidden">
              <p className="max-w-3xl pb-6 leading-relaxed text-banc-muted-readable">
                {item.answer}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
