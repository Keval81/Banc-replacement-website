import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { areaGuides, getAreaGuide } from "@/lib/area-guides";

interface AreaGuidePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return areaGuides.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({ params }: AreaGuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const area = getAreaGuide(slug);
  if (!area) return {};
  return {
    title: `${area.name} Area Guide | Banc Property Group`,
    description: area.paragraphs[0].slice(0, 155),
  };
}

export default async function AreaGuidePage({ params }: AreaGuidePageProps) {
  const { slug } = await params;
  const area = getAreaGuide(slug);
  if (!area) notFound();

  const otherAreas = areaGuides.filter((other) => other.slug !== area.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-[var(--off-white)]">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--charcoal)]">
        <div className="absolute inset-0">
          <img
            src={area.image}
            alt={`${area.name} area`}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1917]/80 via-[#1A1917]/60 to-[#1A1917]/40" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="h-px w-8 bg-[var(--primary-cyan)]" />
              <span className="text-sm font-medium tracking-widest uppercase text-[var(--primary-cyan)]">
                Area Guide
              </span>
              <div className="h-px w-8 bg-[var(--primary-cyan)]" />
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]">
              {area.name}
            </h1>

            <p className="mt-6 text-xl sm:text-2xl text-white/70 font-light tracking-wide">
              {area.teaser}
            </p>

            <div className="mt-8 flex justify-center">
              <div className="h-1 w-24 bg-gradient-to-r from-transparent via-[var(--primary-cyan)] to-transparent" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--off-white)] to-transparent" />
      </section>

      {/* Guide copy */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <div className="space-y-6">
            {area.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="text-lg leading-relaxed text-[var(--charcoal)]/80">
                {paragraph}
              </p>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4">
            <Link
              href="/sales/properties"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--primary-cyan)] text-white font-semibold rounded-lg hover:bg-[var(--dark-cyan)] transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
              Properties For Sale
            </Link>
            <Link
              href="/valuation"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[var(--charcoal)] text-[var(--charcoal)] font-semibold rounded-lg hover:bg-[var(--charcoal)] hover:text-white transition-colors duration-300"
            >
              Request a Valuation
            </Link>
          </div>
        </div>
      </section>

      {/* Other areas */}
      <section className="pb-16 lg:pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <h2 className="text-2xl lg:text-3xl font-bold text-[var(--charcoal)] mb-8">
            Explore More Areas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {otherAreas.map((other) => (
              <Link
                key={other.slug}
                href={`/area-guides/${other.slug}`}
                className="group relative block aspect-[4/3] overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={other.image}
                    alt={`${other.name} - Area Guide`}
                    className="h-full w-full object-cover transform scale-100 transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="text-xl font-bold text-white tracking-tight">{other.name}</h3>
                  <span className="mt-1 text-sm text-white/80">{other.teaser}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
