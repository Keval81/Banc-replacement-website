"use client";

import Image from "next/image";

interface SoldProperty {
  address: string;
  location: string;
  price: string;
  daysOnMarket: number;
  image: string;
}

const soldProperties: SoldProperty[] = [
  { address: "12 Station Road", location: "Cuffley", price: "£850,000", daysOnMarket: 14, image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80" },
  { address: "24 The Avenue", location: "Potters Bar", price: "£720,000", daysOnMarket: 9, image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80" },
  { address: "5 Brookmans Avenue", location: "Brookmans Park", price: "£985,000", daysOnMarket: 11, image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80" },
  { address: "18 Bulls Lane", location: "Welham Green", price: "£575,000", daysOnMarket: 18, image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80" },
  { address: "7 Cuffley Hill", location: "Cuffley", price: "£445,000", daysOnMarket: 16, image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80" },
  { address: "3 Warrengate Road", location: "North Mymms", price: "£1,250,000", daysOnMarket: 8, image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80" },
];

function SoldCard({ property }: { property: SoldProperty }) {
  return (
    <div className="flex items-center gap-4 rounded-[10px] bg-white p-3 shadow-sm border border-banc-grey/10 w-[320px] flex-shrink-0 mx-3">
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
        <Image
          src={property.image}
          alt={property.address}
          fill
          sizes="64px"
          className="object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-banc-sky/80">
          <span className="text-[9px] font-bold text-white tracking-wider">SOLD</span>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-banc-dark truncate">{property.address}</p>
        <p className="text-xs text-banc-grey">{property.location}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-sm font-bold text-banc-sky">{property.price}</span>
          <span className="text-[10px] text-banc-grey">{property.daysOnMarket} days</span>
        </div>
      </div>
    </div>
  );
}

export default function SoldBanner() {
  const doubled = [...soldProperties, ...soldProperties];

  return (
    <section className="bg-banc-grey-pale py-10 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-banc-grey mb-2">Track Record</p>
        <h2 className="text-2xl font-medium text-banc-dark sm:text-3xl font-serif">
          Recently Sold
        </h2>
      </div>

      {/* Marquee */}
      <div
        className="relative [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
      >
        <div className="flex animate-marquee hover:[animation-play-state:paused]">
          {doubled.map((property, i) => (
            <SoldCard key={`${property.address}-${i}`} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
