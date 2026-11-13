import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PageBand } from "@/components/PageBand";
import {
  actionPrimaryOnDark,
  actionSecondaryOnDark,
  eyebrow,
  sectionHeading,
  sectionHeadingOnDark,
  sectionPadding,
} from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";
import { ArrowRight, Crown, Award, TrendingUp } from "lucide-react";

export const metadata: Metadata = withPageDefaults("/premier-homes", {
  title: "Banc Premier Homes | Banc Property Services",
  description: "Exclusive service for properties valued at £1 million and above. Discreet marketing, qualified buyers, and exceptional results.",
});

export const revalidate = 3600;

// Premier Homes is the one page where gold stays as the accent (DESIGN.md).
const goldActionOnDark = cn(
  actionPrimaryOnDark,
  "bg-banc-gold shadow-none hover:bg-banc-gold-light",
);
const goldEyebrow = cn(eyebrow, "text-banc-gold-dark");

export default function PremierHomesPage() {
  return (
    <div className="bg-white text-banc-dark">
      <Header />

      <PageBand
        accent="gold"
        eyebrow="Premium Service"
        title="Banc Premier Homes"
        lede="An exclusive service for exceptional properties valued at £1 million and above. Discreet marketing, qualified buyers, and exceptional results."
        image={{ src: "/hertfordshire-home-4.png", alt: "Luxury Premier Home", priority: true }}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button className={goldActionOnDark}>
            Premier Valuation
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button variant="outline" className={cn(actionSecondaryOnDark, "bg-transparent hover:bg-transparent")}>
            View Premier Properties
          </Button>
        </div>
      </PageBand>

      {/* Features */}
      <section className={sectionPadding}>
        <div className="mx-auto max-w-7xl">
          <p className={goldEyebrow}>The Premier Difference</p>
          <h2 className={cn(sectionHeading, "mt-3")}>Service Beyond Expectations</h2>

          <div className="mt-7 grid gap-x-8 md:grid-cols-3">
            <div className="border-t border-banc-dark/15 py-6">
              <Crown className="h-6 w-6 text-banc-gold-dark" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold text-banc-dark-deep">Discreet Marketing</h3>
              <p className="mt-2 text-sm leading-relaxed text-banc-muted-readable">
                Off-market opportunities and private viewings for sensitive sales.
              </p>
            </div>
            <div className="border-t border-banc-dark/15 py-6">
              <Award className="h-6 w-6 text-banc-gold-dark" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold text-banc-dark-deep">Qualified Buyers</h3>
              <p className="mt-2 text-sm leading-relaxed text-banc-muted-readable">
                Access to our network of pre-qualified, serious buyers.
              </p>
            </div>
            <div className="border-t border-banc-dark/15 py-6">
              <TrendingUp className="h-6 w-6 text-banc-gold-dark" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold text-banc-dark-deep">Premium Marketing</h3>
              <p className="mt-2 text-sm leading-relaxed text-banc-muted-readable">
                Professional photography, video tours, and luxury publications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Criteria */}
      <section className={cn(sectionPadding, "bg-banc-grey-pale")}>
        <div className="mx-auto max-w-7xl">
          <p className={goldEyebrow}>Eligibility</p>
          <h2 className={cn(sectionHeading, "mt-3")}>Is Your Property Suitable?</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-banc-muted-readable">
            Banc Premier Homes is designed for exceptional properties that demand
            a bespoke approach. We typically work with:
          </p>
          <ul className="mt-7 max-w-2xl">
            {[
              "Properties valued at £1 million or above",
              "Unique or architecturally significant homes",
              "Prime location properties",
              "Homes with exceptional grounds or features",
              "Equestrian properties and estates"
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 border-t border-banc-dark/15 py-3">
                <span className="text-banc-gold-dark" aria-hidden="true">✓</span>
                <span className="text-banc-muted-readable">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing call to action */}
      <section className={cn(sectionPadding, "banc-dark-surface bg-banc-dark-deep text-white")}>
        <div className="mx-auto max-w-7xl">
          <h2 className={sectionHeadingOnDark}>Request a Premier Valuation</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 lg:text-lg">
            Andrew Crump heads up Banc Premier Homes — your dedicated point of contact from
            valuation right through to completion.
          </p>
          <Button className={cn(goldActionOnDark, "mt-7")}>
            Book Premier Valuation
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
