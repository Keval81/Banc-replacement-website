import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, TrendingUp, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "Become a Partner | Banc Property Services",
  description: "Join Banc Property Group as a partner agent. Expand your network, share referrals, and grow your business with our established brand.",
};

export default function BecomePartnerPage() {
  return (
    <div className="bg-white text-[#111827]">
      <Header />
      
      {/* Hero */}
      <section className="relative bg-[#2C2F33] py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD] mb-4">Opportunity</p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
              Become a Partner
            </h1>
            <p className="mt-6 text-lg text-white/70">
              Join our network of partner agents and expand your reach. Benefit from 
              referrals, shared resources, and the strength of the Banc brand.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button className="bg-[#1DBFDD] hover:bg-[#0E8CAB] text-white px-8 py-6 text-base">
                Apply Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">Benefits</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Why Partner with Banc?</h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-[#E5E7EB] p-8 text-center">
              <TrendingUp className="h-12 w-12 text-[#1DBFDD] mx-auto" />
              <h3 className="mt-4 text-xl font-semibold">Referral Network</h3>
              <p className="mt-2 text-[#6B7280]">
                Receive qualified referrals from our Cuffley and Mayfair offices 
                for clients moving to your area.
              </p>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] p-8 text-center">
              <Award className="h-12 w-12 text-[#1DBFDD] mx-auto" />
              <h3 className="mt-4 text-xl font-semibold">Guild Membership</h3>
              <p className="mt-2 text-[#6B7280]">
                Access to The Guild of Property Professionals network, with over 
                800 member agents nationwide.
              </p>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] p-8 text-center">
              <Briefcase className="h-12 w-12 text-[#1DBFDD] mx-auto" />
              <h3 className="mt-4 text-xl font-semibold">Shared Resources</h3>
              <p className="mt-2 text-[#6B7280]">
                Benefit from our marketing expertise, technology platforms, and 
                established brand reputation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who We're Looking For */}
      <section className="bg-[#F9FAFB] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">Partnership</p>
              <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Who We Are Looking For</h2>
              <p className="mt-4 text-[#6B7280]">
                We are seeking established independent estate agents who share our 
                commitment to exceptional service and professional standards.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Independent estate agents with local expertise",
                  "Commitment to exceptional customer service",
                  "Professional standards and compliance",
                  "Active in complementary geographic areas",
                  "Desire to grow through referral partnerships"
                ].map((item) => (
                  <li key={item} className="flex items-start">
                    <span className="mr-2 text-[#1DBFDD]">✓</span>
                    <span className="text-[#6B7280]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#2C2F33] rounded-2xl p-8 text-white">
              <h3 className="text-xl font-semibold">Apply to Partner</h3>
              <p className="mt-2 text-white/70">
                Ready to expand your business? Complete our partner application 
                and we will be in touch within 48 hours.
              </p>
              <Button className="mt-6 bg-[#1DBFDD] hover:bg-[#0E8CAB] text-white w-full">
                Start Application
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
