import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Users, Globe } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "The Guild of Property Professionals | Banc Property Services",
  description: "Banc Property Group is a proud member of The Guild of Property Professionals, giving our clients national reach with local expertise.",
};

export default function TheGuildPage() {
  return (
    <div className="bg-white text-[#111827]">
      <Header />
      
      {/* Hero */}
      <section className="relative bg-[#2C2F33] py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD] mb-4">Membership</p>
              <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
                The Guild of Property Professionals
              </h1>
              <p className="mt-6 text-lg text-white/70">
                As proud members of The Guild, we combine local expertise with 
                national reach, giving our clients the best of both worlds.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="relative w-64 h-64 bg-white rounded-2xl flex items-center justify-center p-8">
                <Image
                  src="/TheGuild_Logo_RGB.jpg"
                  alt="The Guild of Property Professionals"
                  fill
                  className="object-contain p-8"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">Benefits</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">What This Means for You</h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-[#E5E7EB] p-8 text-center">
              <Globe className="h-12 w-12 text-[#1DBFDD] mx-auto" />
              <h3 className="mt-4 text-xl font-semibold">National Reach</h3>
              <p className="mt-2 text-[#6B7280]">
                Access to a network of over 800 independent estate agents across the UK.
              </p>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] p-8 text-center">
              <Shield className="h-12 w-12 text-[#1DBFDD] mx-auto" />
              <h3 className="mt-4 text-xl font-semibold">Quality Assured</h3>
              <p className="mt-2 text-[#6B7280]">
                Rigorous standards ensure you receive exceptional service every time.
              </p>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] p-8 text-center">
              <Users className="h-12 w-12 text-[#1DBFDD] mx-auto" />
              <h3 className="mt-4 text-xl font-semibold">Referral Network</h3>
              <p className="mt-2 text-[#6B7280]">
                Moving out of area? We can connect you with trusted agents nationwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About The Guild */}
      <section className="bg-[#F9FAFB] py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-10 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">About The Guild</p>
          <h2 className="mt-4 text-3xl font-semibold">A Network of Excellence</h2>
          <p className="mt-6 text-[#6B7280] leading-relaxed">
            The Guild of Property Professionals is a network of the UK's finest independent 
            estate agents. Members are carefully selected based on their commitment to 
            exceptional service, local expertise, and professional standards.
          </p>
          <p className="mt-4 text-[#6B7280] leading-relaxed">
            As a Guild member, Banc Property Group benefits from national marketing 
            campaigns, shared resources, and a referral network that extends our reach 
            across the entire UK property market.
          </p>
          <Button className="mt-8 bg-[#1DBFDD] hover:bg-[#0E8CAB] text-white px-8 py-6 text-base">
            Contact Us
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
