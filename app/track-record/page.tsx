import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageBand } from "@/components/PageBand";
import {
  actionPrimary,
  actionPrimaryOnDark,
  actionSecondary,
  eyebrow,
  sectionHeading,
  sectionHeadingOnDark,
  sectionPadding,
} from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = withPageDefaults("/track-record", {
  title: "Track Record | Banc Property Services",
  description: "We have an impressive track record. See the properties Banc Property Group has sold across Cuffley, Goffs Oak, Cheshunt and the surrounding areas.",
});

export const revalidate = 3600;

export default function TrackRecordPage() {
  return (
    <div className="bg-white text-banc-dark">
      <Header />

      <PageBand
        eyebrow="Results"
        title="Impressive Track Record"
        lede="We have an impressive track record. The best way to judge us is by the homes we have sold and let — and by what the people who trusted us with them say."
        image={{
          src: "https://images.unsplash.com/photo-1732721176854-4d03a05d292f?auto=format&fit=crop&w=1920&q=80",
          alt: "",
          priority: true,
        }}
      />

      {/* Sold properties CTA */}
      <section className={sectionPadding}>
        <div className="mx-auto max-w-7xl">
          <p className={eyebrow}>Recent Success</p>
          <h2 className={cn(sectionHeading, "mt-3")}>See What We&apos;ve Sold</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-banc-muted-readable lg:text-lg">
            Browse the properties we have sold and let across Cuffley, Goffs Oak, Cheshunt,
            Northaw and the surrounding villages.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/sold-prices" className={actionPrimary}>
              View Sold Properties
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/sales/properties" className={actionSecondary}>
              Current Properties
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonial — verbatim from bancproperty.com/reviews */}
      <section className={cn(sectionPadding, "bg-banc-grey-pale")}>
        <figure className="mx-auto max-w-7xl">
          <blockquote className="max-w-4xl border-t border-banc-dark/15 pt-7 font-display text-xl font-light leading-relaxed text-banc-dark lg:text-2xl">
            You guys are brilliant, when you valued our property at a much higher price than other
            agents we were sceptical we could achieve that but it sold for exactly that. You really
            know what you&apos;re talking about and because of your expert knowledge we were able to
            move to a location we thought we couldn&apos;t afford.
          </blockquote>
          <figcaption className="mt-6">
            <p className="font-semibold">Lesley &amp; James</p>
            <p className="text-banc-muted-readable">Beverley Gardens, Cheshunt</p>
          </figcaption>
          <Link
            href="/reviews"
            className="mt-4 inline-flex min-h-11 items-center font-medium text-banc-focus underline-offset-4 hover:underline"
          >
            Read all client reviews
          </Link>
        </figure>
      </section>

      {/* CTA */}
      <section className={cn(sectionPadding, "banc-dark-surface bg-banc-dark-deep text-white")}>
        <div className="mx-auto max-w-7xl">
          <h2 className={sectionHeadingOnDark}>Ready to achieve exceptional results?</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 lg:text-lg">
            Let us put our track record to work for you.
          </p>
          <Link href="/valuation" className={cn(actionPrimaryOnDark, "mt-7")}>
            Book Your Valuation
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
