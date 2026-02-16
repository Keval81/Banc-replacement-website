"use client";

import Image from "next/image";

const logos = [
  { name: "Rightmove", logo: "/partners/rightmove.png", size: 210 },
  { name: "Zoopla", logo: "/zoopla_logo-01.jpg", size: 210 },
  { name: "The Guild", logo: "/TheGuild_Logo_RGB.jpg", size: 140 },
  { name: "Propertymark", logo: "/propertymark.jpg", size: 70 },
  { name: "TDS", logo: "/9_long_member_rgb.png", size: 70 },
];

export default function TrustSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-10">
        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
          {logos.map((logo) => (
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
