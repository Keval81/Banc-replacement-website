"use client";

import Image from "next/image";

const partners = [
  { name: "Rightmove", logo: "/partners/rightmove.png" },
  { name: "Zoopla", logo: "/zoopla_logo-01.jpg" },
  { name: "The Guild", logo: "/TheGuild_Logo_RGB.jpg" },
];

const accreditations = [
  { name: "Propertymark", logo: "/propertymark.jpg" },
  { name: "TDS", logo: "/9_long_member_rgb.png" },
];

export default function TrustSection() {
  return (
    <section className="bg-white">
      {/* Partners Row */}
      <div className="border-b border-[#1DBFDD]/20">
        <div className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-10">
          <p className="mb-10 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#0A6B82]">
            Trusted Partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="relative flex h-[80px] items-center justify-center transition-opacity duration-300 hover:opacity-70"
              >
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={220}
                  height={80}
                  className="h-[70px] w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accreditations Row */}
      <div className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-10">
        <p className="mb-10 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#0A6B82]">
          Professional Accreditations
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
          {accreditations.map((acc) => (
            <div
              key={acc.name}
              className="relative flex h-[70px] items-center justify-center transition-opacity duration-300 hover:opacity-70"
            >
              <Image
                src={acc.logo}
                alt={acc.name}
                width={180}
                height={70}
                className="h-[60px] w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
