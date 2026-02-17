import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Camera, Users, Award, TrendingUp, Shield, Home, Key, FileText } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Why Us | Banc Property Services",
  description: "Discover why Banc Property Group is the premium choice for selling, letting and managing properties in Cuffley, Mayfair and beyond.",
};

const services = [
  {
    icon: Home,
    title: "Property Sales",
    description: "Bespoke marketing strategies to achieve the best price for your property. From valuation to completion, we handle every detail.",
    link: "/sales"
  },
  {
    icon: Key,
    title: "Property Lettings",
    description: "Comprehensive letting services for landlords and tenants. Tenant finding, full management, and everything in between.",
    link: "/lettings"
  },
  {
    icon: Award,
    title: "Banc Premier Homes",
    description: "Exclusive service for properties valued at £1 million and above. Discreet marketing and qualified buyers.",
    link: "/premier-homes"
  },
  {
    icon: TrendingUp,
    title: "Property Management",
    description: "Full-service management with trusted suppliers, clear reporting, and peace of mind for landlords.",
    link: "/lettings"
  },
  {
    icon: Camera,
    title: "Professional Marketing",
    description: "Premium photography, video tours, drone footage, and targeted advertising across national portals.",
    link: "/sales"
  },
  {
    icon: Shield,
    title: "Compliance & Protection",
    description: "Full regulatory compliance, deposit protection, and client money protection for complete peace of mind.",
    link: "/contact"
  }
];

export default function WhyUsPage() {
  return (
    <div className="bg-white text-[#111827]">
      <Header />
      
      {/* Hero */}
      <section className="relative bg-[#2C2F33] py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD] mb-4">About Us</p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
              Why Choose Banc?
            </h1>
            <p className="mt-6 text-lg text-white/70">
              Born from a desire to provide a more tailored and bespoke service, 
              we take pride in listening to your needs and requirements, to deliver 
              a service which exceeds client expectations.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">Our Story</p>
              <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Welcome to Banc Property Group</h2>
              <div className="mt-6 space-y-4 text-[#6B7280]">
                <p>
                  At Banc Property Group, we offer a bespoke approach to selling and letting 
                  properties, combining local expertise and a powerful national network with 
                  unique property marketing campaigns, always providing outstanding customer care.
                </p>
                <p>
                  We believe our success is underpinned by four things – Our experience, 
                  with over 45 years of selling and renting homes in the local areas combined, 
                  our expertise from the two local owners, our intimate and extensive knowledge 
                  of Cuffley, Goffs Oak and surrounding Hertfordshire and North London areas 
                  and our service levels which have created relationships within the community 
                  for years to come.
                </p>
              </div>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80" 
                alt="Banc Property Group Office"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="bg-[#F9FAFB] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">Our Services</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">How We Can Help You</h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link key={service.title} href={service.link} className="group">
                <div className="h-full rounded-2xl border border-[#E5E7EB] bg-white p-8 transition-all hover:border-[#1DBFDD] hover:shadow-lg">
                  <service.icon className="h-12 w-12 text-[#1DBFDD]" />
                  <h3 className="mt-4 text-xl font-semibold">{service.title}</h3>
                  <p className="mt-2 text-[#6B7280]">{service.description}</p>
                  <span className="mt-4 inline-flex items-center text-[#1DBFDD] group-hover:underline">
                    Learn More <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Four Pillars */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">Our Foundation</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">The Four Pillars of Our Success</h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Experience", desc: "Over 45 years of combined experience selling and renting homes in the local area" },
              { title: "Expertise", desc: "Local owners with deep knowledge of the property market and community" },
              { title: "Knowledge", desc: "Intimate understanding of Cuffley, Goffs Oak and surrounding areas" },
              { title: "Service", desc: "Relationships built on trust that last for years to come" }
            ].map((pillar) => (
              <div key={pillar.title} className="text-center p-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#1DBFDD]/10 flex items-center justify-center">
                  <Award className="h-8 w-8 text-[#1DBFDD]" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{pillar.title}</h3>
                <p className="mt-2 text-sm text-[#6B7280]">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guild Network */}
      <section className="bg-[#2C2F33] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">National Reach</p>
              <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">The Guild of Property Professionals</h2>
              <p className="mt-4 text-white/70">
                As proud members of The Guild of Property Professionals, we combine local 
                expertise with national reach. Our membership gives you access to over 800 
                independent estate agents across the UK.
              </p>
              <Button className="mt-6 bg-[#1DBFDD] hover:bg-[#0E8CAB] text-white">
                Learn About The Guild
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="flex justify-center">
              <div className="relative w-64 h-32 bg-white rounded-xl flex items-center justify-center p-6">
                <span className="text-2xl font-bold text-[#1DBFDD]">The Guild</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1DBFDD] py-16">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-10">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Ready to experience the Banc difference?
          </h2>
          <p className="mt-4 text-lg text-white/90">
            Contact us today to discuss your property needs.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button className="bg-white text-[#1DBFDD] hover:bg-white/90 px-8 py-6 text-base">
              Contact Us
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-base">
              Request Valuation
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
