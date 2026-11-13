"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PageBand } from "@/components/PageBand";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { TENANT_FEES, TENANT_GUIDE_SECTIONS } from "@/lib/banc-content/tenants-guide";
import { FEES_TO_TENANTS_URL } from "@/lib/banc-contact";
import { cn } from "@/lib/utils";
import {
  actionPrimaryOnDark,
  actionSecondaryOnDark,
  eyebrow,
  eyebrowOnDark,
  sectionHeading,
  sectionHeadingOnDark,
  sectionPadding,
} from "@/components/ui/form-styles";

const sections = TENANT_GUIDE_SECTIONS;
const tenantFees = TENANT_FEES;

const jumpLink =
  "inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] border border-white/30 px-4 text-sm text-white transition-colors duration-200 hover:border-white";
const stepNumber = "font-mono text-sm font-medium";
const darkBand = cn(sectionPadding, "banc-dark-surface bg-banc-dark-deep text-white");

export default function TenantsGuideClient() {
  return (
    <div className="min-h-screen bg-[var(--off-white)]">
      <Header />

      <PageBand
        eyebrow="Tenant Resources"
        title="Tenants Guide"
        lede={
          <>
            Banc Property Group is proud to be an approved Property Guild agent, so you can be
            sure of best practice when you rent with us, including helpful advice and complete
            transparency of charges. Whether you&apos;re a first-time renter or experienced tenant,
            this comprehensive guide will walk you through every step of the renting process.
          </>
        }
        image={{
          src: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1920&q=80",
          alt: "",
          priority: true,
        }}
      >
        {/* Quick navigation */}
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <Link key={section.id} href={`#${section.id}`} className={jumpLink}>
              <span className="font-mono text-white/70">{section.number}</span> {section.title}
            </Link>
          ))}
          <Link href="#fees" className={jumpLink}>
            <span className="font-mono text-white/70">07</span> Tenant Fees
          </Link>
        </div>
      </PageBand>

      {/* Main Guide Sections */}
      <section className={sectionPadding}>
        <div className="mx-auto max-w-7xl">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "scroll-mt-28",
                index > 0 && "mt-12 border-t border-banc-dark/15 pt-12 lg:mt-16 lg:pt-16",
              )}
            >
              {/* Section Header */}
              <p className={cn(eyebrow, "flex items-baseline gap-3")}>
                <span className={cn(stepNumber, "text-banc-dark-deep")}>{section.number}</span>
                Step
              </p>
              <h2 className={cn(sectionHeading, "mt-3")}>{section.title}</h2>

              {section.intro && (
                <p className="mt-6 text-lg font-medium text-banc-dark-deep">{section.intro}</p>
              )}

              <div className="mt-7 grid gap-8 lg:grid-cols-3 lg:gap-12">
                {/* Main content */}
                <div className="lg:col-span-2">
                  <ul className="list-disc space-y-4 pl-5 marker:text-banc-focus">
                    {section.content.map((item, i) => (
                      <li key={i} className="leading-relaxed text-banc-muted-readable">
                        {item}
                      </li>
                    ))}
                  </ul>

                  {/* Moving day checklist */}
                  {section.checklist && (
                    <div className="mt-8 border-t border-banc-dark/15 pt-6">
                      <h3 className="font-semibold text-banc-dark-deep">Moving Day Checklist</h3>
                      <ul className="mt-3 grid gap-x-8 sm:grid-cols-2">
                        {section.checklist.map((item, i) => (
                          <li key={i} className="border-b border-banc-dark/15 py-3 text-sm text-banc-muted-readable">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Highlights sidebar */}
                {section.highlights && (
                  <div className="lg:col-span-1">
                    <h3 className={eyebrow}>Pro Tips</h3>
                    <ul className="mt-3 border-t border-banc-dark/15">
                      {section.highlights.map((highlight, i) => (
                        <li key={i} className="border-b border-banc-dark/15 py-3 text-sm text-banc-dark-deep">
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tenant Fees Section */}
      <section id="fees" className={cn(darkBand, "scroll-mt-24")}>
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className={cn(eyebrowOnDark, "flex items-baseline gap-3")}>
              <span className={cn(stepNumber, "text-white")}>07</span>
              Step
            </p>
            <h2 className={cn(sectionHeadingOnDark, "mt-3")}>Tenant Fees</h2>
            <p className="mt-4 max-w-2xl text-sm text-white/70">
              Tenant Fees Act 2019 — Assured Shorthold Tenancies signed on or after 1 June 2019
            </p>
          </motion.div>

          {/* Fee rows */}
          <div className="mt-7 max-w-5xl border-b border-white/15">
            {tenantFees.map((fee) => (
              <div
                key={fee.title}
                className="flex flex-col gap-2 border-t border-white/15 py-5 lg:flex-row lg:items-start lg:justify-between lg:gap-10"
              >
                <div>
                  <h3 className="text-lg font-semibold text-white">{fee.title}</h3>
                  <p className="mt-1 leading-relaxed text-white/70">{fee.description}</p>
                </div>
                <p className="font-bold text-white lg:max-w-xs lg:shrink-0 lg:text-right">{fee.amount}</p>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <p className="mt-6 max-w-2xl text-sm text-white/70">
            <a href={FEES_TO_TENANTS_URL} target="_blank" rel="noopener noreferrer" className="mr-2 inline-flex min-h-11 items-center font-semibold text-white underline underline-offset-4">Download the full Fees to Tenants schedule (PDF)</a>
            All fees are inclusive of VAT where applicable. These fees are accurate as of the Tenant Fees Act 2019.
            For any questions about fees or charges, please contact our lettings team who will be happy to help.
          </p>
        </div>
      </section>

      {/* Property Guild Approval Section */}
      <section className={sectionPadding}>
        <div className="mx-auto max-w-7xl">
          <p className={eyebrow}>Accredited Agent</p>
          <h2 className={cn(sectionHeading, "mt-3")}>Property Guild Approved Agent</h2>

          <p className="mt-7 max-w-2xl leading-relaxed text-banc-muted-readable lg:text-lg">
            Banc Property Group is proud to be an approved Property Guild agent, demonstrating
            our unwavering commitment to best practice, professional standards, and complete
            transparency in all our lettings services. When you rent with us, you can be confident
            you&apos;re working with a trusted, accredited agency.
          </p>

          <ul className="mt-7 max-w-2xl border-t border-banc-dark/15">
            {["Professional Standards", "Transparent Fees", "Client Money Protection"].map((item) => (
              <li key={item} className="border-b border-banc-dark/15 py-3 font-medium text-banc-dark-deep">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA Section */}
      <section className={darkBand}>
        <div className="mx-auto max-w-7xl">
          <p className={eyebrowOnDark}>Next step</p>
          <h2 className={cn(sectionHeadingOnDark, "mt-3")}>
            Ready to find your perfect rental home?
          </h2>

          <p className="mt-4 max-w-2xl text-white/70 lg:text-lg">
            Browse our available properties or register your requirements with our lettings team
            for personalised recommendations.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/lettings/properties" className={actionPrimaryOnDark}>
              Browse Properties
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Button asChild
              size="lg"
              variant="outline"
              className={cn(actionSecondaryOnDark, "bg-transparent hover:bg-transparent")}>
              <Link href="/#alerts">
                Register Your Requirements
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
