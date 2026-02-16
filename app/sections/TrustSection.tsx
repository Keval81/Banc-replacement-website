"use client";

import Image from "next/image";

const partners = [
  { name: "Rightmove", logo: "/partners/rightmove.png", width: 140, height: 40 },
  { name: "Zoopla", logo: "/zoopla_logo-01.jpg", width: 120, height: 40 },
  { name: "The Guild", logo: "/TheGuild_Logo_RGB.jpg", width: 100, height: 50 },
];

const accreditations = [
  { name: "Propertymark", logo: "/propertymark.jpg", width: 100, height: 50 },
  { name: "TPO", logo: "/tpo-tsi.jpg", width: 80, height: 50 },
  { name: "TDS", logo: "/9_long_member_rgb.png", width: 80, height: 50 },
  { name: "ZPG", logo: "/ZPG_Adblock_200x85-01.jpg", width: 100, height: 40 },
];

export default function TrustSection() {
  return (
    <section className="bg-[#0A6B82]">
      {/* Partners Row */}
      <div className="border-b border-white/10">
        <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">
          <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-[#4DD4F0]">
            Trusted Partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="relative flex items-center justify-center grayscale transition-all duration-300 hover:grayscale-0"
              >
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={partner.width}
                  height={partner.height}
                  className="h-auto max-h-[40px] w-auto object-contain brightness-0 invert opacity-80 hover:opacity-100"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accreditations Row */}
      <div className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
        <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-[#4DD4F0]">
          Professional Accreditations
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {accreditations.map((acc) => (
            <div
              key={acc.name}
              className="relative flex items-center justify-center grayscale transition-all duration-300 hover:grayscale-0"
            >
              <Image
                src={acc.logo}
                alt={acc.name}
                width={acc.width}
                height={acc.height}
                className="h-auto max-h-[45px] w-auto object-contain brightness-0 invert opacity-80 hover:opacity-100"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
