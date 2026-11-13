import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { areaGuides } from "@/lib/area-guides";
import { PageBand } from "@/components/PageBand";
import { cn } from "@/lib/utils";
import {
  actionPrimaryOnDark,
  eyebrowOnDark,
  sectionHeadingOnDark,
  sectionPadding,
} from "@/components/ui/form-styles";

export const metadata: Metadata = withPageDefaults("/area-guides", {
  title: "Area Guides | Banc Property Services",
  description: "Explore our area guides for Cuffley, Potters Bar, Cheshunt, Northaw, Brookmans Park, Goffs Oak, Newgate Street Village, Enfield, and Essendon. Discover the best of Hertfordshire and North London living.",
});

export const revalidate = 3600;

const areas = areaGuides.map(({ name, slug, image, teaser }) => ({
  name,
  slug,
  image,
  description: teaser,
}));

export default function AreaGuidesPage() {
  return (
    <div className="min-h-screen bg-[var(--off-white)]">
      <Header />

      <PageBand
        eyebrow="Locations · Where We Operate"
        title="Area Guides"
        lede="Discover the unique character of Hertfordshire and North London through our comprehensive area guides. From charming villages to thriving commuter towns, find your perfect location."
        image={{
          src: "https://images.unsplash.com/photo-1781124492820-95f842bef002?auto=format&fit=crop&w=1920&q=80",
          alt: "",
          priority: true,
        }}
      />

      {/* Areas Grid Section */}
      <section className={sectionPadding}>
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {areas.map((area) => (
            <Link
              key={area.slug}
              href={`/area-guides/${area.slug}`}
              className="group relative block aspect-[4/3] overflow-hidden rounded-[var(--radius-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2"
            >
              <img
                src={area.image}
                alt={`${area.name} - Area Guide`}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" aria-hidden="true" />

              <div className="absolute inset-0 flex flex-col justify-end p-5 lg:p-6">
                <h2 className="font-display text-2xl font-light leading-tight text-white lg:text-3xl">
                  {area.name}
                </h2>
                <p className="mt-1 text-sm text-white/85">{area.description}</p>
                <span className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-white">
                  View Area Guide
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className={cn(sectionPadding, "banc-dark-surface bg-banc-dark-deep text-white")}>
        <div className="mx-auto max-w-7xl">
          <p className={eyebrowOnDark}>More areas</p>
          <h2 className={cn(sectionHeadingOnDark, "mt-3")}>
            Can&apos;t find what you&apos;re looking for?
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-white/70">
            We cover many more areas across Hertfordshire and North London.
            Get in touch to discuss your specific location requirements.
          </p>
          <Link href="/contact" className={cn(actionPrimaryOnDark, "mt-7")}>
            Contact Us
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
