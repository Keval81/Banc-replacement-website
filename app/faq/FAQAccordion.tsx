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
            "bg-white rounded-xl border border-[#C8C9CB]/30 overflow-hidden transition-all duration-200",
            openIndex === index && "border-[#1DBFDD]/50 shadow-md shadow-[#1DBFDD]/5"
          )}
        >
          <button
            onClick={() => toggleItem(index)}
            className="w-full flex items-center justify-between gap-4 p-5 text-left"
            aria-expanded={openIndex === index}
          >
            <span className={cn(
              "font-semibold text-[#2C2F33] pr-4",
              openIndex === index && "text-[#1DBFDD]"
            )}>
              {item.question}
            </span>
            <div className={cn(
              "w-8 h-8 rounded-lg bg-[#F0F0ED] flex items-center justify-center flex-shrink-0 transition-all duration-200",
              openIndex === index && "bg-[#1DBFDD] rotate-180"
            )}>
              <ChevronDown className={cn(
                "h-5 w-5 text-[#6B6E72] transition-colors",
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
                <div className="pt-2 border-t border-[#C8C9CB]/20">
                  <p className="text-[#6B6E72] leading-relaxed pt-4">
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
