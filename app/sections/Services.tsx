"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { AmbientVideo } from "@/components/AmbientVideo";
import { SectionHeader } from "@/components/SectionHeader";
import { getServiceFilm } from "@/lib/owned-film";

const services = [
  {
    number: "1.1",
    title: "Residential Sales",
    description:
      "Accurate valuations, premium marketing, and one team from instruction to completion.",
    image:
      "https://images.unsplash.com/photo-1694556586916-7b5912ba8e62?auto=format&fit=crop&w=1200&q=80",
    href: "/sales",
  },
  {
    number: "1.2",
    title: "Lettings",
    description:
      "Quality tenants found fast, with full management and transparent reporting.",
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    href: "/lettings",
  },
  {
    number: "1.3",
    title: "Premier Homes",
    description:
      "Discreet, bespoke service for exceptional properties valued at £1 million and above.",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    href: "/premier-homes",
    premier: true,
  },
  {
    number: "1.4",
    title: "Property Management",
    description:
      "Trusted suppliers, transparent reporting, and peace of mind for landlords.",
    image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
    href: "/lettings/landlords-guide",
  },
];

export default function Services() {
  return (
    <section id="services" className="bg-banc-dark-deep py-20 lg:py-28">
      <div className="mx-auto w-full max-w-[1400px] px-5 lg:px-10">
        <SectionHeader number="03" label="What we do" title="Four ways we work" dark />

        <div className="mt-14 grid gap-x-8 gap-y-14 md:grid-cols-2">
          {services.map((service, index) => {
            const film = getServiceFilm(service.href);
            return (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.08 }}
            >
              <Link href={service.href} className="group block">
                <div className="relative h-64 overflow-hidden rounded-[10px] sm:h-80">
                  {/* Banc's own footage where it exists; Property Management keeps
                      its still until the wider stock sweep replaces it. */}
                  {film ? (
                    <AmbientVideo
                      film={film}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  )}
                </div>
                <div className="mt-5 flex items-baseline gap-4 border-t border-white/15 pt-4">
                  <span className="font-mono text-[11px] tracking-[0.14em] text-white/50">
                    {service.number}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-2xl font-light text-white">
                      {service.title}
                      {service.premier && (
                        <span className="ml-3 align-middle text-[10px] uppercase tracking-[0.18em] text-banc-gold">
                          Premier
                        </span>
                      )}
                    </h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-white/60">
                      {service.description}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-2 text-sm text-white transition-colors group-hover:text-banc-sky">
                      Learn more <span aria-hidden>&rarr;</span>
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
