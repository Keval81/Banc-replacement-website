"use client";

import Image from "next/image";

// Partner portals (larger)
const partnerLogos = [
  { name: "Rightmove", logo: "/partners/rightmove.png", size: 472 }, // 50% larger
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
    <section className="bg-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">
        {/* Partner Portals */}
        <div className="flex flex-wrap items-center justify-center">
          {partnerLogos.map((logo, index) => (
            <div
              key={logo.name}
              className="relative flex items-center justify-center transition-opacity duration-300 hover:opacity-70 mx-3 md:mx-6"
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

        {/* Professional Bodies - tightly clustered */}
        <div className="mt-4 flex items-center justify-center">
          {professionalLogos.map((logo) => (
            <div
              key={logo.name}
              className="relative flex items-center justify-center mx-1 md:mx-2 transition-opacity duration-300 hover:opacity-70"
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
