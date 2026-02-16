"use client";

import Image from "next/image";

const partners = [
  { name: "Rightmove", logo: "/partners/rightmove.png", height: 50 },
  { name: "Zoopla", logo: "/zoopla_logo-01.jpg", height: 50 },
  { name: "The Guild", logo: "/TheGuild_Logo_RGB.jpg", height: 60 },
];

const accreditations = [
  { name: "Propertymark", logo: "/propertymark.jpg", height: 60 },
  { name: "TPO", logo: "/tpo-tsi.jpg", height: 70 },
  { name: "TDS", logo: "/9_long_member_rgb.png", height: 70 },
  { name: "ZPG", logo: "/ZPG_Adblock_200x85-01.jpg", height: 50 },
];

export default function TrustSection() {
  return (
    <section className="bg-[#F8FAFC]">
      {/* Partners Row */}
      <div className="border-b border-[#1DBFDD]/20">
        <div className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#0A6B82]">
            Trusted Partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="relative flex items-center justify-center transition-opacity duration-300 hover:opacity-80"
              >
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={200}
                  height={partner.height}
                  className="h-auto object-contain"
                  style={{ maxHeight: `${partner.height}px`, width: 'auto' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accreditations Row */}
      <div className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-10">
        <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#0A6B82]">
          Professional Accreditations
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {accreditations.map((acc) => (
            <div
              key={acc.name}
              className="relative flex items-center justify-center transition-opacity duration-300 hover:opacity-80"
            >
              <Image
                src={acc.logo}
                alt={acc.name}
                width={160}
                height={acc.height}
                className="h-auto object-contain"
                style={{ maxHeight: `${acc.height}px`, width: 'auto' }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
