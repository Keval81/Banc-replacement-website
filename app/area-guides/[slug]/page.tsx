import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { areaGuides, getAreaGuide } from "@/lib/area-guides";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/seo";
import { PageBand } from "@/components/PageBand";
import { cn } from "@/lib/utils";
import {
  actionPrimary,
  actionSecondary,
  eyebrow,
  sectionHeading,
  sectionPadding,
} from "@/components/ui/form-styles";

export const revalidate = 3600;

interface AreaGuidePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return areaGuides.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({ params }: AreaGuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const area = getAreaGuide(slug);
  if (!area) return { title: "Area guide not found", robots: { index: false, follow: true } };
  return buildMetadata({
    title: `${area.name} Area Guide | Banc Property Group`,
    description: area.paragraphs[0],
    path: `/area-guides/${area.slug}`,
    image: area.image,
    imageAlt: `${area.name} area`,
  });
}

export default async function AreaGuidePage({ params }: AreaGuidePageProps) {
  const { slug } = await params;
  const area = getAreaGuide(slug);
  if (!area) notFound();

  const otherAreas = areaGuides.filter((other) => other.slug !== area.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-[var(--off-white)]">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Area Guides", path: "/area-guides" },
          { name: area.name, path: `/area-guides/${area.slug}` },
        ])}
      />
      <Header />

      <PageBand
        eyebrow="Area Guide"
        title={area.name}
        lede={area.teaser}
        back={{ href: "/area-guides", label: "All area guides" }}
        image={{ src: area.image, alt: `${area.name} area`, priority: true }}
      />

      {/* Guide copy */}
      <section className={sectionPadding}>
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="space-y-6">
              {area.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="text-lg leading-relaxed text-banc-dark-mid">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/sales/properties" className={actionPrimary}>
                Properties For Sale
              </Link>
              <Link href="/valuation" className={actionSecondary}>
                Request a Valuation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Other areas */}
      <section className={cn(sectionPadding, "border-t border-banc-dark/15")}>
        <div className="mx-auto max-w-7xl">
          <p className={eyebrow}>Area guides</p>
          <h2 className={cn(sectionHeading, "mt-3")}>Explore More Areas</h2>
          <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {otherAreas.map((other) => (
              <Link
                key={other.slug}
                href={`/area-guides/${other.slug}`}
                className="group relative block aspect-[4/3] overflow-hidden rounded-[var(--radius-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2"
              >
                <img
                  src={other.image}
                  alt={`${other.name} - Area Guide`}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" aria-hidden="true" />
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <h3 className="font-display text-xl font-light text-white">{other.name}</h3>
                  <span className="mt-1 text-sm text-white/85">{other.teaser}</span>
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
