import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PageBand } from "@/components/PageBand";
import { cn } from "@/lib/utils";
import {
  actionPrimaryOnDark,
  actionSecondary,
  actionSecondaryOnDark,
  eyebrow,
  eyebrowOnDark,
  sectionHeading,
  sectionHeadingOnDark,
  sectionPadding,
} from "@/components/ui/form-styles";
import { ArrowRight, ArrowUpRight } from "lucide-react";
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
  items: readonly { text: string; highlight?: string }[];
  imageUrl: string;
  imageAlt: string;
  topTips?: readonly string[];
  quote?: string;
}

// --- Components ---

function TopTip({ children }: TopTipProps) {
  return (
    <div className="mt-6 border-l-2 border-banc-focus pl-4">
      <span className={cn(eyebrow, "mb-1 block")}>Top Tip</span>
      <p className="font-medium leading-relaxed text-banc-dark-deep">{children}</p>
    </div>
  );
}

function StepMarker({ number }: { number: number }) {
  return (
    <p className={cn(eyebrow, "flex items-baseline gap-3")}>
      <span className="font-mono text-sm font-medium text-banc-dark-deep">
        {String(number).padStart(2, "0")}
      </span>
      Step {number} of 10
    </p>
  );
}

function CheckItem({ text, highlight }: { text: string; highlight?: string }) {
  return (
    <li className="leading-relaxed text-banc-muted-readable">
      {highlight ? (
        <>
          <span className="font-semibold text-banc-dark-deep">{highlight}</span>{" "}
          {text.replace(highlight, "")}
        </>
      ) : (
        text
      )}
    </li>
  );
}

// --- Data ---

interface GuideStepVisual {
  imageUrl: string;
  imageAlt: string;
}

const guideStepVisuals = [
  {
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Professional property market appraisal and valuation",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Property documentation and legal checklist",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Professional property photography and staging",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Property marketing and buyer outreach",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Property viewing experience",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Client feedback and communication",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1625225233840-695456021cde?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Offer negotiation and agreement",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Sales progression documentation",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Contract exchange celebration",
  },
  {
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
      items: section.items,
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

      <PageBand
        eyebrow="Sellers Guide"
        title="Your Complete Guide to Selling Property"
        lede={
          <>
            Selling your property is an exciting yet often daunting experience.
            It is essential that this significant legal transaction is managed
            by true professionals.
          </>
        }
        image={{
          src: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1920&q=80",
          alt: "",
          priority: true,
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className={cn(actionPrimaryOnDark, "shadow-none")}>
            <Link href="/valuation">
              Book Free Valuation
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Link href="/sold-prices" className={actionSecondaryOnDark}>
            View Sold Properties
          </Link>
        </div>
      </PageBand>

      {/* Introduction */}
      <section className="border-b border-banc-dark/15 px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <p className={eyebrow}>10 essential steps to a successful sale</p>
          <div className="mt-4 max-w-3xl space-y-4 leading-relaxed text-banc-muted-readable lg:text-lg">
            <p>
              Our commitment is to maximise the value of
              your home with the minimum of fuss.
            </p>
            <p>
              To give you clarity on the journey ahead, here is our
              comprehensive guide to selling a property.
            </p>
          </div>
        </div>
      </section>

      {/* Guide Steps */}
      <main>
        {guideSteps.map((step, index) => {
          const isReversed = index % 2 !== 0;

          return (
            <section
              key={step.number}
              id={`step-${step.number}`}
              className={cn(sectionPadding, "scroll-mt-24 border-b border-banc-dark/15")}
            >
              <div className="mx-auto max-w-7xl">
                <div className="grid gap-7 lg:grid-cols-2 lg:gap-16">
                  {/* Image Column */}
                  <div className={isReversed ? "lg:order-2" : ""}>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-md)] lg:aspect-auto lg:h-full lg:min-h-80">
                      <img
                        src={step.imageUrl}
                        alt={step.imageAlt}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Content Column */}
                  <div className={isReversed ? "lg:order-1" : ""}>
                    <StepMarker number={step.number} />

                    <h2 className={cn(sectionHeading, "mt-3")}>{step.title}</h2>

                    {step.description && (
                      <p className="mt-4 leading-relaxed text-banc-muted-readable lg:text-lg">
                        {step.description}
                      </p>
                    )}

                    {step.quote && (
                      <blockquote className="mt-6 border-l-2 border-banc-focus pl-4">
                        <p className="text-xl font-medium italic text-banc-focus">
                          &ldquo;{step.quote}&rdquo;
                        </p>
                      </blockquote>
                    )}

                    {/* Items List */}
                    <ul className="mt-7 list-disc space-y-4 pl-5 marker:text-banc-focus">
                      {step.items.map((item, i) => (
                        <CheckItem key={i} text={item.text} highlight={item.highlight} />
                      ))}
                    </ul>

                    {step.topTips?.map((tip, i) => (
                      <TopTip key={i}>{tip}</TopTip>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          );
        })}

        {/* Why Choose Us (after step 10) */}
        <section className={sectionPadding}>
          <div className="mx-auto max-w-7xl">
            <p className={eyebrow}>The Banc Difference</p>
            <h2 className={cn(sectionHeading, "mt-3")}>Why Choose Banc Property Group?</h2>

            <p className="mt-6 max-w-2xl leading-relaxed text-banc-muted-readable lg:text-lg">
              Discover why discerning sellers across the region trust us
              with their most valuable asset. Our proven track record
              speaks for itself.
            </p>

            <Link href="/why-us" className={cn(actionSecondary, "mt-7")}>
              Learn More About Us
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      {/* CTA Section */}
      <section className={cn(sectionPadding, "banc-dark-surface bg-banc-dark-deep text-white")}>
        <div className="mx-auto max-w-7xl">
          <p className={eyebrowOnDark}>Next step</p>
          <h2 className={cn(sectionHeadingOnDark, "mt-3")}>
            Ready to Begin Your Selling Journey?
          </h2>

          <p className="mt-4 max-w-2xl leading-relaxed text-white/70 lg:text-lg">
            Take the first step towards a successful sale. Book your free,
            no-obligation market appraisal with one of our property experts
            today.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild className={cn(actionPrimaryOnDark, "shadow-none")}>
              <Link href="/valuation">
                Book Your Free Valuation
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>

            <Link href="/sales/properties" className={actionSecondaryOnDark}>
              View Our Success Stories
            </Link>
          </div>

          {/* Trust Indicators */}
          <p className="mt-6 text-sm text-white/70">
            {["No Obligation", "Expert Advice", "Flexible Appointments"].join(" · ")}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
