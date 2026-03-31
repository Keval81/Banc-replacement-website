import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ArrowRight,
  Building2,
  Crown,
  Navigation,
  Users,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Our Offices | Banc Property Group",
  description: "Visit our offices in Cuffley, Hertfordshire and Mayfair, London. Expert estate agents providing premium property services across Hertfordshire and Central London.",
  keywords: "banc property offices, estate agent cuffley, estate agent mayfair, property agents hertfordshire, london property agents",
};

const offices = [
  {
    id: "cuffley",
    name: "Cuffley Office",
    type: "Head Office",
    address: "1 Station Road, Cuffley, EN6 4HU",
    phone: "01707 877781",
    email: "info@bancproperty.com",
    hours: "Mon-Fri: 9am-6pm, Sat: 9am-4pm",
    description: "Our flagship office in the heart of Cuffley village, serving the local community and surrounding Hertfordshire areas.",
    features: ["Free Parking", "Near Station", "4 Team Members"],
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    link: "/offices/cuffley",
    icon: Building2
  },
  {
    id: "mayfair",
    name: "Mayfair Office",
    type: "Premier Homes",
    address: "Mayfair, London W1",
    phone: "01707 877781",
    email: "premier@bancproperty.com",
    hours: "Mon-Fri: 9am-6pm (By Appt)",
    description: "Specialising in prime central London properties, discreet marketing for high-value homes.",
    features: ["Prime Location", "Private Consultations", "Global Network"],
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
    link: "/offices/mayfair",
    icon: Crown
  }
];

export default function OfficesPage() {
  return (
    <div className="min-h-screen bg-[#F4F3F1]">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-[#1A1917] py-24 lg:py-32 overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1917]/80 via-[#1A1917]/60 to-[#1A1917]/40" />
        </div>
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#4AC8E8] rounded-full blur-[128px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4AC8E8] rounded-full blur-[128px]" />
        </div>
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <Building2 className="h-4 w-4 text-[#4AC8E8]" />
              <span className="text-sm font-medium text-white/80">Visit Us</span>
            </div>
            
            <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl tracking-tight">
              Our Offices
            </h1>
            <p className="mt-6 text-xl text-white/70 leading-relaxed">
              Visit us at one of our two locations. Whether you're in Hertfordshire or Central London, 
              our experienced team is ready to help with all your property needs.
            </p>
          </div>
        </div>
      </section>

      {/* Offices Grid */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-8">
            {offices.map((office) => (
              <div 
                key={office.id}
                className="group bg-white rounded-2xl overflow-hidden border border-[#E0DFDC]/30 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <Image 
                    src={office.image}
                    alt={office.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Type badge */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#4AC8E8] text-white text-xs font-semibold">
                      <office.icon className="h-3.5 w-3.5" />
                      {office.type}
                    </span>
                  </div>
                  
                  {/* Title overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-2xl font-semibold text-white">{office.name}</h2>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <p className="text-[#8A8880] mb-6">
                    {office.description}
                  </p>
                  
                  {/* Contact details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-[#4AC8E8] flex-shrink-0 mt-0.5" />
                      <span className="text-[#3D3B37]">{office.address}</span>
                    </div>
                    <a href={`tel:${office.phone.replace(/\s/g, '')}`} className="flex items-center gap-3 group/item">
                      <Phone className="h-5 w-5 text-[#4AC8E8] flex-shrink-0" />
                      <span className="text-[#3D3B37] group-hover/item:text-[#4AC8E8] transition-colors">{office.phone}</span>
                    </a>
                    <a href={`mailto:${office.email}`} className="flex items-center gap-3 group/item">
                      <Mail className="h-5 w-5 text-[#4AC8E8] flex-shrink-0" />
                      <span className="text-[#3D3B37] group-hover/item:text-[#4AC8E8] transition-colors">{office.email}</span>
                    </a>
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-[#4AC8E8] flex-shrink-0 mt-0.5" />
                      <span className="text-[#3D3B37]">{office.hours}</span>
                    </div>
                  </div>
                  
                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {office.features.map((feature) => (
                      <span 
                        key={feature}
                        className="px-3 py-1 rounded-full bg-[#4AC8E8]/10 text-[#1A9BBF] text-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  
                  {/* CTA */}
                  <Link href={office.link}>
                    <Button className="w-full bg-[#4AC8E8] hover:bg-[#1A9BBF] text-white group/btn">
                      Visit Office Page
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nearest Office Helper */}
      <section className="py-20 lg:py-28 bg-[#1A1917]">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <Navigation className="h-4 w-4 text-[#4AC8E8]" />
              <span className="text-sm font-medium text-white/80">Find Your Nearest Office</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-semibold text-white">
              Which Office is Right for You?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Cuffley areas */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#4AC8E8]/20 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-[#4AC8E8]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Cuffley Office</h3>
                  <p className="text-white/50">Hertfordshire & North London</p>
                </div>
              </div>
              
              <p className="text-white/60 mb-6">
                Visit our Cuffley office if you're looking to buy, sell, let, or rent 
                in the following areas:
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {["Cuffley", "Goffs Oak", "Brookmans Park", "Northaw", "Potters Bar", "Cheshunt", "Enfield", "Barnet", "Hertford"].map((area) => (
                  <span key={area} className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm">
                    {area}
                  </span>
                ))}
              </div>
              
              <Link href="/offices/cuffley">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Visit Cuffley Office
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            {/* Mayfair areas */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#4AC8E8]/20 flex items-center justify-center">
                  <Crown className="h-6 w-6 text-[#4AC8E8]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Mayfair Office</h3>
                  <p className="text-white/50">Prime Central London</p>
                </div>
              </div>
              
              <p className="text-white/60 mb-6">
                Contact our Mayfair office for premium properties valued at £1 million 
                and above in London's most prestigious areas:
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {["Mayfair", "Belgravia", "Knightsbridge", "Kensington", "Chelsea", "Marylebone", "St James's", "Westminster"].map((area) => (
                  <span key={area} className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm">
                    {area}
                  </span>
                ))}
              </div>
              
              <Link href="/offices/mayfair">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Visit Mayfair Office
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="bg-white rounded-3xl p-8 lg:p-12 border border-[#E0DFDC]/30 shadow-lg">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4AC8E8]/10 border border-[#4AC8E8]/20 mb-6">
                  <Phone className="h-4 w-4 text-[#4AC8E8]" />
                  <span className="text-sm font-medium text-[#1A9BBF]">Get in Touch</span>
                </div>
                
                <h2 className="text-3xl font-semibold text-[#1A1917]">
                  Can't Visit in Person?
                </h2>
                <p className="mt-4 text-lg text-[#8A8880]">
                  We're always available by phone or email. Our team is ready to answer 
                  your questions and help you with your property needs.
                </p>
                
                <div className="mt-8 flex flex-wrap gap-4">
                  <a href="tel:01707877781">
                    <Button className="bg-[#4AC8E8] hover:bg-[#1A9BBF] text-white px-6">
                      <Phone className="mr-2 h-4 w-4" />
                      01707 877781
                    </Button>
                  </a>
                  <Link href="/contact">
                    <Button variant="outline" className="border-[#4AC8E8] text-[#4AC8E8] hover:bg-[#4AC8E8] hover:text-white px-6">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Contact Form
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-[#F4F3F1] rounded-2xl p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#4AC8E8]/20 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-7 w-7 text-[#4AC8E8]" />
                  </div>
                  <p className="text-3xl font-bold text-[#1A1917]">4+</p>
                  <p className="text-sm text-[#8A8880]">Team Members</p>
                </div>
                <div className="bg-[#F4F3F1] rounded-2xl p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#4AC8E8]/20 flex items-center justify-center mx-auto mb-4">
                    <Building2 className="h-7 w-7 text-[#4AC8E8]" />
                  </div>
                  <p className="text-3xl font-bold text-[#1A1917]">2</p>
                  <p className="text-sm text-[#8A8880]">Office Locations</p>
                </div>
                <div className="bg-[#F4F3F1] rounded-2xl p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#4AC8E8]/20 flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-7 w-7 text-[#4AC8E8]" />
                  </div>
                  <p className="text-3xl font-bold text-[#1A1917]">6</p>
                  <p className="text-sm text-[#8A8880]">Days Per Week</p>
                </div>
                <div className="bg-[#F4F3F1] rounded-2xl p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#4AC8E8]/20 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-7 w-7 text-[#4AC8E8]" />
                  </div>
                  <p className="text-3xl font-bold text-[#1A1917]">20+</p>
                  <p className="text-sm text-[#8A8880]">Areas Covered</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
