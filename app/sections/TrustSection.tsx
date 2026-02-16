"use client";

import Image from "next/image";

const allLogos = [
  { name: "Rightmove", logo: "/partners/rightmove.png" },
  { name: "Zoopla", logo: "/zoopla_logo-01.jpg" },
  { name: "The Guild", logo: "/TheGuild_Logo_RGB.jpg" },
  { name: "Propertymark", logo: "/propertymark.jpg" },
  { name: "TDS", logo: "/9_long_member_rgb.png" },
];

export default function TrustSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-10">
        <div className="flex flex-wrap items-center justify-center gap-16 md:gap-24">
          {allLogos.map((logo) => (
            <div
              key={logo.name}
              className="relative flex h-[140px] items-center justify-center transition-opacity duration-300 hover:opacity-70"
            >
              <Image
                src={logo.logo}
                alt={logo.name}
                width={400}
                height={140}
                className="h-[140px] w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
