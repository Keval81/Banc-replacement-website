"use client";

import { motion } from "framer-motion";
import { Home, Key, Crown, Wrench } from "lucide-react";

const services = [
  {
    title: "Sales",
    description: "Premium marketing, accurate valuations, and a seamless sales journey.",
    icon: Home,
    accent: "#4AC8E8",
  },
  {
    title: "Lettings",
    description: "Find quality tenants fast with concierge-level landlord support.",
    icon: Key,
    accent: "#4AC8E8",
  },
  {
    title: "Premier Homes",
    description: "Discreet, bespoke service for exceptional homes and estates.",
    icon: Crown,
    accent: "#D4AF37",
  },
  {
    title: "Property Management",
    description: "Full-service management with trusted suppliers and clear reporting.",
    icon: Wrench,
    accent: "#4AC8E8",
  },
];

export default function Services() {
  return (
    <section id="services" className="bg-banc-grey-pale">
      <div className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10">
        <div className="flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.3em] text-banc-grey">Our Services</p>
          <h2 className="text-3xl font-semibold text-banc-dark sm:text-4xl">
            Bespoke property expertise
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className="rounded-2xl border border-banc-grey/20 bg-white p-6 shadow-sm"
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${service.accent}20` }}
                >
                  <Icon className="h-6 w-6" style={{ color: service.accent }} />
                </div>
                <h3
                  className={`text-lg font-semibold text-banc-dark ${
                    service.title === "Premier Homes" ? "font-serif" : ""
                  }`}
                >
                  {service.title}
                </h3>
                <p className="mt-2 text-sm text-banc-grey">{service.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
