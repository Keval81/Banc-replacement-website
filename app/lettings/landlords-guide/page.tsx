import type { Metadata } from "next";
import { FEES_TO_LANDLORDS_URL } from "@/lib/banc-contact";
import Link from "next/link";
import { withPageDefaults } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PageBand } from "@/components/PageBand";
import { cn } from "@/lib/utils";
import {
  actionPrimary,
  actionPrimaryOnDark,
  actionSecondaryOnDark,
  eyebrow,
  eyebrowOnDark,
  sectionHeading,
  sectionHeadingOnDark,
  sectionPadding,
} from "@/components/ui/form-styles";
import { ArrowRight } from "lucide-react";
import {
  LANDLORD_BENEFITS,
  LANDLORD_INSURANCE_PRODUCTS,
  LANDLORD_MANAGEMENT_FEATURES,
  LANDLORD_TENANT_PASS_RATE,
  LANDLORDS_GUIDE,
} from "@/lib/banc-content/landlords-guide";

export const metadata: Metadata = withPageDefaults("/lettings/landlords-guide", {
  title: "Landlords Guide | Banc Property Services",
  description: "Bespoke letting solutions for landlords. Expert property management services in Cuffley, Goffs Oak, Cheshunt, Potters Bar and surrounding areas. Property Guild approved agent.",
});

export const revalidate = 3600;

const lettingServices = LANDLORDS_GUIDE.sections[0];
const qualityTenants = LANDLORDS_GUIDE.sections[1];

const darkBand = cn(sectionPadding, "banc-dark-surface bg-banc-dark-deep text-white");
const bodyCopy = "space-y-5 text-banc-muted-readable leading-relaxed lg:text-lg";

export default function LandlordsGuidePage() {
  return (
    <div className="bg-white text-banc-dark-deep min-h-screen">
      <Header />

      <PageBand
        eyebrow="Property Guild Approved"
        title={LANDLORDS_GUIDE.title}
        lede={lettingServices.body[0]}
        image={{
          src: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1920&q=80",
          alt: "",
          priority: true,
        }}
      >
        {/* Both of these went nowhere until 7 Sep. The valuation opens on
            the lettings option; the guide button is the published fee
            schedule, which is what the old site's "download" was. */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/valuation?intent=let" className={actionPrimaryOnDark}>
            Book Free Rental Valuation
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <a href={FEES_TO_LANDLORDS_URL} target="_blank" rel="noopener noreferrer" className={actionSecondaryOnDark}>
            Fees to landlords (PDF)
          </a>
        </div>
      </PageBand>

      {/* Introduction & Coverage Areas */}
      <section className={sectionPadding}>
        <div className="mx-auto max-w-7xl">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Left Column - Main Content */}
            <div>
              <p className={eyebrow}>Introduction</p>
              <h2 className={cn(sectionHeading, "mt-3")}>Expert Letting Services</h2>

              <div className={cn(bodyCopy, "mt-7")}>
                <p>{lettingServices.body[1]}</p>
                <p>{lettingServices.body[2]}</p>
              </div>

              {/* Accreditations */}
              <dl className="mt-8 border-t border-banc-dark/15">
                {[
                  { title: "Property Guild", text: "Approved Agent" },
                  { title: "CMP Protected", text: "Client Money" },
                  { title: "The Property Ombudsman", text: "Redress Scheme" },
                ].map((item) => (
                  <div key={item.title} className="flex items-baseline justify-between gap-6 border-b border-banc-dark/15 py-3">
                    <dt className="text-sm font-semibold text-banc-dark-deep">{item.title}</dt>
                    <dd className="text-right text-sm text-banc-muted-readable">{item.text}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Right Column - Coverage */}
            <div className="border-t border-banc-dark/15 pt-6 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0">
              <h3 className="text-2xl font-semibold">Covering Your Area</h3>

              <p className="mt-4 leading-relaxed text-banc-muted-readable">
                From Apartments, Victorian cottages to Country estates, let our
                lettings department look after your properties of every type,
                size and style there is.
              </p>

              <p className="mt-5 text-sm font-semibold text-banc-dark-deep">
                {["Cuffley", "Goffs Oak", "Cheshunt", "Potters Bar"].join(" · ")}
              </p>

              <p className="mt-5 leading-relaxed text-banc-muted-readable">
                We handle an impressive portfolio of rented properties
                throughout these areas and surrounding locations. Whether you
                are thinking of letting your property for the first time, or
                you are an experienced landlord looking for a new letting
                agent service, our letting team would be delighted to discuss
                your requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Banner - 30% Highlight */}
      <section className={darkBand}>
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16">
            {/* Stat Display */}
            <div>
              <p className={eyebrowOnDark}>Strict Referencing</p>
              <p className="mt-3 font-display text-6xl font-light leading-none text-white lg:text-7xl">30%</p>
              <p className="mt-3 text-xl font-semibold text-white">Pass Rate</p>
              <p className="mt-1 text-white/70">Of applicants approved</p>
            </div>

            {/* Description */}
            <div className="leading-relaxed text-white/80 lg:text-lg">
              <p>
                Our rigorous tenant screening process ensures only the highest
                quality tenants occupy your property. We conduct comprehensive
                background checks including employment verification, credit
                history, and previous landlord references.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Tenants Section */}
      <section className={sectionPadding}>
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Image Side */}
            <figure className="order-2 lg:order-1">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-md)] lg:aspect-[5/4]">
                <img
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80"
                  alt="Quality tenants in a premium rental property"
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="mt-3 flex items-baseline gap-3 border-b border-banc-dark/15 pb-3">
                <span className="text-2xl font-bold text-banc-dark-deep">30%</span>
                <span className="text-sm text-banc-muted-readable">Pass strict referencing</span>
              </figcaption>
            </figure>

            {/* Content Side */}
            <div className="order-1 lg:order-2">
              <p className={eyebrow}>Our Priority</p>
              <h2 className={cn(sectionHeading, "mt-3")}>Quality Tenants</h2>

              <div className={cn(bodyCopy, "mt-7")}>
                <p>{qualityTenants.body[0]}</p>
                <p>
                  {qualityTenants.body[1].split(LANDLORD_TENANT_PASS_RATE)[0]}
                  <span className="text-banc-focus font-bold">
                    {LANDLORD_TENANT_PASS_RATE}
                  </span>
                  {qualityTenants.body[1].split(LANDLORD_TENANT_PASS_RATE)[1]}
                </p>
                <p>{qualityTenants.body[2]}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marketing Section */}
      <section className={cn(sectionPadding, "bg-banc-grey-pale")}>
        <div className="mx-auto max-w-7xl">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Left Content */}
            <div>
              <p className={eyebrow}>Marketing</p>
              <h2 className={cn(sectionHeading, "mt-3")}>It&apos;s All About The Internet!</h2>

              <p className="mt-7 leading-relaxed text-banc-muted-readable lg:text-lg">
                These days people looking for rental property rely on the
                internet, not local papers. Which is why we&apos;ll heavily
                promote your property on our own website,{" "}
                <strong className="text-banc-dark-deep">bancproperty.com</strong>,
                and all of the most important property websites along with
                popular Social Media platforms.
              </p>

              <p className="mt-6 text-sm font-semibold text-banc-dark-deep">
                {["Major Property Portals", "Social Media", "bancproperty.com"].join(" · ")}
              </p>
            </div>

            {/* Right - Maximum Exposure */}
            <div className="border-t border-banc-dark/15 pt-6">
              <h3 className="text-2xl font-semibold">Maximum Exposure</h3>

              <ul className="mt-4">
                {[
                  "Prominent placement on bancproperty.com",
                  "Featured on major property websites",
                  "Social media promotion across platforms",
                  "Pre-qualified database of waiting tenants",
                  "Professional photography and descriptions",
                ].map((item, index) => (
                  <li key={index} className="border-b border-banc-dark/15 py-3 text-banc-muted-readable">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Property Management */}
      <section className={darkBand}>
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <p className={eyebrowOnDark}>Full Management</p>
          <h2 className={cn(sectionHeadingOnDark, "mt-3")}>Property Management Service</h2>
          <p className="mt-4 max-w-2xl text-white/70 lg:text-lg">
            Managing your property can be time-consuming and demanding. With
            our Fully Managed letting service, just sit back and let us take
            the stress out of being a landlord.
          </p>

          {/* Features */}
          <div className="mt-7 grid gap-x-10 md:grid-cols-3">
            {LANDLORD_MANAGEMENT_FEATURES.map((item, index) => (
              <div key={index} className="border-t border-white/15 py-6">
                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-2 leading-relaxed text-white/70">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Dedicated Manager Highlight */}
          <div className="border-t border-white/15 pt-6">
            <h3 className="text-2xl font-semibold text-white">
              Dedicated In-House Property Manager
            </h3>
            <p className="mt-3 max-w-3xl leading-relaxed text-white/70 lg:text-lg">
              As part of our Fully Managed service, we provide you with your
              own dedicated &apos;in-house&apos; Property Manager, whose job
              it is to look after every aspect of your property throughout
              the life of the tenancy. Our landlords tell us they appreciate
              the continuity and accountability of having a local, single
              point of contact, rather than having to battle with the
              faceless call centres used by many agencies today.
            </p>
            <p className="mt-4 font-medium text-white">Direct line to your manager</p>
          </div>
        </div>
      </section>

      {/* Why Choose Banc */}
      <section className={sectionPadding}>
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <p className={eyebrow}>Why Us</p>
          <h2 className={cn(sectionHeading, "mt-3")}>Why Choose Banc</h2>
          <p className="mt-4 max-w-2xl text-banc-muted-readable lg:text-lg">
            We pride ourselves on delivering exceptional service to landlords
            across our coverage areas
          </p>

          {/* Feature Grid */}
          <div className="mt-7 grid gap-x-10 md:grid-cols-2 lg:grid-cols-3">
            {LANDLORD_BENEFITS.map((item, index) => (
              <div key={index} className="border-t border-banc-dark/15 py-5">
                <h3 className="text-lg font-semibold text-banc-dark-deep">{item.title}</h3>
                <p className="mt-1 text-banc-muted-readable">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Insurance Products */}
      <section className={cn(sectionPadding, "bg-banc-grey-pale")}>
        <div className="mx-auto max-w-7xl">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Left Content */}
            <div>
              <p className={eyebrow}>Protection</p>
              <h2 className={cn(sectionHeading, "mt-3")}>Insurance Products Available</h2>

              <p className="mt-7 leading-relaxed text-banc-muted-readable lg:text-lg">
                Protect your investment with our range of landlord insurance
                products. We offer comprehensive coverage options to give you
                complete peace of mind.
              </p>

              <div className="mt-7">
                <Button className={cn(actionPrimary, "shadow-none")}>
                  Enquire About Insurance
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>

              {/* Trust indicators */}
              <p className="mt-6 text-sm text-banc-muted-readable">
                {["Fully Protected", "Quick Claims", "A-Rated Providers"].join(" · ")}
              </p>
            </div>

            {/* Right - Insurance list */}
            <ul className="border-t border-banc-dark/15">
              {LANDLORD_INSURANCE_PRODUCTS.map((product, index) => (
                <li key={index} className="border-b border-banc-dark/15 py-4">
                  <h3 className="text-lg font-semibold text-banc-dark-deep">{product.title}</h3>
                  <p className="mt-0.5 text-sm text-banc-muted-readable">{product.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={darkBand}>
        <div className="mx-auto max-w-7xl">
          <p className={eyebrowOnDark}>Get started</p>
          <h2 className={cn(sectionHeadingOnDark, "mt-3")}>Thinking of letting your property?</h2>
          <p className="mt-4 max-w-2xl text-white/70 lg:text-lg">
            We would be delighted to hear from you. Book your free rental
            valuation or speak to our lettings team today.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button className={cn(actionPrimaryOnDark, "shadow-none")}>
              Book Free Valuation
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button variant="outline" className={cn(actionSecondaryOnDark, "bg-transparent hover:bg-transparent")}>
              Contact Lettings Team
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
