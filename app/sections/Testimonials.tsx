"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "Banc delivered a seamless, premium service from valuation to completion. The marketing was flawless.",
    name: "Sophia Harding",
    location: "Cuffley",
  },
  {
    quote:
      "Outstanding communication and local knowledge. We achieved a record price within two weeks.",
    name: "James Whittaker",
    location: "Hadley Wood",
  },
  {
    quote:
      "The Premier Homes team handled every detail with discretion and care. Truly best-in-class.",
    name: "Amelia Roth",
    location: "Mayfair",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10">
        <div className="flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.3em] text-[#6B7280]">Testimonials</p>
          <h2 className="text-3xl font-semibold text-[#111827] sm:text-4xl">
            What Our Clients Say
          </h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-6 shadow-sm"
            >
              <div className="flex gap-1 text-[#0D9488]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#0D9488]" />
                ))}
              </div>
              <p className="mt-4 text-sm text-[#111827]">“{item.quote}”</p>
              <p className="mt-6 text-xs font-semibold text-[#111827]">
                {item.name}
                <span className="block text-[#6B7280]">{item.location}</span>
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
