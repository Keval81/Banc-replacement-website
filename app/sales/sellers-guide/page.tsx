import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
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
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { SELLERS_GUIDE_SECTIONS } from "@/lib/banc-content/sellers-guide";

export const metadata: Metadata = withPageDefaults("/sales/sellers-guide", {
  title: "Sellers Guide | Banc Property Group",
  description:
    "Selling your property is an exciting experience but often daunting. Our aim is to maximise the value of your home with the minimum of fuss.",
});

export const revalidate = 3600;

// --- Types ---

interface TopTipProps {
  children: React.ReactNode;
}
interface GuideStep {
  number: number;
  title: string;
  description?: string;
  items: readonly { icon: React.ElementType; text: string; highlight?: string }[];
  imageUrl: string;
  imageAlt: string;
  topTips?: readonly string[];
  quote?: string;
}

// --- Components ---

function TopTip({ children }: TopTipProps) {
  return (
    <div className="group relative mt-8 overflow-hidden rounded-xl bg-gradient-to-r from-banc-sky/10 to-transparent border-l-4 border-banc-sky p-5 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-r from-banc-sky/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-banc-sky flex items-center justify-center shadow-lg shadow-banc-sky/25">
          <Lightbulb className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 pt-1">
          <span className="font-semibold text-banc-focus uppercase text-xs tracking-[0.2em] mb-1 block">
            Top Tip
          </span>
          <p className="text-banc-dark-deep leading-relaxed font-medium">
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
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-banc-sky to-banc-sky-dark flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-banc-sky/30 ring-4 ring-white">
        {number}
      </div>
      <div className="absolute inset-0 rounded-full bg-banc-sky animate-pulse opacity-20" />
    </div>
  );
}

function StepBadge({ number }: { number: number }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-banc-dark-deep/5 border border-banc-dark-deep/10 mb-4">
      <span className="w-1.5 h-1.5 rounded-full bg-banc-sky" />
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-banc-dark-deep/60">
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
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-banc-sky/10 flex items-center justify-center mt-0.5 group-hover/item:bg-banc-sky/20 transition-colors duration-200">
        <Icon className="h-3.5 w-3.5 text-banc-focus" />
      </div>
      <span className="text-banc-muted-readable leading-relaxed group-hover/item:text-banc-dark-deep transition-colors duration-200">
        {highlight ? (
          <>
            <span className="font-semibold text-banc-dark-deep">{highlight}</span>{" "}
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

interface GuideStepVisual {
  itemIcons: readonly React.ElementType[];
  imageUrl: string;
  imageAlt: string;
}

const guideStepVisuals = [
  {
    itemIcons: [CheckCircle2, CheckCircle2, CheckCircle2, CheckCircle2],
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Professional property market appraisal and valuation",
  },
  {
    itemIcons: [ClipboardCheck, ClipboardCheck, ClipboardCheck],
    imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Property documentation and legal checklist",
  },
  {
    itemIcons: [Camera, Sparkles, FileText, Users, ClipboardCheck],
    imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Professional property photography and staging",
  },
  {
    itemIcons: [Users, Home, ClipboardCheck, Sparkles],
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Property marketing and buyer outreach",
  },
  {
    itemIcons: [DoorOpen, Users, Home],
    imageUrl: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Property viewing experience",
  },
  {
    itemIcons: [MessageSquare, ClipboardCheck, CheckCircle2],
    imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Client feedback and communication",
  },
  {
    itemIcons: [Handshake, ClipboardCheck, CheckCircle2],
    imageUrl: "https://images.unsplash.com/photo-1625225233840-695456021cde?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Offer negotiation and agreement",
  },
  {
    itemIcons: [FileText, MessageSquare],
    imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Sales progression documentation",
  },
  {
    itemIcons: [FileText, Handshake, CheckCircle2],
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Contract exchange celebration",
  },
  {
    itemIcons: [KeyRound, Home],
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Moving day completion",
  },
] as const satisfies readonly GuideStepVisual[];

const guideSteps: readonly GuideStep[] = SELLERS_GUIDE_SECTIONS.map(
  (section, index) => {
    const visual = guideStepVisuals[index];

    return {
      number: index + 1,
      title: section.title,
      description: section.description,
      items: section.items.map((item, itemIndex) => ({
        icon: visual.itemIcons[itemIndex],
        ...item,
      })),
      imageUrl: visual.imageUrl,
      imageAlt: visual.imageAlt,
      topTips: section.topTips,
      quote: section.quote,
    };
  },
);

// --- Main Page Component ---

export default function SellersGuidePage() {
  return (
    <div className="min-h-screen bg-banc-grey-pale">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-banc-dark-deep">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-banc-dark-deep/80 via-banc-dark-deep/60 to-banc-dark-deep/40" />
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
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-banc-sky/10 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-banc-sky/10 border border-banc-sky/20 mb-8">
              <Home className="h-4 w-4 text-banc-sky" />
              <span className="text-sm font-medium text-banc-sky">
                Sellers Guide
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-[1.1]">
              Your Complete Guide to{" "}
              <span className="text-banc-sky">Selling Property</span>
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
              <Button className="bg-banc-focus hover:bg-banc-focus-hover text-white px-8 py-6 text-base font-medium rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-banc-sky/25 group">
                Book Free Valuation
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Link href="/sales/properties">
                <Button
                  variant="outline"
                  className="bg-transparent border-white/30 text-white hover:bg-white/10 px-8 py-6 text-base font-medium rounded-full transition-all duration-300"
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
                  className="w-10 h-10 rounded-full bg-banc-sky/20 border-2 border-banc-dark-deep flex items-center justify-center text-xs font-bold text-banc-sky"
                >
                  {i + 1}
                </div>
              ))}
              <div className="w-10 h-10 rounded-full bg-banc-sky/10 border-2 border-banc-dark-deep flex items-center justify-center text-xs text-white/50">
                +5
              </div>
            </div>
            <span className="text-white/60 text-sm">
              10 essential steps to a successful sale
            </span>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-banc-grey-pale to-transparent" />
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
                !isLast ? "border-b border-banc-dark-deep/5" : ""
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
                    <div className="relative h-full rounded-2xl overflow-hidden shadow-2xl shadow-banc-dark-deep/10 group">
                      <img
                        src={step.imageUrl}
                        alt={step.imageAlt}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-banc-dark-deep/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Image Corner Accent */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-banc-sky/20 to-transparent" />
                    </div>

                    {/* Decorative Frame */}
                    <div
                      className={`absolute -bottom-4 -right-4 w-full h-full border-2 border-banc-sky/20 rounded-2xl -z-10 ${
                        isReversed ? "lg:-left-4 lg:right-auto" : ""
                      }`}
                    />
                  </div>

                  {/* Content Column */}
                  <div className={`flex flex-col ${isReversed ? "lg:order-1" : ""}`}>
                    <div className="flex-1">
                      <StepBadge number={step.number} />

                      <h2 className="text-3xl lg:text-4xl font-semibold text-banc-dark-deep tracking-tight leading-tight">
                        {step.title}
                      </h2>

                      {step.description && (
                        <p className="mt-4 text-lg text-banc-muted-readable leading-relaxed">
                          {step.description}
                        </p>
                      )}

                      {step.quote && (
                        <blockquote className="mt-6 pl-6 border-l-2 border-banc-sky">
                          <p className="text-xl font-medium text-banc-focus italic">
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
                  <div className="w-12 h-12 rounded-full bg-banc-grey-pale border-2 border-banc-sky/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-banc-sky" />
                  </div>
                </div>
              )}
            </section>
          );
        })}

        {/* Why Choose Us Card (after step 10) */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="relative overflow-hidden rounded-3xl bg-banc-dark-deep p-8 lg:p-16">
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-banc-sky/10 to-transparent" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-banc-sky/5 rounded-full blur-3xl" />

              <div className="relative grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-banc-sky/10 border border-banc-sky/20 mb-6">
                    <Sparkles className="h-4 w-4 text-banc-sky" />
                    <span className="text-sm font-medium text-banc-sky">
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
                    <Button className="bg-banc-focus hover:bg-banc-focus-hover text-white px-8 py-6 text-base font-medium rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-banc-sky/25 group w-full sm:w-auto">
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
      <section className="relative overflow-hidden bg-banc-sky">
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
              <Button className="bg-white text-banc-focus hover:bg-white/90 px-10 py-7 text-lg font-semibold rounded-full transition-all duration-300 hover:shadow-xl hover:shadow-white/25 group w-full sm:w-auto">
                Book Your Free Valuation
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Link href="/sales/properties">
                <Button
                  variant="outline"
                  className="bg-transparent border-2 border-white/50 text-white hover:bg-white/10 px-10 py-7 text-lg font-semibold rounded-full transition-all duration-300 w-full sm:w-auto"
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
