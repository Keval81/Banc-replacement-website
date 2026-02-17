import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trees, HardHat, FileCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Land & New Homes | Banc Property Services",
  description: "Specialist land and new homes division. Development opportunities, land sales, and new build marketing across Cuffley, Mayfair and beyond.",
};

export default function LandNewHomesPage() {
  return (
    <div className="bg-white text-[#111827]">
      <Header />
      
      {/* Hero */}
      <section className="relative bg-[#2C2F33] py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD] mb-4">Development</p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
              Land & New Homes
            </h1>
            <p className="mt-6 text-lg text-white/70">
              Our specialist land and new homes division connects developers, 
              landowners, and buyers with exceptional opportunities.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button className="bg-[#1DBFDD] hover:bg-[#0E8CAB] text-white px-8 py-6 text-base">
                Discuss Your Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">Services</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">How We Can Help</h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-[#E5E7EB] p-8">
              <Trees className="h-12 w-12 text-[#1DBFDD]" />
              <h3 className="mt-4 text-xl font-semibold">Land Sales</h3>
              <p className="mt-2 text-[#6B7280]">
                Strategic marketing of development land and investment opportunities. 
                We connect landowners with qualified developers.
              </p>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] p-8">
              <HardHat className="h-12 w-12 text-[#1DBFDD]" />
              <h3 className="mt-4 text-xl font-semibold">New Build Marketing</h3>
              <p className="mt-2 text-[#6B7280]">
                Complete marketing solutions for new developments. From pre-launch 
                to final plot sales.
              </p>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] p-8">
              <FileCheck className="h-12 w-12 text-[#1DBFDD]" />
              <h3 className="mt-4 text-xl font-semibold">Development Advice</h3>
              <p className="mt-2 text-[#6B7280]">
                Expert guidance on planning, market positioning, and sales strategy 
                for development projects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Developers */}
      <section className="bg-[#F9FAFB] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">For Developers</p>
              <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Partner with Banc</h2>
              <p className="mt-4 text-[#6B7280]">
                Whether you are a small independent developer or a large housebuilder, 
                we offer tailored marketing solutions to maximise your sales.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Pre-launch marketing and lead generation",
                  "Show home staging and presentation",
                  "Part exchange and assisted move schemes",
                  "National marketing through The Guild network",
                  "Dedicated new homes sales team"
                ].map((item) => (
                  <li key={item} className="flex items-start">
                    <span className="mr-2 text-[#1DBFDD]">✓</span>
                    <span className="text-[#6B7280]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#2C2F33] rounded-2xl p-8 text-white">
              <h3 className="text-xl font-semibold">Register Your Interest</h3>
              <p className="mt-2 text-white/70">
                Are you looking for development land or new build opportunities? 
                Register your requirements with us.
              </p>
              <Button className="mt-6 bg-[#1DBFDD] hover:bg-[#0E8CAB] text-white w-full">
                Register Interest
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
