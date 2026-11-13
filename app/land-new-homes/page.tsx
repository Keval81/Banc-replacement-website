import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageBand } from "@/components/PageBand";
import {
  actionPrimaryOnDark,
  actionSecondaryOnDark,
  eyebrow,
  eyebrowOnDark,
  sectionHeading,
  sectionHeadingOnDark,
  sectionPadding,
} from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";
import { Phone, Mail, ArrowRight, Shield, Clock, CheckCircle2 } from "lucide-react";
import { BANC_CONTACT } from "@/lib/banc-contact";

export const metadata: Metadata = withPageDefaults("/land-new-homes", {
  title: "Land & New Homes | Banc Property Services",
  description: "Specialist land and new homes services in North London and Hertfordshire. Expert marketing campaigns for new property developments and land acquisition.",
  keywords: "land acquisition, new homes, property development, marketing campaigns, North London, Hertfordshire, developers, builders",
  openGraph: {
    title: "Land & New Homes | Banc Property Services",
    description: "Expert marketing campaigns for new property developments across North London and Hertfordshire.",
    type: "website",
  },
});

export const revalidate = 3600;

const contactRow =
  "flex min-h-11 flex-col justify-center border-t border-white/15 py-4 transition-colors duration-200 hover:border-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--banc-focus-dark)]";

export default function LandNewHomesPage() {
  return (
    <div className="min-h-screen bg-banc-grey-pale">
      <Header />

      <PageBand
        eyebrow="Premium Development Services"
        title="Land & New Homes"
        lede="Expert marketing campaigns for new property developments and land opportunities across North London and Hertfordshire. Partner with specialists who understand the developer mindset."
        image={{
          src: "https://images.unsplash.com/photo-1783858828529-6f5354095c60?w=1920&q=80",
          alt: "Modern architectural development",
          priority: true,
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <a href="#contact" className={actionPrimaryOnDark}>
            <Phone className="h-4 w-4" aria-hidden="true" />
            Discuss Your Project
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <a href="#services" className={actionSecondaryOnDark}>
            Explore Services
          </a>
        </div>

        {/* Trust Indicators */}
        <ul className="mt-8 flex flex-col gap-x-8 gap-y-2 border-t border-white/15 pt-5 text-sm text-white/70 sm:flex-row">
          {["Bespoke Campaigns", "Local Expertise", "Proven Results"].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--banc-focus-dark)]" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </PageBand>

      {/* Section 1: Land & New Homes - Image Left, Text Right */}
      <section id="services" className={cn(sectionPadding, "scroll-mt-24")}>
        <div className="mx-auto max-w-7xl">
          <div className="grid items-start gap-7 lg:grid-cols-2 lg:gap-16">
            {/* Image Side */}
            <figure>
              <img
                src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80"
                alt="Contemporary apartment development"
                className="aspect-[4/3] w-full rounded-[var(--radius-md)] object-cover"
              />
              <figcaption className="mt-4 grid grid-cols-3 gap-x-4 border-t border-banc-dark/15 pt-4">
                <div>
                  <p className="text-sm font-semibold text-banc-dark-deep">New Homes</p>
                  <p className="text-xs text-banc-muted-readable">Marketing</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-banc-dark-deep">Land</p>
                  <p className="text-xs text-banc-muted-readable">Acquisition</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-banc-dark-deep">Director</p>
                  <p className="text-xs text-banc-muted-readable">Led Service</p>
                </div>
              </figcaption>
            </figure>

            {/* Content Side */}
            <div>
              <p className={eyebrow}>Development Services</p>
              <h2 className={cn(sectionHeading, "mt-3")}>Land &amp; New Homes</h2>

              <div className="mt-7 space-y-5 text-base leading-relaxed text-banc-dark-mid lg:text-lg">
                <p>
                  The directors at Banc have a wealth of experience in providing marketing
                  campaigns for new property developments in North London and Hertfordshire.
                  With years of experience in establishing bespoke campaigns for our clients,
                  we have the skills and local knowledge required to get the most out of your
                  new developments.
                </p>
                <p>
                  We offer a comprehensive service when promoting your new home, working
                  closely with you to ensure your properties gain the level of exposure
                  needed to create a swift and effective return on your investment.
                </p>
                <p>
                  We have experience working with a wide range of clients including builders,
                  developers and private investors across the Hertfordshire area. Whether you
                  are developing a block of contemporary apartments, an individual bespoke
                  home or a collection of new houses, please contact us to find out how we
                  can provide you with a campaign that will be tailored to your needs.
                </p>
                <p className="font-medium text-banc-dark-deep">
                  In addition we can offer strategic advice right the way through from planning
                  stages to implementation of a prolific and successful campaign.
                </p>
              </div>

              {/* Feature List */}
              <ul className="mt-7 grid gap-x-8 sm:grid-cols-2">
                {[
                  "Bespoke Marketing Campaigns",
                  "Strategic Planning Advice",
                  "Maximum Property Exposure",
                  "Local Market Expertise"
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 border-t border-banc-dark/15 py-3">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-banc-focus" aria-hidden="true" />
                    <span className="text-sm font-medium text-banc-dark-mid">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Land Acquisition - Text Left, Image Right */}
      <section className={cn(sectionPadding, "bg-white")}>
        <div className="mx-auto max-w-7xl">
          <div className="grid items-start gap-7 lg:grid-cols-2 lg:gap-16">
            {/* Content Side */}
            <div className="order-2 lg:order-1">
              <p className={eyebrow}>Land Opportunities</p>
              <h2 className={cn(sectionHeading, "mt-3")}>Land Acquisition</h2>

              <div className="mt-7 space-y-5 text-base leading-relaxed text-banc-dark-mid lg:text-lg">
                <p>
                  We care about our local area and the people in the area. Our land department
                  exists to provide expert advice to those who own land and property where there
                  may be the possibility of development or redevelopment.
                </p>
                <p>
                  We work hard with land owners and land buyers, helping us to build strong
                  long standing relationships across our local communities.
                </p>
                <p className="font-medium text-banc-dark-deep">
                  If you have a property or land which you think could have development potential,
                  we would be delighted to hear from you.
                </p>
              </div>

              {/* Contact Highlight */}
              <div className="mt-7 border-t border-banc-dark/15 pt-6">
                <p className="leading-relaxed text-banc-dark-mid">
                  Please call <strong className="text-banc-dark-deep">Nitesh Bheda</strong> or <strong className="text-banc-dark-deep">Andrew Crump</strong> on <a href={BANC_CONTACT.callHref} className="text-banc-focus font-semibold hover:underline">{BANC_CONTACT.displayPhone}</a> alternatively email <a href="mailto:nitesh@bancproperty.com" className="text-banc-focus hover:underline">nitesh@bancproperty.com</a> or <a href="mailto:andrew@bancproperty.com" className="text-banc-focus hover:underline">andrew@bancproperty.com</a> to discuss your enquiry.
                </p>
              </div>

              {/* Confidentiality note */}
              <p className="mt-6 flex items-start gap-3 border-t border-banc-dark/15 pt-6 text-sm font-medium text-banc-dark-deep">
                <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-banc-focus" aria-hidden="true" />
                All conversations strictly confidential &amp; without obligation
              </p>
            </div>

            {/* Image Side */}
            <figure className="order-1 lg:order-2">
              <img
                src="https://images.unsplash.com/photo-1448630360428-65456885c650?w=1200&q=80"
                alt="Land development opportunity"
                className="aspect-[4/3] w-full rounded-[var(--radius-md)] object-cover"
              />
              <figcaption className="mt-4 border-t border-banc-dark/15 pt-4">
                <p className="text-sm font-semibold text-banc-dark-deep">Local Expertise</p>
                <p className="mt-1 text-sm text-banc-muted-readable">Deep knowledge of North London and Hertfordshire development opportunities</p>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Dark Contact CTA Section */}
      <section id="contact" className={cn(sectionPadding, "banc-dark-surface scroll-mt-24 bg-banc-dark-deep text-white")}>
        <div className="mx-auto max-w-7xl">
          <p className={eyebrowOnDark}>Get In Touch</p>
          <h2 className={cn(sectionHeadingOnDark, "mt-3")}>
            Contact Our Land<br />&amp; New Homes Team
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 lg:text-lg">
            Ready to discuss your development project? Our specialists are here to help
            maximise your investment potential.
          </p>

          {/* Contact rows */}
          <div className="mt-7 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
            <a href={BANC_CONTACT.callHref} className={contactRow}>
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/70">Call Us</span>
              <span className="mt-1 text-lg font-semibold text-white">{BANC_CONTACT.displayPhone}</span>
            </a>
            <a href="mailto:nitesh@bancproperty.com" className={contactRow}>
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/70">Nitesh Bheda</span>
              <span className="mt-1 truncate text-sm font-semibold text-white">nitesh@bancproperty.com</span>
            </a>
            <a href="mailto:andrew@bancproperty.com" className={contactRow}>
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/70">Andrew Crump</span>
              <span className="mt-1 truncate text-sm font-semibold text-white">andrew@bancproperty.com</span>
            </a>
            <div className="flex flex-col justify-center border-t border-white/15 py-4">
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/70">Our Promise</span>
              <span className="mt-1 text-lg font-semibold text-white">Strictly Confidential</span>
              <span className="mt-1 text-sm text-white/70">All conversations without obligation</span>
            </div>
          </div>

          {/* Response time */}
          <p className="mt-6 flex items-start gap-3 text-sm text-white/80">
            <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--banc-focus-dark)]" aria-hidden="true" />
            <span>We aim to respond to all enquiries within <span className="font-semibold text-white">24 hours</span></span>
          </p>

          {/* Main CTA Buttons */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a href={BANC_CONTACT.callHref} className={actionPrimaryOnDark}>
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call Now
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href="mailto:nitesh@bancproperty.com" className={actionSecondaryOnDark}>
              <Mail className="h-4 w-4" aria-hidden="true" />
              Email Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
