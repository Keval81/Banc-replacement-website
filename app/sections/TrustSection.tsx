"use client";

import Image from "next/image";

// Partner portals (larger)
const partnerLogos = [
  { name: "Rightmove", logo: "/partners/rightmove.png", size: 708 }, // 50% larger again
  { name: "Zoopla", logo: "/zoopla_logo-01.jpg", size: 315 },
];

// Professional bodies (smaller, clustered)
const professionalLogos = [
  { name: "The Guild", logo: "/TheGuild_Logo_RGB.jpg", size: 100 },
  { name: "Propertymark", logo: "/propertymark.jpg", size: 55 },
  { name: "TDS", logo: "/9_long_member_rgb.png", size: 55 },
];

export default function TrustSection() {
  return (
    <section className="bg-white border-t border-b border-banc-grey/20">
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-4">
        {/* All logos in one tight row */}
        <div className="flex items-center justify-center gap-4 md:gap-8">
          {/* Partner Portals */}
          {partnerLogos.map((logo) => (
            <div
              key={logo.name}
              className="relative flex items-center justify-center transition-opacity duration-300 hover:opacity-70"
              style={{ height: `${logo.size}px` }}
            >
              <Image
                src={logo.logo}
                alt={logo.name}
                width={logo.size * 2.5}
                height={logo.size}
                className="h-auto w-auto object-contain"
                style={{ maxHeight: `${logo.size}px` }}
              />
            </div>
          ))}
          
          {/* Professional Bodies - inline with partners */}
          {professionalLogos.map((logo) => (
            <div
              key={logo.name}
              className="relative flex items-center justify-center transition-opacity duration-300 hover:opacity-70"
              style={{ height: `${logo.size}px` }}
            >
              <Image
                src={logo.logo}
                alt={logo.name}
                width={logo.size * 2.5}
                height={logo.size}
                className="h-auto w-auto object-contain"
                style={{ maxHeight: `${logo.size}px` }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
