import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Crown, Award, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Banc Premier Homes | Banc Property Services",
  description: "Exclusive service for properties valued at £1 million and above. Discreet marketing, qualified buyers, and exceptional results.",
};

export default function PremierHomesPage() {
  return (
    <div className="bg-white text-[#111827]">
      <Header />
      
      {/* Hero */}
      <section className="relative bg-[#2C2F33] py-24 lg:py-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/hertfordshire-home-4.png"
            alt="Luxury Premier Home"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2C2F33]/80 via-[#2C2F33]/30 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#1DBFDD]/20 px-4 py-2 text-[#1DBFDD] mb-6">
              <Crown className="h-5 w-5" />
              <span className="text-sm font-medium">Premium Service</span>
            </div>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
              Banc Premier Homes
            </h1>
            <p className="mt-6 text-lg text-white/70">
              An exclusive service for exceptional properties valued at £1 million and above. 
              Discreet marketing, qualified buyers, and exceptional results.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button className="bg-[#1DBFDD] hover:bg-[#0E8CAB] text-white px-8 py-6 text-base">
                Premier Valuation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-base">
                View Premier Properties
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">The Premier Difference</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Service Beyond Expectations</h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-[#E5E7EB] p-8 text-center">
              <Crown className="h-12 w-12 text-[#1DBFDD] mx-auto" />
              <h3 className="mt-4 text-xl font-semibold">Discreet Marketing</h3>
              <p className="mt-2 text-[#6B7280]">
                Off-market opportunities and private viewings for sensitive sales.
              </p>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] p-8 text-center">
              <Award className="h-12 w-12 text-[#1DBFDD] mx-auto" />
              <h3 className="mt-4 text-xl font-semibold">Qualified Buyers</h3>
              <p className="mt-2 text-[#6B7280]">
                Access to our network of pre-qualified, serious buyers.
              </p>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] p-8 text-center">
              <TrendingUp className="h-12 w-12 text-[#1DBFDD] mx-auto" />
              <h3 className="mt-4 text-xl font-semibold">Premium Marketing</h3>
              <p className="mt-2 text-[#6B7280]">
                Professional photography, video tours, and luxury publications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Criteria */}
      <section className="bg-[#F9FAFB] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">Eligibility</p>
              <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Is Your Property Suitable?</h2>
              <p className="mt-4 text-[#6B7280]">
                Banc Premier Homes is designed for exceptional properties that demand 
                a bespoke approach. We typically work with:
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Properties valued at £1 million or above",
                  "Unique or architecturally significant homes",
                  "Prime location properties",
                  "Homes with exceptional grounds or features",
                  "Equestrian properties and estates"
                ].map((item) => (
                  <li key={item} className="flex items-start">
                    <span className="mr-2 text-[#1DBFDD]">✓</span>
                    <span className="text-[#6B7280]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#2C2F33] rounded-2xl p-8 text-white">
              <h3 className="text-xl font-semibold">Request a Premier Valuation</h3>
              <p className="mt-2 text-white/70">
                Speak to our Premier Homes specialist for a confidential valuation.
              </p>
              <Button className="mt-6 bg-[#1DBFDD] hover:bg-[#0E8CAB] text-white w-full">
                Book Premier Valuation
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
