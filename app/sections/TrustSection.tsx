"use client";

import Image from "next/image";

const logos = [
  { name: "Rightmove", logo: "/partners/rightmove.png", big: true },
  { name: "Zoopla", logo: "/zoopla_logo-01.jpg", big: true },
  { name: "The Guild", logo: "/TheGuild_Logo_RGB.jpg", big: true },
  { name: "Propertymark", logo: "/propertymark.jpg", big: false },
  { name: "TDS", logo: "/9_long_member_rgb.png", big: false },
];

export default function TrustSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-10">
        <div className="flex flex-wrap items-center justify-center gap-16 md:gap-20">
          {logos.map((logo) => (
            <div
              key={logo.name}
              className={`relative flex items-center justify-center transition-opacity duration-300 hover:opacity-70 ${
                logo.big ? "h-[140px]" : "h-[70px]"
              }`}
            >
              <Image
                src={logo.logo}
                alt={logo.name}
                width={logo.big ? 400 : 180}
                height={logo.big ? 140 : 70}
                className={`w-auto object-contain ${
                  logo.big ? "h-[140px]" : "h-[70px]"
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
