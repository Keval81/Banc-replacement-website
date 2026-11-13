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
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BUYERS_GUIDE } from "@/lib/banc-content/buyers-guide";

export const metadata: Metadata = withPageDefaults("/sales/buyers-guide", {
  title: "Buyers Guide | Banc Property Group",
  description: "We love what we do. We have a passion for matching buyers with the very best homes in the areas we cover. Our local knowledge will help you source the right home for your needs.",
});

export const revalidate = 3600;

const guideSteps = BUYERS_GUIDE.sections.slice(0, 6);
const completion = BUYERS_GUIDE.sections[6];

const topTip = "border-l-2 border-banc-focus pl-4";

export default function BuyersGuidePage() {
  return (
    <div className="bg-white text-banc-dark">
      <Header />

      <PageBand
        eyebrow="Guide"
        title={BUYERS_GUIDE.title}
        lede={
          <>
            We love what we do. We have a passion for matching buyers with the very best homes in the areas we cover.
            We listen to your requirements, to your budget and to your personal story to help identify properties that meet your needs.
          </>
        }
        image={{
          src: "https://images.unsplash.com/photo-1783934108429-284d1f160ae1?auto=format&fit=crop&w=2000&q=80",
          alt: "Luxury home interior",
          priority: true,
        }}
      />

      {/* Introduction */}
      <section className={cn(sectionPadding, "bg-banc-grey-pale")}>
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl space-y-5 leading-relaxed text-banc-muted-readable lg:text-lg">
            <p>
              All our staff are local to the area so who better to lend a hand when looking for the best schools,
              transport links and the best amenities! Our local knowledge will help you source the right home for your needs.
            </p>
            <p>
              Below is a brief guide to the buying process. Whether you&apos;re a first-time buyer or seasoned property investor,
              we&apos;re here to make your journey as smooth as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Guide Steps */}
      <section className={sectionPadding}>
        <div className="mx-auto max-w-7xl">
          <div className="space-y-12 lg:space-y-20">
            {guideSteps.map((step, index) => {
              const isReversed = index % 2 === 1;
              return (
                <div key={step.title} className="grid items-center gap-7 lg:grid-cols-2 lg:gap-16">
                  {/* Content Column */}
                  <div className={isReversed ? 'lg:order-2' : ''}>
                    {/* Step marker */}
                    <p className={cn(eyebrow, "flex items-baseline gap-3")}>
                      <span className="font-mono text-sm font-medium text-banc-dark-deep">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      Step {index + 1} of 6
                    </p>

                    <h2 className={cn(sectionHeading, "mt-3")}>{step.title}</h2>
                    <p className="mt-6 leading-relaxed text-banc-muted-readable">{step.body[0]}</p>

                    {/* Top Tip - Consistent styling with Sellers Guide */}
                    <div className={cn(topTip, "mt-6")}>
                      <p className={cn(eyebrow, "mb-1")}>Top Tip</p>
                      <p className="leading-relaxed text-banc-dark-mid">{step.body[1]}</p>
                    </div>
                  </div>

                  {/* Image Column */}
                  <div className={isReversed ? 'lg:order-1' : ''}>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-md)]">
                      <Image
                        src={[
                          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
                          "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80",
                          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
                          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
                          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
                          "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80"
                        ][index]}
                        alt={step.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Completion Section */}
      <section className={cn(sectionPadding, "bg-banc-grey-pale")}>
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <h2 className={sectionHeading}>{completion.title}</h2>
            <p className="mt-6 leading-relaxed text-banc-muted-readable lg:text-lg">
              {completion.body[0]}
            </p>
            <div className={cn(topTip, "mt-6")}>
              <p className={cn(eyebrow, "mb-1")}>Top Tip</p>
              <p className="text-sm text-banc-muted-readable">{completion.body[1]}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mortgage Advice */}
      <section className={sectionPadding}>
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className={eyebrow}>Finance</p>
              <h2 className={cn(sectionHeading, "mt-3")}>Mortgage Advice</h2>
              <p className="mt-6 leading-relaxed text-banc-muted-readable">
                We work with independent mortgage advisers who can help you find the best deal
                for your circumstances. Getting your finances in place early puts you in a
                stronger position when making an offer.
              </p>
              <div className="mt-7">
                <Button asChild variant="outline" className={cn(actionSecondary, "bg-transparent hover:bg-transparent")}>
                  <Link href="/contact">
                    Speak to a Mortgage Adviser
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
            <ul className="self-start border-t border-banc-dark/15">
              {[
                "Independent whole-of-market advice",
                "Agreement in principle within 24 hours",
                "Access to exclusive rates",
              ].map((item) => (
                <li key={item} className="border-b border-banc-dark/15 py-4 text-banc-dark-deep">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={cn(sectionPadding, "banc-dark-surface bg-banc-dark-deep text-white")}>
        <div className="mx-auto max-w-7xl">
          <p className={eyebrowOnDark}>Next step</p>
          <h2 className={cn(sectionHeadingOnDark, "mt-3")}>
            Ready to start your property search?
          </h2>
          <p className="mt-4 text-white/70 lg:text-lg">
            Browse our portfolio of premium properties for sale.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/sales/properties" className={actionPrimaryOnDark}>
              View Properties
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Button asChild variant="outline" className={cn(actionSecondaryOnDark, "bg-transparent hover:bg-transparent")}>
              <Link href="/#alerts">
                Register with Us
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
