import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Crown, Award, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Banc Premier Homes | Banc Property Services",
  description: "Exclusive service for properties valued at £1 million and above. Discreet marketing, qualified buyers, and exceptional results.",
};

export default function PremierHomesPage() {
  return (
    <div className="bg-white text-[#2C2A27]">
      <Header />
      
      {/* Hero */}
      <section className="relative bg-[#1A1917] py-24 lg:py-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/hertfordshire-home-4.png"
            alt="Luxury Premier Home"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1917]/80 via-[#1A1917]/30 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#4AC8E8]/20 px-4 py-2 text-[#4AC8E8] mb-6">
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
              <Button className="bg-[#4AC8E8] hover:bg-[#1A9BBF] text-white px-8 py-6 text-base">
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
            <p className="text-sm uppercase tracking-[0.3em] text-[#4AC8E8]">The Premier Difference</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Service Beyond Expectations</h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-[#E0DFDC] p-8 text-center">
              <Crown className="h-12 w-12 text-[#4AC8E8] mx-auto" />
              <h3 className="mt-4 text-xl font-semibold">Discreet Marketing</h3>
              <p className="mt-2 text-[#8A8880]">
                Off-market opportunities and private viewings for sensitive sales.
              </p>
            </div>
            <div className="rounded-2xl border border-[#E0DFDC] p-8 text-center">
              <Award className="h-12 w-12 text-[#4AC8E8] mx-auto" />
              <h3 className="mt-4 text-xl font-semibold">Qualified Buyers</h3>
              <p className="mt-2 text-[#8A8880]">
                Access to our network of pre-qualified, serious buyers.
              </p>
            </div>
            <div className="rounded-2xl border border-[#E0DFDC] p-8 text-center">
              <TrendingUp className="h-12 w-12 text-[#4AC8E8] mx-auto" />
              <h3 className="mt-4 text-xl font-semibold">Premium Marketing</h3>
              <p className="mt-2 text-[#8A8880]">
                Professional photography, video tours, and luxury publications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Criteria */}
      <section className="bg-[#F4F3F1] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#4AC8E8]">Eligibility</p>
              <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Is Your Property Suitable?</h2>
              <p className="mt-4 text-[#8A8880]">
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
                    <span className="mr-2 text-[#4AC8E8]">✓</span>
                    <span className="text-[#8A8880]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#1A1917] rounded-2xl p-8 text-white">
              <h3 className="text-xl font-semibold">Request a Premier Valuation</h3>
              <p className="mt-2 text-white/70">
                Speak to our Premier Homes specialist for a confidential valuation.
              </p>
              <Button className="mt-6 bg-[#4AC8E8] hover:bg-[#1A9BBF] text-white w-full">
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
