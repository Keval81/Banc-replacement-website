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
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            "bg-white rounded-xl border border-[#E0DFDC]/30 overflow-hidden transition-all duration-200",
            openIndex === index && "border-[#4AC8E8]/50 shadow-md shadow-[#4AC8E8]/5"
          )}
        >
          <button
            onClick={() => toggleItem(index)}
            className="w-full flex items-center justify-between gap-4 p-5 text-left"
            aria-expanded={openIndex === index}
          >
            <span className={cn(
              "font-semibold text-[#1A1917] pr-4",
              openIndex === index && "text-[#4AC8E8]"
            )}>
              {item.question}
            </span>
            <div className={cn(
              "w-8 h-8 rounded-lg bg-[#F4F3F1] flex items-center justify-center flex-shrink-0 transition-all duration-200",
              openIndex === index && "bg-[#4AC8E8] rotate-180"
            )}>
              <ChevronDown className={cn(
                "h-5 w-5 text-[#8A8880] transition-colors",
                openIndex === index && "text-white"
              )} />
            </div>
          </button>
          
          <div
            className={cn(
              "grid transition-all duration-300 ease-in-out",
              openIndex === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}
          >
            <div className="overflow-hidden">
              <div className="px-5 pb-5">
                <div className="pt-2 border-t border-[#E0DFDC]/20">
                  <p className="text-[#8A8880] leading-relaxed pt-4">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
