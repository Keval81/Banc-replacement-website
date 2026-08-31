import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { BUYERS_GUIDE } from "@/lib/banc-content/buyers-guide";

export const metadata: Metadata = {
  title: "Buyers Guide | Banc Property Group",
  description: "We love what we do. We have a passion for matching buyers with the very best homes in the areas we cover. Our local knowledge will help you source the right home for your needs.",
};

const guideSteps = BUYERS_GUIDE.sections.slice(0, 6);
const completion = BUYERS_GUIDE.sections[6];

export default function BuyersGuidePage() {
  return (
    <div className="bg-white text-[#2C2A27]">
      <Header />

      {/* Hero */}
      <section className="relative bg-[#1A1917] py-24 lg:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1917] via-[#1A1917]/95 to-transparent z-10" />
          <img
            src="https://images.unsplash.com/photo-1783934108429-284d1f160ae1?auto=format&fit=crop&w=2000&q=80"
            alt="Luxury home interior"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="relative z-20 mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-[#4AC8E8] mb-4">Guide</p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
              {BUYERS_GUIDE.title}
            </h1>
            <p className="mt-6 text-lg text-white/80 leading-relaxed">
              We love what we do. We have a passion for matching buyers with the very best homes in the areas we cover. 
              We listen to your requirements, to your budget and to your personal story to help identify properties that meet your needs.
            </p>
            <p className="mt-4 text-lg text-white/70">
              All our staff are local to the area so who better to lend a hand when looking for the best schools, 
              transport links and the best amenities! Our local knowledge will help you source the right home for your needs.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-[#F4F3F1]">
        <div className="mx-auto max-w-4xl px-6 lg:px-10 text-center">
          <p className="text-lg text-[#8A8880] leading-relaxed">
            Below is a brief guide to the buying process. Whether you&apos;re a first-time buyer or seasoned property investor,
            we&apos;re here to make your journey as smooth as possible.
          </p>
        </div>
      </section>

      {/* Guide Steps */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="space-y-20">
            {guideSteps.map((step, index) => {
              const isReversed = index % 2 === 1;
              return (
                <div key={step.title} className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
                  {/* Content Column */}
                  <div className={isReversed ? 'lg:order-2' : ''}>
                    {/* Step Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4AC8E8]/10 border border-[#4AC8E8]/20 mb-4">
                      <span className="text-xs font-semibold text-[#4AC8E8] uppercase tracking-wider">Step {index + 1} of 6</span>
                    </div>
                    
                    <h2 className="text-2xl lg:text-3xl font-semibold text-[#2C2A27] mb-4">{step.title}</h2>
                    <p className="text-[#8A8880] leading-relaxed mb-6">{step.body[0]}</p>
                    
                    {/* Top Tip Box - Consistent styling with Sellers Guide */}
                    <div className="bg-[#4AC8E8]/5 border-l-4 border-[#4AC8E8] p-5 rounded-r-xl">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#4AC8E8] flex items-center justify-center">
                          <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#4AC8E8] text-xs uppercase tracking-[0.2em] mb-1">Top Tip</p>
                          <p className="text-[#3D3B37] leading-relaxed">{step.body[1]}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Image Column */}
                  <div className={`relative ${isReversed ? 'lg:order-1' : ''}`}>
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl shadow-[#1A1917]/10">
                      <img 
                        src={[
                          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
                          "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80",
                          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
                          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
                          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
                          "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80"
                        ][index]} 
                        alt={step.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Decorative Frame */}
                    <div className={`absolute -bottom-3 -right-3 w-full h-full border-2 border-[#4AC8E8]/20 rounded-2xl -z-10 ${isReversed ? 'lg:-left-3 lg:right-auto' : ''}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Completion Section */}
      <section className="py-20 bg-[#F4F3F1]">
        <div className="mx-auto max-w-4xl px-6 lg:px-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#4AC8E8] flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-semibold text-[#2C2A27] mb-4">{completion.title}</h2>
          <p className="text-lg text-[#8A8880] leading-relaxed mb-6">
            {completion.body[0]}
          </p>
          <div className="bg-[#4AC8E8]/5 border-l-4 border-[#4AC8E8] p-4 rounded-r-lg inline-block text-left max-w-xl">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-[#4AC8E8] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#4AC8E8] text-sm uppercase tracking-wider mb-1">Top Tip</p>
                <p className="text-sm text-[#8A8880]">{completion.body[1]}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mortgage Advice */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="rounded-2xl bg-[#1A1917] p-8 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-2 items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-[#4AC8E8]">Finance</p>
                <h2 className="mt-4 text-3xl font-semibold text-white">Mortgage Advice</h2>
                <p className="mt-4 text-white/70 leading-relaxed">
                  We work with independent mortgage advisers who can help you find the best deal 
                  for your circumstances. Getting your finances in place early puts you in a 
                  stronger position when making an offer.
                </p>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center text-white/70">
                    <CheckCircle className="h-5 w-5 text-[#4AC8E8] mr-3 flex-shrink-0" />
                    <span>Independent whole-of-market advice</span>
                  </div>
                  <div className="flex items-center text-white/70">
                    <CheckCircle className="h-5 w-5 text-[#4AC8E8] mr-3 flex-shrink-0" />
                    <span>Agreement in principle within 24 hours</span>
                  </div>
                  <div className="flex items-center text-white/70">
                    <CheckCircle className="h-5 w-5 text-[#4AC8E8] mr-3 flex-shrink-0" />
                    <span>Access to exclusive rates</span>
                  </div>
                </div>
              </div>
              <div className="text-center lg:text-right">
                <Button className="bg-[#4AC8E8] hover:bg-[#1A9BBF] text-white px-8 py-6 text-base">
                  Speak to a Mortgage Adviser
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#4AC8E8] py-16">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-10">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Ready to start your property search?
          </h2>
          <p className="mt-4 text-lg text-white/90">
            Browse our portfolio of premium properties for sale.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/sales/properties">
              <Button className="bg-white text-[#4AC8E8] hover:bg-white/90 px-8 py-6 text-base font-semibold">
                View Properties
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-base font-semibold">
              Register with Us
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
