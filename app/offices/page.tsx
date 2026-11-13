import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageBand } from "@/components/PageBand";
import { ArrowRight, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { BANC_CONTACT, BANC_MAYFAIR_CONTACT } from "@/lib/banc-contact";
import { cn } from "@/lib/utils";
import {
  actionPrimary,
  actionPrimaryOnDark,
  actionSecondary,
  actionSecondaryOnDark,
  eyebrow,
  eyebrowOnDark,
  sectionHeading,
  sectionHeadingOnDark,
  sectionPadding,
} from "@/components/ui/form-styles";

export const metadata: Metadata = withPageDefaults("/offices", {
  title: "Our Offices | Banc Property Group",
  description: "Visit our offices in Cuffley, Hertfordshire and Mayfair, London. Expert estate agents providing premium property services across Hertfordshire and Central London.",
  keywords: "banc property offices, estate agent cuffley, estate agent mayfair, property agents hertfordshire, london property agents",
});

export const revalidate = 3600;

const offices = [
  {
    id: "cuffley",
    name: "Cuffley Office",
    type: "Head Office",
    address: "1 Station Road, Cuffley, EN6 4HU",
    phone: BANC_CONTACT.displayPhone,
    email: "info@bancproperty.com",
    hours: "Mon-Sat: 9am-5:30pm",
    description: "Our flagship office in the heart of Cuffley village, serving the local community and surrounding Hertfordshire areas.",
    features: ["Free Parking", "Near Station", "4 Team Members"],
    image: "https://images.unsplash.com/photo-1732983989209-ae2fa3d1a9fc?auto=format&fit=crop&w=800&q=80",
    link: "/offices/cuffley",
  },
  {
    id: "mayfair",
    name: "Mayfair Office",
    type: "Premier Homes",
    address: "121 Park Lane, Mayfair, W1K 7AG",
    phone: BANC_MAYFAIR_CONTACT.displayPhone,
    email: "info@bancproperty.com",
    hours: "Mon-Sat: 9am-5:30pm",
    description: "Specialising in prime central London properties, discreet marketing for high-value homes.",
    features: ["Prime Location", "Private Consultations", "Global Network"],
    image: "https://images.unsplash.com/photo-1739545886530-bc03557aca61?auto=format&fit=crop&w=800&q=80",
    link: "/offices/mayfair",
  }
];

const CUFFLEY_AREAS = ["Cuffley", "Goffs Oak", "Brookmans Park", "Northaw", "Potters Bar", "Cheshunt", "Enfield", "Barnet", "Hertford"];
const MAYFAIR_AREAS = ["Mayfair", "Belgravia", "Knightsbridge", "Kensington", "Chelsea", "Marylebone", "St James's", "Westminster"];

const detailRow = "flex min-h-12 items-center justify-between gap-6 border-b border-banc-dark/15 py-2";
const detailValue = "text-right text-sm text-banc-dark-deep";
const detailLink = cn(
  detailValue,
  "inline-flex min-h-11 items-center underline-offset-4 transition-colors hover:text-banc-focus hover:underline",
);

export default function OfficesPage() {
  return (
    <div className="min-h-screen bg-banc-grey-pale">
      <Header />

      <PageBand
        eyebrow="Visit Us"
        title="Our Offices"
        lede={
          <>
            Visit us at one of our two locations. Whether you&apos;re in Hertfordshire or Central London,
            our experienced team is ready to help with all your property needs.
          </>
        }
        image={{
          src: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1920&q=80",
          alt: "",
          priority: true,
        }}
      />

      {/* Offices Grid */}
      <section className={sectionPadding}>
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-10">
          {offices.map((office) => (
            <article key={office.id}>
              <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-md)]">
                <Image
                  src={office.image}
                  alt={office.name}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>

              <p className={cn(eyebrow, "mt-6")}>{office.type}</p>
              <h2 className={cn(sectionHeading, "mt-3")}>{office.name}</h2>
              <p className="mt-4 text-banc-muted-readable">{office.description}</p>

              <dl className="mt-6 border-t border-banc-dark/15">
                <div className={detailRow}>
                  <dt className={eyebrow}>Address</dt>
                  <dd className={detailValue}>{office.address}</dd>
                </div>
                <div className={detailRow}>
                  <dt className={eyebrow}>Phone</dt>
                  <dd>
                    <a href={`tel:${office.phone.replace(/\s/g, '')}`} className={detailLink}>
                      {office.phone}
                    </a>
                  </dd>
                </div>
                <div className={detailRow}>
                  <dt className={eyebrow}>Email</dt>
                  <dd>
                    <a href={`mailto:${office.email}`} className={detailLink}>
                      {office.email}
                    </a>
                  </dd>
                </div>
                <div className={detailRow}>
                  <dt className={eyebrow}>Hours</dt>
                  <dd className={detailValue}>{office.hours}</dd>
                </div>
              </dl>

              <p className="mt-4 text-sm text-banc-muted-readable">{office.features.join(" · ")}</p>

              <Link href={office.link} className={cn(actionPrimary, "mt-6")}>
                Visit Office Page
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Nearest Office Helper */}
      <section className={cn(sectionPadding, "border-t border-banc-dark/15")}>
        <div className="mx-auto max-w-7xl">
          <p className={eyebrow}>Find Your Nearest Office</p>
          <h2 className={cn(sectionHeading, "mt-3")}>Which Office is Right for You?</h2>

          <div className="mt-7 grid gap-10 md:grid-cols-2">
            {/* Cuffley areas */}
            <div className="border-t border-banc-dark/15 pt-6">
              <h3 className="text-xl font-semibold text-banc-dark-deep">Cuffley Office</h3>
              <p className="mt-1 text-sm text-banc-muted-readable">Hertfordshire & North London</p>

              <p className="mt-4 text-banc-muted-readable">
                Visit our Cuffley office if you&apos;re looking to buy, sell, let, or rent
                in the following areas:
              </p>

              <p className="mt-4 text-sm leading-relaxed text-banc-dark-deep">{CUFFLEY_AREAS.join(" · ")}</p>

              <Link href="/offices/cuffley" className={cn(actionSecondary, "mt-6")}>
                Visit Cuffley Office
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            {/* Mayfair areas */}
            <div className="border-t border-banc-dark/15 pt-6">
              <h3 className="text-xl font-semibold text-banc-dark-deep">Mayfair Office</h3>
              <p className="mt-1 text-sm text-banc-muted-readable">Prime Central London</p>

              <p className="mt-4 text-banc-muted-readable">
                Contact our Mayfair office for premium properties valued at £1 million
                and above in London&apos;s most prestigious areas:
              </p>

              <p className="mt-4 text-sm leading-relaxed text-banc-dark-deep">{MAYFAIR_AREAS.join(" · ")}</p>

              <Link href="/offices/mayfair" className={cn(actionSecondary, "mt-6")}>
                Visit Mayfair Office
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact Section */}
      <section className={cn(sectionPadding, "banc-dark-surface bg-banc-dark-deep text-white")}>
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className={eyebrowOnDark}>Get in Touch</p>
            <h2 className={cn(sectionHeadingOnDark, "mt-3")}>Can&apos;t Visit in Person?</h2>
            <p className="mt-4 text-white/70 lg:text-lg">
              We&apos;re always available by phone or email. Our team is ready to answer
              your questions and help you with your property needs.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href={BANC_CONTACT.callHref} className={actionPrimaryOnDark}>
                <Phone className="h-4 w-4" aria-hidden="true" />
                {BANC_CONTACT.displayPhone}
              </a>
              <Link href="/contact" className={actionSecondaryOnDark}>
                Contact Form
              </Link>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-x-8 self-start border-t border-white/15">
            {[
              { value: "4+", label: "Team Members" },
              { value: "2", label: "Office Locations" },
              { value: "6", label: "Days Per Week" },
              { value: "20+", label: "Areas Covered" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse border-b border-white/15 py-5">
                <dt className="mt-1 text-sm text-white/70">{stat.label}</dt>
                <dd className="font-display text-3xl font-light text-white">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Footer />
    </div>
  );
}
