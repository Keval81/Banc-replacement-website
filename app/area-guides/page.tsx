import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Area Guides | Banc Property Services",
  description: "Explore our comprehensive area guides for Cuffley, Potters Bar, Cheshunt, Northaw, Brookmans Park, Goffs Oak, Newgate Street Village, Enfield, and Essendon. Discover the best of Hertfordshire and Essex living.",
};

// Premium area data with high-quality Unsplash images capturing countryside/suburban charm
const areas = [
  {
    name: "Cuffley",
    slug: "cuffley",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85",
    description: "Picturesque village living",
  },
  {
    name: "Potters Bar",
    slug: "potters-bar",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=85",
    description: "Commuter haven with charm",
  },
  {
    name: "Cheshunt",
    slug: "cheshunt",
    image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1200&q=85",
    description: "Riverside community",
  },
  {
    name: "Northaw",
    slug: "northaw",
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&q=85",
    description: "Rural retreat",
  },
  {
    name: "Brookmans Park",
    slug: "brookmans-park",
    image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=1200&q=85",
    description: "Affluent suburban elegance",
  },
  {
    name: "Goffs Oak",
    slug: "goffs-oak",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=85",
    description: "Village community spirit",
  },
  {
    name: "Newgate Street Village",
    slug: "newgate-street-village",
    image: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=1200&q=85",
    description: "Historic rural setting",
  },
  {
    name: "Enfield",
    slug: "enfield",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=85",
    description: "Urban convenience meets green space",
  },
  {
    name: "Essendon",
    slug: "essendon",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=85",
    description: "Countryside tranquillity",
  },
];

export default function AreaGuidesPage() {
  return (
    <div className="min-h-screen bg-[var(--off-white)]">
      <Header />
      
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden bg-[var(--charcoal)]">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1917]/80 via-[#1A1917]/60 to-[#1A1917]/40" />
        </div>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Cyan Accent Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--primary-cyan)] opacity-5 blur-[150px] rounded-full" />
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="h-px w-8 bg-[var(--primary-cyan)]" />
              <span className="text-sm font-medium tracking-widest uppercase text-[var(--primary-cyan)]">
                Locations
              </span>
              <div className="h-px w-8 bg-[var(--primary-cyan)]" />
            </div>
            
            {/* Main Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]">
              Area Guides
            </h1>
            
            {/* Subtitle */}
            <p className="mt-6 text-xl sm:text-2xl text-white/70 font-light tracking-wide">
              Where We Operate
            </p>
            
            {/* Decorative Line */}
            <div className="mt-8 flex justify-center">
              <div className="h-1 w-24 bg-gradient-to-r from-transparent via-[var(--primary-cyan)] to-transparent" />
            </div>
            
            {/* Description */}
            <p className="mt-8 text-base sm:text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
              Discover the unique character of Hertfordshire and Essex through our comprehensive area guides. 
              From charming villages to thriving commuter towns, find your perfect location.
            </p>
          </div>
        </div>
        
        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--off-white)] to-transparent" />
      </section>

      {/* Areas Grid Section */}
      <section className="relative py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {/* Grid Container */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {areas.map((area, index) => (
              <Link
                key={area.slug}
                href={`/area-guides/${area.slug}`}
                className="group relative block aspect-[4/3] overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Image with Premium Scale Effect */}
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={area.image}
                    alt={`${area.name} - Area Guide`}
                    className="h-full w-full object-cover transform scale-100 transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                </div>
                
                {/* Dark Gradient Overlay - Enhanced */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                
                {/* Cyan Accent Line - Animated */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--light-cyan)] transform origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100" />
                
                {/* Top Corner Accent */}
                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-white/20 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0" />
                
                {/* Content Container */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                  {/* Subtle Tag */}
                  <span className="inline-block text-xs font-medium tracking-wider uppercase text-[var(--light-cyan)] mb-2 opacity-0 transform -translate-y-2 transition-all duration-500 delay-75 group-hover:opacity-100 group-hover:translate-y-0">
                    {area.description}
                  </span>
                  
                  {/* Area Name */}
                  <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight leading-tight">
                    {area.name}
                  </h2>
                  
                  {/* View Guide CTA - Appears on Hover */}
                  <div className="mt-3 flex items-center gap-2 opacity-0 transform translate-y-4 transition-all duration-500 delay-100 group-hover:opacity-100 group-hover:translate-y-0">
                    <span className="text-sm font-medium text-white/90">
                      View Area Guide
                    </span>
                    <svg 
                      className="w-4 h-4 text-[var(--primary-cyan)] transform transition-transform duration-300 group-hover:translate-x-1" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary-cyan)]/10 to-transparent" />
                </div>
              </Link>
            ))}
          </div>
          
          {/* Bottom CTA Section */}
          <div className="mt-20 text-center">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl lg:text-3xl font-bold text-[var(--charcoal)] mb-4">
                Can't find what you're looking for?
              </h3>
              <p className="text-[var(--mid-grey)] mb-8 leading-relaxed">
                We cover many more areas across Hertfordshire and Essex. 
                Get in touch to discuss your specific location requirements.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--primary-cyan)] text-white font-semibold rounded-lg hover:bg-[var(--dark-cyan)] transition-colors duration-300 shadow-lg hover:shadow-xl"
              >
                <span>Contact Us</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
