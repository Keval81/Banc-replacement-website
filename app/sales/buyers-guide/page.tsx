import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Monitor, MessageCircle, Calendar, FileText, CheckCircle, Key, Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Buyers Guide | Banc Property Group",
  description: "We love what we do. We have a passion for matching buyers with the very best homes in the areas we cover. Our local knowledge will help you source the right home for your needs.",
};

const guideSteps = [
  {
    icon: Monitor,
    title: "Our Website",
    description: "The first port of call is the Banc website, where every property is detailed with exceptional photos and floor plans, location and amenity maps. We make it our business and our pleasure to know the areas and properties intimately so we can extend our knowledge to you.",
    tip: "Speak with your financial adviser to determine an appropriate budget before starting your search. Having a mortgage 'agreement in principle' at this point is advantageous when you do actually make an offer. Speak with us and we can point you in the right direction."
  },
  {
    icon: MessageCircle,
    title: "Let's Talk",
    description: "Give us a call or pop into our prominently positioned office on the high street for a coffee and a chat. We will be able to answer all of your questions about property types and styles in the area, buying costs and we can recommend local financial and conveyancing services, and more importantly arrange viewings for you. We can also discuss our 'discrete marketed' properties which are not available online, but exclusively to our registered clients.",
    tip: "Make sure you are aware of all relevant costs such as mortgage fees, survey fees, conveyancing, stamp duty charges and removals. Let us know if you need a refresher on any of them."
  },
  {
    icon: Calendar,
    title: "Arranging Views",
    description: "Once you have identified some potential properties, we will take you to view them. We do offer a pickup service from the station if you are popping out to view after work. Let us guide you round the beautiful houses and local area.",
    tip: "It's easy to let your heart rule your head so be prepared with a checklist and questions before you visit the properties."
  },
  {
    icon: FileText,
    title: "Make An Offer",
    description: "Seen a property you like? Make an offer! All offers from qualified buyers will be presented to the seller without delay. We do our very best to get a price that satisfies both you and the vendor.",
    tip: "It can be hard when deciding how much to offer, but always make sure the offer you are making is viable, and that you are able to support it."
  },
  {
    icon: CheckCircle,
    title: "Offer Agreed",
    description: "Congratulations! It's almost time to bring out the champagne, but not quite yet. Communication is the key to a successful purchase. We stay in touch with you, the sellers, solicitors, surveyors and mortgage advisers to ensure your purchase proceeds as quickly as possible. Don't worry – we are there the whole way through to guide you and assist in all aspects of the process.",
    tip: "When an offer is agreed you will need to instruct your solicitor and mortgage lender in order to progress your case."
  },
  {
    icon: Key,
    title: "Exchange",
    description: "This is when signed contracts are exchanged between your solicitor and the seller's solicitor. This is also the point when your deposit, normally 10%, is transferred to the seller's solicitor and a moving day is set. At this point, the transaction becomes legally binding.",
    tip: "Make sure you take this time to confirm removals, redirect post, call the cable man and organise utilities."
  }
];

export default function BuyersGuidePage() {
  return (
    <div className="bg-white text-[#111827]">
      <Header />
      
      {/* Hero */}
      <section className="relative bg-[#2C2F33] py-24 lg:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#2C2F33] via-[#2C2F33]/95 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80" 
            alt="Luxury home interior"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="relative z-20 mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD] mb-4">Guide</p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
              Buyers Guide
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
      <section className="py-16 bg-[#F9FAFB]">
        <div className="mx-auto max-w-4xl px-6 lg:px-10 text-center">
          <p className="text-lg text-[#6B7280] leading-relaxed">
            Below is a brief guide to the buying process. Whether you're a first-time buyer or seasoned property investor, 
            we're here to make your journey as smooth as possible.
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
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1DBFDD]/10 border border-[#1DBFDD]/20 mb-4">
                      <span className="text-xs font-semibold text-[#1DBFDD] uppercase tracking-wider">Step {index + 1} of 6</span>
                    </div>
                    
                    <h2 className="text-2xl lg:text-3xl font-semibold text-[#111827] mb-4">{step.title}</h2>
                    <p className="text-[#6B7280] leading-relaxed mb-6">{step.description}</p>
                    
                    {/* Top Tip Box - Consistent styling with Sellers Guide */}
                    <div className="bg-[#1DBFDD]/5 border-l-4 border-[#1DBFDD] p-5 rounded-r-xl">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1DBFDD] flex items-center justify-center">
                          <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#1DBFDD] text-xs uppercase tracking-[0.2em] mb-1">Top Tip</p>
                          <p className="text-[#374151] leading-relaxed">{step.tip}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Image Column */}
                  <div className={`relative ${isReversed ? 'lg:order-1' : ''}`}>
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl shadow-[#2C2F33]/10">
                      <img 
                        src={[
                          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
                          "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80",
                          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
                          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80",
                          "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80",
                          "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=80"
                        ][index]} 
                        alt={step.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Decorative Frame */}
                    <div className={`absolute -bottom-3 -right-3 w-full h-full border-2 border-[#1DBFDD]/20 rounded-2xl -z-10 ${isReversed ? 'lg:-left-3 lg:right-auto' : ''}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Completion Section */}
      <section className="py-20 bg-[#F9FAFB]">
        <div className="mx-auto max-w-4xl px-6 lg:px-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#1DBFDD] flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-semibold text-[#111827] mb-4">Completion</h2>
          <p className="text-lg text-[#6B7280] leading-relaxed mb-6">
            Now the bubbly can be taken off ice and enjoyed on moving day in your new home. 
            To make it easier for you, we aim to be there at your new home with the keys instead of you having to detour to our office to collect them.
          </p>
          <div className="bg-[#1DBFDD]/5 border-l-4 border-[#1DBFDD] p-4 rounded-r-lg inline-block text-left max-w-xl">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-[#1DBFDD] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#1DBFDD] text-sm uppercase tracking-wider mb-1">Top Tip</p>
                <p className="text-sm text-[#6B7280]">Look out for our moving in surprise soon after completion.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mortgage Advice */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="rounded-2xl bg-[#2C2F33] p-8 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-2 items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">Finance</p>
                <h2 className="mt-4 text-3xl font-semibold text-white">Mortgage Advice</h2>
                <p className="mt-4 text-white/70 leading-relaxed">
                  We work with independent mortgage advisers who can help you find the best deal 
                  for your circumstances. Getting your finances in place early puts you in a 
                  stronger position when making an offer.
                </p>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center text-white/70">
                    <CheckCircle className="h-5 w-5 text-[#1DBFDD] mr-3 flex-shrink-0" />
                    <span>Independent whole-of-market advice</span>
                  </div>
                  <div className="flex items-center text-white/70">
                    <CheckCircle className="h-5 w-5 text-[#1DBFDD] mr-3 flex-shrink-0" />
                    <span>Agreement in principle within 24 hours</span>
                  </div>
                  <div className="flex items-center text-white/70">
                    <CheckCircle className="h-5 w-5 text-[#1DBFDD] mr-3 flex-shrink-0" />
                    <span>Access to exclusive rates</span>
                  </div>
                </div>
              </div>
              <div className="text-center lg:text-right">
                <Button className="bg-[#1DBFDD] hover:bg-[#0E8CAB] text-white px-8 py-6 text-base">
                  Speak to a Mortgage Adviser
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1DBFDD] py-16">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-10">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Ready to start your property search?
          </h2>
          <p className="mt-4 text-lg text-white/90">
            Browse our portfolio of premium properties for sale.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/sales/properties">
              <Button className="bg-white text-[#1DBFDD] hover:bg-white/90 px-8 py-6 text-base font-semibold">
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
