import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SimpleEnquiryForm } from "@/components/forms/SimpleEnquiryForm";
import type { SimpleEnquiryField } from "@/lib/simple-enquiry";
import { Phone, Mail, Navigation } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { JsonLd } from "@/components/JsonLd";
import { BANC_OFFICES } from "@/lib/banc-content/contact";
import {
  breadcrumbJsonLd,
  CUFFLEY_ADDRESS,
  CUFFLEY_GEO,
  officeJsonLd,
} from "@/lib/schema-org";
import { BANC_CONTACT } from "@/lib/banc-contact";
import { PageBand } from "@/components/PageBand";
import { cn } from "@/lib/utils";
import {
  actionPrimaryOnDark,
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
    office: BANC_OFFICES.cuffley,
    path: "/offices/cuffley",
    address: CUFFLEY_ADDRESS,
    geo: CUFFLEY_GEO,
    description:
      "Banc Property Group's Cuffley office at 1 Station Road — independent estate agents serving Cuffley, Goffs Oak, Potters Bar and surrounding Hertfordshire villages.",
  }),
  breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Offices", path: "/offices" },
    { name: BANC_OFFICES.cuffley.title, path: "/offices/cuffley" },
  ]),
];

const APPOINTMENT_FIELDS: SimpleEnquiryField[] = [
  { name: "firstName", label: "First Name", type: "text", placeholder: "John", required: true, span: "half" },
  { name: "lastName", label: "Last Name", type: "text", placeholder: "Smith", required: true, span: "half" },
  { name: "phone", label: "Phone Number", type: "tel", placeholder: BANC_CONTACT.displayPhone, required: true, span: "half" },
  { name: "email", label: "Email Address", type: "email", placeholder: "john@example.com", required: true, span: "half" },
  { name: "propertyAddress", label: "Property Address (if applicable)", type: "text", placeholder: "1 Station Road, Cuffley, EN6 4HU" },
  {
    name: "discuss",
    label: "What would you like to discuss?",
    type: "select",
    placeholder: "Select a service...",
    required: true,
    options: [
      "Free Property Valuation",
      "Selling My Property",
      "Letting My Property",
      "Buying a Property",
      "Renting a Property",
      "Property Management",
      "Other",
    ],
  },
  { name: "preferredTime", label: "Preferred Date & Time", type: "datetime-local" },
  { name: "message", label: "Additional Message", type: "textarea", placeholder: "Tell us more about your requirements..." },
];

export const metadata: Metadata = withPageDefaults("/offices/cuffley", {
  title: "Cuffley Office | Banc Property Group",
  description: "Visit our Cuffley office at 1 Station Road, Cuffley, EN6 4HU. Expert estate agents serving Cuffley, Goffs Oak and surrounding Hertfordshire areas.",
  keywords: "cuffley estate agent, 1 station road cuffley, banc property cuffley, estate agent EN6",
});

// Team members at Cuffley office
const teamMembers = [
  {
    name: "Nitesh Bheda",
    role: "Director",
    image: "/images/team/nitesh-bheda-headshot-clay.jpg",
    phone: "07850 082541",
    email: "nitesh@bancproperty.com"
  },
  {
    name: "Andrew Crump",
    role: "Director",
    image: "/images/team/andrew-crump-headshot-clay.jpg",
    phone: "07565 543153",
    email: "andrew@bancproperty.com"
  },
  {
    name: "Vicki Glashier",
    role: "Office Manager",
    image: "/images/team/vicki-glashier-headshot-source-clay.jpg",
    phone: BANC_CONTACT.displayPhone,
    email: "vicki@bancproperty.com"
  },
  {
    name: "Kay Stanley",
    role: "Sales Progressor",
    image: "/images/team/kay-stanley-headshot-source-clay.jpg",
    phone: BANC_CONTACT.displayPhone,
    email: "kay@bancproperty.com"
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
  "Cuffley",
  "Goffs Oak",
  "Brookmans Park",
  "Northaw",
  "Potters Bar",
  "Cheshunt",
  "Waltham Cross",
  "Enfield",
  "Barnet",
  "Hertford",
];

const detailRow = "flex min-h-12 items-center justify-between gap-6 border-b border-banc-dark/15 py-2";
const detailValue = "text-right text-sm font-medium text-banc-dark-deep";
const detailLink = cn(
  detailValue,
  "inline-flex min-h-11 items-center underline-offset-4 transition-colors hover:text-banc-focus hover:underline",
);
const blockHeading = "text-xl font-semibold text-banc-dark-deep";

export default function CuffleyOfficePage() {
  return (
    <div className="min-h-screen bg-banc-grey-pale">
      <JsonLd data={officeStructuredData} />
      <Header />

      {/* The claymation Cuffley shopfront without the team figures —
          Nitesh asked for the empty shop on this page (8 Sep). */}
      <PageBand
        eyebrow="Head Office"
        title="Cuffley Office"
        lede="Our flagship office in the heart of Cuffley village, serving the local community and surrounding Hertfordshire areas with expert property services."
        back={{ href: "/offices", label: "All offices" }}
        image={{ src: "/images/team/banc-shopfront-clay.jpg", alt: "", priority: true, position: "object-[center_35%]", scrim: "light" }}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="https://maps.google.com/?q=1+Station+Road+Cuffley+EN6+4HU"
            target="_blank"
            rel="noopener noreferrer"
            className={actionPrimaryOnDark}
          >
            <Navigation className="h-4 w-4" aria-hidden="true" />
            Get Directions
          </a>
          <Link href="#appointment" className={actionSecondaryOnDark}>
            Book Appointment
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
                <a href={BANC_CONTACT.callHref} className={detailLink}>
                  {BANC_CONTACT.displayPhone}
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
              <dt className={eyebrow}>Visit us</dt>
              <dd className={detailValue}>1 Station Road, Cuffley, EN6 4HU</dd>
            </div>
          </dl>

          <div className="relative h-72 overflow-hidden rounded-[var(--radius-md)] border border-banc-line lg:h-96">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2468.775123456789!2d-0.1083!3d51.7079!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4876383e5f5f5f5f%3A0x5f5f5f5f5f5f5f5f!2s1%20Station%20Rd%2C%20Cuffley%2C%20Potters%20Bar%20EN6%204HU!5e0!3m2!1sen!2suk!4v1234567890"
              title="Map of the Cuffley office"
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

      {/* Office Info Grid */}
      <section className={cn(sectionPadding, "border-t border-banc-dark/15")}>
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
            </div>
            <div>
              <h2 className={blockHeading}>Parking & Transport</h2>
              <ul className="mt-4 border-t border-banc-dark/15">
                <li className="border-b border-banc-dark/15 py-4">
                  <p className="font-medium text-banc-dark-deep">Free Parking</p>
                  <p className="mt-1 text-sm text-banc-muted-readable">Free parking available directly outside our office on Station Road</p>
                </li>
                <li className="border-b border-banc-dark/15 py-4">
                  <p className="font-medium text-banc-dark-deep">Train Station</p>
                  <p className="mt-1 text-sm text-banc-muted-readable">Cuffley Station is just a 2-minute walk from our office</p>
                </li>
                <li className="border-b border-banc-dark/15 py-4">
                  <p className="font-medium text-banc-dark-deep">Easy Access</p>
                  <p className="mt-1 text-sm text-banc-muted-readable">Located in the centre of Cuffley village, easy to find</p>
                </li>
              </ul>
            </div>
            <div>
              <h2 className={blockHeading}>Areas We Cover</h2>
              <p className="mt-4 border-t border-banc-dark/15 pt-4 text-sm leading-relaxed text-banc-dark-deep">
                {areasCovered.join(" · ")}
              </p>
              <p className="mt-4 text-sm text-banc-muted-readable">
                And many more surrounding Hertfordshire and North London areas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className={cn(sectionPadding, "banc-dark-surface bg-banc-dark-deep text-white")}>
        <div className="mx-auto max-w-7xl">
          <p className={eyebrowOnDark}>Our Team</p>
          <h2 className={cn(sectionHeadingOnDark, "mt-3")}>Meet the Cuffley Team</h2>
          <p className="mt-4 max-w-2xl text-white/70 lg:text-lg">
            Our experienced professionals are here to help you with all your property needs.
          </p>

          <div className="mt-7 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member) => (
              <div key={member.name}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-md)]">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{member.name}</h3>
                <p className="text-sm text-white/70">{member.role}</p>
                <div className="mt-2 flex flex-col items-start">
                  <a href={`tel:${member.phone.replace(/\s/g, '')}`} className="inline-flex min-h-11 items-center gap-2 text-sm text-white/70 transition-colors hover:text-white">
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    {member.phone}
                  </a>
                  <a href={`mailto:${member.email}`} className="inline-flex min-h-11 items-center gap-2 break-all text-sm text-white/70 transition-colors hover:text-white">
                    <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {member.email}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Book Appointment Section */}
      <section id="appointment" className={cn(sectionPadding, "scroll-mt-24")}>
        <div className="mx-auto max-w-7xl">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Left side - Info */}
            <div>
              <p className={eyebrow}>Book an Appointment</p>
              <h2 className={cn(sectionHeading, "mt-3")}>Visit Our Cuffley Office</h2>
              <p className="mt-4 text-banc-muted-readable lg:text-lg">
                Book a free, no-obligation appointment to discuss your property needs.
                Whether you&apos;re selling, letting, buying, or renting, we&apos;re here to help.
              </p>

              <ul className="mt-7 border-t border-banc-dark/15">
                <li className="border-b border-banc-dark/15 py-4">
                  <h3 className="font-semibold text-banc-dark-deep">Free Valuation</h3>
                  <p className="mt-1 text-sm text-banc-muted-readable">Get an accurate market appraisal of your property with no obligation.</p>
                </li>
                <li className="border-b border-banc-dark/15 py-4">
                  <h3 className="font-semibold text-banc-dark-deep">Expert Advice</h3>
                  <p className="mt-1 text-sm text-banc-muted-readable">Speak directly with our experienced directors and senior negotiators.</p>
                </li>
                <li className="border-b border-banc-dark/15 py-4">
                  <h3 className="font-semibold text-banc-dark-deep">Flexible Times</h3>
                  <p className="mt-1 text-sm text-banc-muted-readable">We offer appointments including evenings and weekends to suit your schedule.</p>
                </li>
              </ul>
            </div>

            {/* Right side - Form */}
            <div className={formPanel}>
              <h3 className="mb-6 text-xl font-semibold text-banc-dark-deep">Request an Appointment</h3>

              <SimpleEnquiryForm
                fields={APPOINTMENT_FIELDS}
                subject="Appointment request — Cuffley office — {discuss}"
                intro="Appointment request from the Cuffley office page."
                submitLabel="Request Appointment"
                successTitle="Request received"
                successBody="Thank you. The Cuffley office will be in touch to confirm a time that suits you."
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
