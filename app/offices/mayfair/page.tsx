import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SimpleEnquiryForm } from "@/components/forms/SimpleEnquiryForm";
import type { SimpleEnquiryField } from "@/lib/simple-enquiry";
import { Phone, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { JsonLd } from "@/components/JsonLd";
import { BANC_OFFICES } from "@/lib/banc-content/contact";
import {
  breadcrumbJsonLd,
  MAYFAIR_ADDRESS,
  officeJsonLd,
} from "@/lib/schema-org";
import { BANC_MAYFAIR_CONTACT } from "@/lib/banc-contact";
import { PageBand } from "@/components/PageBand";
import { cn } from "@/lib/utils";
import {
  actionPrimaryOnDark,
  actionSecondary,
  actionSecondaryOnDark,
  eyebrow,
  eyebrowOnDark,
  formPanel,
  sectionHeading,
  sectionHeadingOnDark,
  sectionPadding,
} from "@/components/ui/form-styles";

export const revalidate = 3600;

const officeStructuredData = [
  officeJsonLd({
    office: BANC_OFFICES.mayfair,
    path: "/offices/mayfair",
    address: MAYFAIR_ADDRESS,
    description:
      "Banc Property Group's Mayfair office at 121 Park Lane — prime central London sales and lettings.",
  }),
  breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Offices", path: "/offices" },
    { name: BANC_OFFICES.mayfair.title, path: "/offices/mayfair" },
  ]),
];

const CONSULTATION_FIELDS: SimpleEnquiryField[] = [
  { name: "firstName", label: "First Name", type: "text", placeholder: "John", required: true, span: "half" },
  { name: "lastName", label: "Last Name", type: "text", placeholder: "Smith", required: true, span: "half" },
  { name: "phone", label: "Phone Number", type: "tel", placeholder: "+44 20 7123 4567", required: true, span: "half" },
  { name: "email", label: "Email Address", type: "email", placeholder: "john@example.com", required: true, span: "half" },
  { name: "propertyAddress", label: "Property Address", type: "text", placeholder: "Property address or area of interest" },
  {
    name: "propertyValue",
    label: "Estimated Property Value",
    type: "select",
    placeholder: "Select value range...",
    options: ["£1,000,000 - £2,000,000", "£2,000,000 - £3,000,000", "£3,000,000 - £5,000,000", "£5,000,000+"],
  },
  {
    name: "message",
    label: "Message",
    type: "textarea",
    placeholder: "Please provide any additional details about your requirements...",
  },
];

export const metadata: Metadata = withPageDefaults("/offices/mayfair", {
  title: "Mayfair Office | Banc Property Group",
  description: "Visit our Mayfair office in the heart of London's luxury property district. Expert estate agents specialising in prime central London properties.",
  keywords: "mayfair estate agent, london property agent, prime central london, luxury property mayfair, banc mayfair",
});

// Team members at Mayfair office
const teamMembers = [
  {
    name: "Nitesh Bheda",
    role: "Director - London",
    image: "/images/team/nitesh-bheda-headshot-clay.jpg",
    phone: "07850 082541",
    email: "nitesh@bancproperty.com"
  },
  {
    name: "Andrew Crump",
    role: "Director - Premier Homes",
    image: "/images/team/andrew-crump-headshot-clay.jpg",
    phone: "07565 543153",
    email: "andrew@bancproperty.com"
  }
];

// Opening hours
const openingHours = [
  { day: "Monday", hours: "9:00 AM - 5:30 PM" },
  { day: "Tuesday", hours: "9:00 AM - 5:30 PM" },
  { day: "Wednesday", hours: "9:00 AM - 5:30 PM" },
  { day: "Thursday", hours: "9:00 AM - 5:30 PM" },
  { day: "Friday", hours: "9:00 AM - 5:30 PM" },
  { day: "Saturday", hours: "9:00 AM - 5:30 PM" },
  { day: "Sunday", hours: "Closed" },
];

// Areas covered
const areasCovered = [
  "Mayfair",
  "Belgravia",
  "Knightsbridge",
  "Kensington",
  "Chelsea",
  "Marylebone",
  "St James's",
  "Westminster",
  "Hyde Park",
  "Notting Hill",
];

const detailRow = "flex min-h-12 items-center justify-between gap-6 border-b border-banc-dark/15 py-2";
const detailValue = "text-right text-sm font-medium text-banc-dark-deep";
const detailLink = cn(
  detailValue,
  "inline-flex min-h-11 items-center underline-offset-4 transition-colors hover:text-banc-focus hover:underline",
);
const blockHeading = "text-xl font-semibold text-banc-dark-deep";

export default function MayfairOfficePage() {
  return (
    <div className="min-h-screen bg-banc-grey-pale">
      <JsonLd data={officeStructuredData} />
      <Header />

      <PageBand
        eyebrow="Premier Homes · Premium Property Specialists"
        title="Mayfair Office"
        lede={
          <>
            Our Mayfair office specialises in prime central London properties,
            discreet marketing for high-value homes, and bespoke services for
            discerning buyers and sellers in London&apos;s most prestigious locations.
          </>
        }
        back={{ href: "/offices", label: "All offices" }}
        image={{
          src: "https://images.unsplash.com/photo-1617606796212-4c99a14a116e?auto=format&fit=crop&w=1920&q=80",
          alt: "Mayfair Office",
          priority: true,
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/premier-homes" className={actionPrimaryOnDark}>
            Premier Homes
          </Link>
          <Link href="#appointment" className={actionSecondaryOnDark}>
            Private Consultation
          </Link>
        </div>
      </PageBand>

      {/* Contact details and map */}
      <section className={sectionPadding}>
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:gap-16">
          <dl className="self-start border-t border-banc-dark/15">
            <div className={detailRow}>
              <dt className={eyebrow}>Call us</dt>
              <dd>
                <a href={BANC_MAYFAIR_CONTACT.callHref} className={detailLink}>
                  {BANC_MAYFAIR_CONTACT.displayPhone}
                </a>
              </dd>
            </div>
            <div className={detailRow}>
              <dt className={eyebrow}>Email us</dt>
              <dd>
                <a href="mailto:info@bancproperty.com" className={detailLink}>
                  info@bancproperty.com
                </a>
              </dd>
            </div>
            <div className={detailRow}>
              <dt className={eyebrow}>Visit us by appointment</dt>
              <dd className={detailValue}>121 Park Lane, Mayfair, W1K 7AG</dd>
            </div>
          </dl>

          <div className="relative h-72 overflow-hidden rounded-[var(--radius-md)] border border-banc-line lg:h-96">
            <iframe
              src="https://www.google.com/maps?q=121+Park+Lane,+Mayfair,+London+W1K+7AG&output=embed"
              title="Map of the Mayfair office"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
            />
          </div>
        </div>
      </section>

      {/* Premier Services Banner */}
      <section className="border-y border-banc-dark/15 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-banc-dark-deep">Banc Premier Homes</h2>
            <p className="mt-1 text-banc-muted-readable">Exclusive marketing for properties £1 million+</p>
          </div>
          <Link href="/premier-homes" className={actionSecondary}>
            Learn More
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Office Info Grid */}
      <section className={sectionPadding}>
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-3">
            <div>
              <h2 className={blockHeading}>Opening Hours</h2>
              <dl className="mt-4 border-t border-banc-dark/15">
                {openingHours.map((item) => (
                  <div key={item.day} className={detailRow}>
                    <dt className="text-sm text-banc-dark-mid">{item.day}</dt>
                    <dd className={item.hours === 'Closed' ? "text-sm text-banc-muted-readable" : detailValue}>
                      {item.hours}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-sm text-banc-muted-readable">
                Private appointments available outside standard hours.
              </p>
            </div>
            <div>
              <h2 className={blockHeading}>Location & Access</h2>
              <ul className="mt-4 border-t border-banc-dark/15">
                <li className="border-b border-banc-dark/15 py-4">
                  <p className="font-medium text-banc-dark-deep">Tube Stations</p>
                  <p className="mt-1 text-sm text-banc-muted-readable">Green Park, Hyde Park Corner, and Bond Street stations within walking distance</p>
                </li>
                <li className="border-b border-banc-dark/15 py-4">
                  <p className="font-medium text-banc-dark-deep">Parking</p>
                  <p className="mt-1 text-sm text-banc-muted-readable">Metered street parking and nearby NCP car parks available</p>
                </li>
                <li className="border-b border-banc-dark/15 py-4">
                  <p className="font-medium text-banc-dark-deep">Private Consultations</p>
                  <p className="mt-1 text-sm text-banc-muted-readable">Meetings by appointment at our Mayfair location or at your property</p>
                </li>
              </ul>
            </div>
            <div>
              <h2 className={blockHeading}>Prime Areas Covered</h2>
              <p className="mt-4 border-t border-banc-dark/15 pt-4 text-sm leading-relaxed text-banc-dark-deep">
                {areasCovered.join(" · ")}
              </p>
              <p className="mt-4 text-sm text-banc-muted-readable">
                Covering all prime central London locations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Premier Services Section */}
      <section className={cn(sectionPadding, "banc-dark-surface bg-banc-dark-deep text-white")}>
        <div className="mx-auto max-w-7xl">
          <p className={eyebrowOnDark}>Premier Service</p>
          <h2 className={cn(sectionHeadingOnDark, "mt-3")}>Luxury Property Specialists</h2>
          <p className="mt-4 max-w-2xl text-white/70 lg:text-lg">
            Discreet, bespoke marketing for exceptional properties.
          </p>

          <div className="mt-7 grid gap-x-10 md:grid-cols-3">
            {[
              {
                title: "Discreet Marketing",
                description: "Private listings and off-market sales for clients who value confidentiality.",
              },
              {
                title: "Global Network",
                description: "Access to international buyers through our partnership networks.",
              },
              {
                title: "Premium Presentation",
                description: "Professional photography, videography, and bespoke marketing materials.",
              }
            ].map((service) => (
              <div key={service.title} className="border-t border-white/15 py-6">
                <h3 className="text-xl font-semibold text-white">{service.title}</h3>
                <p className="mt-2 text-white/70">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className={sectionPadding}>
        <div className="mx-auto max-w-7xl">
          <p className={eyebrow}>Our London Team</p>
          <h2 className={cn(sectionHeading, "mt-3")}>Meet the Mayfair Team</h2>
          <p className="mt-4 max-w-2xl text-banc-muted-readable lg:text-lg">
            Our directors personally handle all premier properties, ensuring the highest level of service.
          </p>

          <div className="mt-7 grid gap-8 max-w-3xl sm:grid-cols-2">
            {teamMembers.map((member) => (
              <div key={member.name}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-md)]">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(min-width: 640px) 384px, 100vw"
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-banc-dark-deep">{member.name}</h3>
                <p className="text-sm font-medium text-banc-muted-readable">{member.role}</p>
                <div className="mt-2 flex flex-col items-start">
                  <a href={`tel:${member.phone.replace(/\s/g, '')}`} className="inline-flex min-h-11 items-center gap-2 text-sm text-banc-muted-readable transition-colors hover:text-banc-focus">
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    {member.phone}
                  </a>
                  <a href={`mailto:${member.email}`} className="inline-flex min-h-11 items-center gap-2 break-all text-sm text-banc-muted-readable transition-colors hover:text-banc-focus">
                    <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {member.email}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Private Consultation Section */}
      <section id="appointment" className={cn(sectionPadding, "scroll-mt-24 border-t border-banc-dark/15")}>
        <div className="mx-auto max-w-7xl">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Left side - Info */}
            <div>
              <p className={eyebrow}>Private Consultation</p>
              <h2 className={cn(sectionHeading, "mt-3")}>Arrange a Private Consultation</h2>
              <p className="mt-4 text-banc-muted-readable lg:text-lg">
                For properties valued at £1 million and above, we offer a bespoke,
                discreet service tailored to your requirements.
              </p>

              <ul className="mt-7 border-t border-banc-dark/15">
                <li className="border-b border-banc-dark/15 py-4">
                  <h3 className="font-semibold text-banc-dark-deep">Discretion Assured</h3>
                  <p className="mt-1 text-sm text-banc-muted-readable">Private valuations and off-market opportunities available.</p>
                </li>
                <li className="border-b border-banc-dark/15 py-4">
                  <h3 className="font-semibold text-banc-dark-deep">Bespoke Marketing</h3>
                  <p className="mt-1 text-sm text-banc-muted-readable">Tailored campaigns designed specifically for your property.</p>
                </li>
                <li className="border-b border-banc-dark/15 py-4">
                  <h3 className="font-semibold text-banc-dark-deep">Global Reach</h3>
                  <p className="mt-1 text-sm text-banc-muted-readable">Access to qualified buyers from around the world.</p>
                </li>
              </ul>
            </div>

            {/* Right side - Form */}
            <div className={formPanel}>
              <h3 className="mb-2 text-xl font-semibold text-banc-dark-deep">Request Private Consultation</h3>
              <p className="mb-6 text-sm text-banc-muted-readable">
                All enquiries are treated with the strictest confidence.
              </p>

              <SimpleEnquiryForm
                fields={CONSULTATION_FIELDS}
                subject="Private consultation request — Mayfair office"
                intro="Private consultation request from the Mayfair office page."
                submitLabel="Request Private Consultation"
                successTitle="Request received"
                successBody="Thank you. The Mayfair office will be in touch, in confidence, to arrange your consultation."
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
