import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  Sparkles,
  Home,
  ClipboardCheck,
  Camera,
  Users,
  DoorOpen,
  MessageSquare,
  Handshake,
  FileText,
  KeyRound,
  Truck,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sellers Guide | Banc Property Group",
  description:
    "Selling your property is an exciting experience but often daunting. Our aim is to maximise the value of your home with the minimum of fuss.",
};

// --- Types ---

interface TopTipProps {
  children: React.ReactNode;
}

interface GuideStep {
  number: number;
  title: string;
  description?: string;
  items: { icon: React.ElementType; text: string; highlight?: string }[];
  imageUrl: string;
  imageAlt: string;
  topTips?: string[];
  quote?: string;
}

// --- Components ---

function TopTip({ children }: TopTipProps) {
  return (
    <div className="group relative mt-8 overflow-hidden rounded-xl bg-gradient-to-r from-[#4AC8E8]/10 to-transparent border-l-4 border-[#4AC8E8] p-5 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-r from-[#4AC8E8]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#4AC8E8] flex items-center justify-center shadow-lg shadow-[#4AC8E8]/25">
          <Lightbulb className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 pt-1">
          <span className="font-semibold text-[#4AC8E8] uppercase text-xs tracking-[0.2em] mb-1 block">
            Top Tip
          </span>
          <p className="text-[#1A1917] leading-relaxed font-medium">
            {children}
          </p>
        </div>
      </div>
    </div>
  );
}

function StepNumber({ number }: { number: number }) {
  return (
    <div className="relative">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4AC8E8] to-[#1A9BBF] flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-[#4AC8E8]/30 ring-4 ring-white">
        {number}
      </div>
      <div className="absolute inset-0 rounded-full bg-[#4AC8E8] animate-pulse opacity-20" />
    </div>
  );
}

function StepBadge({ number }: { number: number }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A1917]/5 border border-[#1A1917]/10 mb-4">
      <span className="w-1.5 h-1.5 rounded-full bg-[#4AC8E8]" />
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A1917]/60">
        Step {number} of 10
      </span>
    </div>
  );
}

function CheckItem({
  icon: Icon,
  text,
  highlight,
}: {
  icon: React.ElementType;
  text: string;
  highlight?: string;
}) {
  return (
    <li className="flex items-start gap-4 group/item">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#4AC8E8]/10 flex items-center justify-center mt-0.5 group-hover/item:bg-[#4AC8E8]/20 transition-colors duration-200">
        <Icon className="h-3.5 w-3.5 text-[#4AC8E8]" />
      </div>
      <span className="text-[#8A8880] leading-relaxed group-hover/item:text-[#1A1917] transition-colors duration-200">
        {highlight ? (
          <>
            <span className="font-semibold text-[#1A1917]">{highlight}</span>{" "}
            {text.replace(highlight, "")}
          </>
        ) : (
          text
        )}
      </span>
    </li>
  );
}

// --- Data ---

const guideSteps: GuideStep[] = [
  {
    number: 1,
    title: "Book a Market Appraisal",
    description:
      "The first step in your selling journey begins with understanding your property's true market value.",
    items: [
      {
        icon: CheckCircle2,
        text: "Complimentary, no obligation valuation conducted by our experts",
      },
      {
        icon: CheckCircle2,
        text: "Comprehensive market analysis using resources, data and recent comparable sales",
      },
      {
        icon: CheckCircle2,
        text: "Flexible appointment times including evenings and weekends to suit your schedule",
      },
      {
        icon: CheckCircle2,
        text: "Strategic marketing advice tailored to maximise your property's appeal",
      },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Professional property market appraisal and valuation",
    topTips: [
      "Instruct a solicitor as soon as you place your property on the market to save valuable time once a buyer is found.",
    ],
  },
  {
    number: 2,
    title: "The Sellers Checklist",
    description:
      "Preparation is key. Ensure you have all necessary documentation ready before marketing begins.",
    items: [
      {
        icon: ClipboardCheck,
        text: "Energy Performance Certificate (EPC) required by legislation – we can arrange an independent assessment",
      },
      {
        icon: ClipboardCheck,
        text: "Professional floorplans are essential and can be completed alongside your EPC",
      },
      {
        icon: ClipboardCheck,
        text: "Valid photo ID required for compliance with money laundering legislation",
      },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Property documentation and legal checklist",
  },
  {
    number: 3,
    title: "Getting Ready For Marketing",
    description:
      "First impressions are everything. We'll help showcase your property at its absolute best.",
    items: [
      {
        icon: Camera,
        text: "Expert professional photography and copywriting that brings your home to life",
      },
      {
        icon: Sparkles,
        text: "Seller's Secret: A personal testimonial about why you loved living here",
        highlight: "Seller's Secret:",
      },
      {
        icon: FileText,
        text: "Beautifully designed marketing materials that bring your property to life",
      },
      {
        icon: Users,
        text: "Full team briefing – every consultant visits your property before viewings begin",
      },
      {
        icon: ClipboardCheck,
        text: "Detailed brief sheet ensures all staff are informed on every unique feature",
        highlight: "Brief sheet",
      },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Professional property photography and staging",
    topTips: [
      "Make sure your property is tidy, clutter-free and filled with natural light before the photographer and viewers arrive.",
    ],
  },
  {
    number: 4,
    title: "Reaching Potential Buyers",
    description:
      "We employ a comprehensive, multi-channel marketing strategy to ensure maximum exposure.",
    items: [
      {
        icon: Users,
        text: "Multi-channel approach: major property portals, website, database mailshots, targeted email campaigns, local letter drops, and strategic social media promotion",
      },
      {
        icon: Home,
        text: "Premium 'For Sale' boards positioned for maximum visibility",
      },
      {
        icon: ClipboardCheck,
        text: "Access to our extensive register of motivated, ready-to-move buyers",
      },
      {
        icon: Sparkles,
        text: "Exclusive sneak previews for registered clients before public launch",
      },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Property marketing and buyer outreach",
  },
  {
    number: 5,
    title: "The Viewings",
    description:
      "Your home takes centre stage. We ensure every viewing is conducted professionally and securely.",
    items: [
      {
        icon: DoorOpen,
        text: "First impressions are paramount – we guide you on presentation",
      },
      {
        icon: Users,
        text: "Fully accompanied viewings for security and to highlight every benefit",
      },
      {
        icon: Home,
        text: "Open house events when appropriate – professionally supervised 2-3 hour sessions",
      },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Property viewing experience",
    quote: "Your home steals the show!!",
    topTips: [
      "If you receive letters from other agents claiming to have interested buyers, simply redirect them to us – we handle everything.",
      "Provide us with secure keys and keep us briefed on alarm codes and any pets on the premises.",
    ],
  },
  {
    number: 6,
    title: "Viewing Verdict",
    description:
      "Communication is crucial. We believe in transparent, honest feedback after every viewing.",
    items: [
      {
        icon: MessageSquare,
        text: "Prompt follow-up calls to applicants immediately after viewings",
      },
      {
        icon: ClipboardCheck,
        text: "Bi-monthly consultation reviews to assess progress on all properties",
      },
      {
        icon: CheckCircle2,
        text: "Comprehensive feedback delivered via email or phone by the next working day",
      },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Client feedback and communication",
    topTips: [
      "Feedback, whether positive or constructive, is invaluable. Some agents only share good news, but we believe all feedback should be given. Silence is never golden!!",
    ],
  },
  {
    number: 7,
    title: "When An Offer Is Made",
    description:
      "Our skilled negotiators work tirelessly to secure the best possible outcome for you.",
    items: [
      {
        icon: Handshake,
        text: "Highly skilled negotiators personally contact you with every offer detail",
      },
      {
        icon: ClipboardCheck,
        text: "Full transparency: applicant's timescales, financial position, and chain details provided",
      },
      {
        icon: CheckCircle2,
        text: "Dedicated effort to negotiate the optimum price on your behalf",
      },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1625225233840-695456021cde?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Offer negotiation and agreement",
  },
  {
    number: 8,
    title: "Offers Agreed",
    description:
      "Once an offer is accepted, we coordinate all parties to ensure a smooth progression.",
    items: [
      {
        icon: FileText,
        text: "Sales memorandum promptly dispatched to both parties' solicitors",
      },
      {
        icon: MessageSquare,
        text: "Constant communication with all parties is paramount to success",
      },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Sales progression documentation",
    topTips: [
      "Maintain regular contact with your solicitor. As a general rule: aim to exchange contracts within 6 weeks, with completion typically following a couple of weeks later.",
    ],
  },
  {
    number: 9,
    title: "Exchange",
    description:
      "The legally binding milestone. Contracts are signed and completion dates are set.",
    items: [
      {
        icon: FileText,
        text: "Contracts signed by all parties with 10% deposit secured",
      },
      {
        icon: Handshake,
        text: "Contracts officially exchanged – the transaction is now legally binding",
      },
      {
        icon: CheckCircle2,
        text: "Completion date formally agreed and confirmed",
      },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Contract exchange celebration",
  },
  {
    number: 10,
    title: "Completion",
    description:
      "The exciting finale – moving day has arrived. Time to begin your next chapter.",
    items: [
      {
        icon: KeyRound,
        text: "Moving day! Your solicitor confirms funds have cleared successfully",
      },
      {
        icon: Home,
        text: "We release keys to the new owners, marking a successful sale",
      },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Moving day completion",
  },
];

// --- Main Page Component ---

export default function SellersGuidePage() {
  return (
    <div className="min-h-screen bg-[#F4F3F1]">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#1A1917]">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1917]/80 via-[#1A1917]/60 to-[#1A1917]/40" />
        </div>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Gradient Accent */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#4AC8E8]/10 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4AC8E8]/10 border border-[#4AC8E8]/20 mb-8">
              <Home className="h-4 w-4 text-[#4AC8E8]" />
              <span className="text-sm font-medium text-[#4AC8E8]">
                Sellers Guide
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-[1.1]">
              Your Complete Guide to{" "}
              <span className="text-[#4AC8E8]">Selling Property</span>
            </h1>

            <p className="mt-8 text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl">
              Selling your property is an exciting yet often daunting experience.
              It is essential that this significant legal transaction is managed
              by true professionals. Our commitment is to maximise the value of
              your home with the minimum of fuss.
            </p>

            <p className="mt-4 text-white/50">
              To give you clarity on the journey ahead, here is our
              comprehensive guide to selling a property.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-wrap gap-4">
              <Button className="bg-[#4AC8E8] hover:bg-[#1A9BBF] text-white px-8 py-6 text-base font-medium rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-[#4AC8E8]/25 group">
                Book Free Valuation
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Link href="/sales/properties">
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-base font-medium rounded-full transition-all duration-300"
                >
                  View Sold Properties
                </Button>
              </Link>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="mt-16 flex items-center gap-4">
            <div className="flex -space-x-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-[#4AC8E8]/20 border-2 border-[#1A1917] flex items-center justify-center text-xs font-bold text-[#4AC8E8]"
                >
                  {i + 1}
                </div>
              ))}
              <div className="w-10 h-10 rounded-full bg-[#4AC8E8]/10 border-2 border-[#1A1917] flex items-center justify-center text-xs text-white/50">
                +5
              </div>
            </div>
            <span className="text-white/60 text-sm">
              10 essential steps to a successful sale
            </span>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F4F3F1] to-transparent" />
      </section>

      {/* Guide Steps */}
      <main className="relative">
        {guideSteps.map((step, index) => {
          const isReversed = index % 2 !== 0;
          const isLast = index === guideSteps.length - 1;

          return (
            <section
              key={step.number}
              id={`step-${step.number}`}
              className={`relative py-20 lg:py-28 ${
                !isLast ? "border-b border-[#1A1917]/5" : ""
              }`}
            >
              <div className="mx-auto max-w-7xl px-6 lg:px-10">
                <div
                  className={`grid lg:grid-cols-2 gap-12 lg:gap-20 ${
                    isReversed ? "" : ""
                  }`}
                >
                  {/* Image Column */}
                  <div
                    className={`relative flex flex-col ${isReversed ? "lg:order-2" : ""}`}
                  >
                    {/* Step Number Overlay */}
                    <div className="absolute -top-4 -left-4 lg:-top-6 lg:-left-6 z-10">
                      <StepNumber number={step.number} />
                    </div>

                    {/* Image Container */}
                    <div className="relative h-full rounded-2xl overflow-hidden shadow-2xl shadow-[#1A1917]/10 group">
                      <img
                        src={step.imageUrl}
                        alt={step.imageAlt}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A1917]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Image Corner Accent */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#4AC8E8]/20 to-transparent" />
                    </div>

                    {/* Decorative Frame */}
                    <div
                      className={`absolute -bottom-4 -right-4 w-full h-full border-2 border-[#4AC8E8]/20 rounded-2xl -z-10 ${
                        isReversed ? "lg:-left-4 lg:right-auto" : ""
                      }`}
                    />
                  </div>

                  {/* Content Column */}
                  <div className={`flex flex-col ${isReversed ? "lg:order-1" : ""}`}>
                    <div className="flex-1">
                      <StepBadge number={step.number} />

                      <h2 className="text-3xl lg:text-4xl font-semibold text-[#1A1917] tracking-tight leading-tight">
                        {step.title}
                      </h2>

                      {step.description && (
                        <p className="mt-4 text-lg text-[#8A8880] leading-relaxed">
                          {step.description}
                        </p>
                      )}

                      {step.quote && (
                        <blockquote className="mt-6 pl-6 border-l-2 border-[#4AC8E8]">
                          <p className="text-xl font-medium text-[#4AC8E8] italic">
                            &ldquo;{step.quote}&rdquo;
                          </p>
                        </blockquote>
                      )}

                      {/* Items List */}
                      <ul className="mt-8 space-y-4">
                        {step.items.map((item, i) => (
                          <CheckItem
                            key={i}
                            icon={item.icon}
                            text={item.text}
                            highlight={item.highlight}
                          />
                        ))}
                      </ul>
                    </div>

                    {/* Top Tips - Pushed to bottom with flexbox */}
                    <div className="mt-8">
                      {step.topTips?.map((tip, i) => (
                        <TopTip key={i}>{tip}</TopTip>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Connector Line (except for last) */}
              {!isLast && (
                <div className="hidden lg:block absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-20">
                  <div className="w-12 h-12 rounded-full bg-[#F4F3F1] border-2 border-[#4AC8E8]/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#4AC8E8]" />
                  </div>
                </div>
              )}
            </section>
          );
        })}

        {/* Why Choose Us Card (after step 10) */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="relative overflow-hidden rounded-3xl bg-[#1A1917] p-8 lg:p-16">
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#4AC8E8]/10 to-transparent" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#4AC8E8]/5 rounded-full blur-3xl" />

              <div className="relative grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4AC8E8]/10 border border-[#4AC8E8]/20 mb-6">
                    <Sparkles className="h-4 w-4 text-[#4AC8E8]" />
                    <span className="text-sm font-medium text-[#4AC8E8]">
                      The Banc Difference
                    </span>
                  </div>

                  <h2 className="text-3xl lg:text-4xl font-semibold text-white tracking-tight">
                    Why Choose Banc Property Group?
                  </h2>

                  <p className="mt-4 text-lg text-white/60 leading-relaxed">
                    Discover why discerning sellers across the region trust us
                    with their most valuable asset. Our proven track record
                    speaks for itself.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 lg:justify-end">
                  <Link href="/why-us">
                    <Button className="bg-[#4AC8E8] hover:bg-[#1A9BBF] text-white px-8 py-6 text-base font-medium rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-[#4AC8E8]/25 group w-full sm:w-auto">
                      Learn More About Us
                      <ArrowUpRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-[#4AC8E8]">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-20 lg:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-tight">
              Ready to Begin Your Selling Journey?
            </h2>

            <p className="mt-6 text-lg md:text-xl text-white/80 leading-relaxed">
              Take the first step towards a successful sale. Book your free,
              no-obligation market appraisal with one of our property experts
              today.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button className="bg-white text-[#4AC8E8] hover:bg-white/90 px-10 py-7 text-lg font-semibold rounded-full transition-all duration-300 hover:shadow-xl hover:shadow-white/25 group w-full sm:w-auto">
                Book Your Free Valuation
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Link href="/sales/properties">
                <Button
                  variant="outline"
                  className="border-2 border-white/50 text-white hover:bg-white/10 px-10 py-7 text-lg font-semibold rounded-full transition-all duration-300 w-full sm:w-auto"
                >
                  View Our Success Stories
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/60 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-white" />
                <span>No Obligation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-white" />
                <span>Expert Advice</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-white" />
                <span>Flexible Appointments</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
