import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Phone } from "lucide-react";
import { PageBand } from "@/components/PageBand";
import { cn } from "@/lib/utils";
import {
  actionPrimaryOnDark,
  actionSecondary,
  eyebrow,
  eyebrowOnDark,
  sectionHeading,
  sectionHeadingOnDark,
  sectionPadding,
} from "@/components/ui/form-styles";
import { BANC_CONTACT } from "@/lib/banc-contact";

export const metadata: Metadata = withPageDefaults("/community", {
  title: "Community | Banc Property Group",
  description:
    "Playing our part in the local community — Banc Property Group sponsors local schools, tennis and football clubs across Cuffley and the surrounding villages.",
});

export const revalidate = 3600;

const emailLink =
  "inline-flex min-h-11 items-center text-white/85 underline underline-offset-4 transition-colors hover:text-white";

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-[var(--off-white)]">
      <Header />

      <PageBand eyebrow="Community" title="Playing our part in the local community" />

      {/* Body copy */}
      <section className={sectionPadding}>
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="space-y-6 text-lg leading-relaxed text-banc-dark-mid">
              <p>
                Being part of the community is very important to us and supporting local initiatives
                and charities is part of that. We work hard at being a responsible business for our
                local communities as we all live and work within these areas.
              </p>
              <p>
                We sponsor the local primary and secondary schools along with the local tennis and
                football clubs.
              </p>
              <p>
                We have an open door policy and we are always happy to hear about, and be involved
                with, charitable causes and local events.
              </p>
            </div>

            {/* Tennis club highlight */}
            <div className="mt-12 border-t border-banc-dark/15 pt-8">
              <h2 className="text-xl font-semibold text-banc-dark-deep">
                Northaw and Cuffley Tennis Club&apos;s Easter Party
              </h2>
              <p className="mt-3 leading-relaxed text-banc-muted-readable">
                We are extremely proud to support our local tennis club with their events and will
                be working closely with the club going forward.
              </p>
            </div>

            {/* Local areas cross-link */}
            <div className="mt-12 border-t border-banc-dark/15 pt-8">
              <p className={eyebrow}>Area guides</p>
              <h2 className={cn(sectionHeading, "mt-3")}>Find properties in your local area</h2>
              <p className="mt-4 text-banc-muted-readable">
                From Cuffley to Potters Bar, Cheshunt to Brookmans Park — explore the areas we serve.
              </p>
              <Link href="/area-guides" className={cn(actionSecondary, "mt-6")}>
                View Area Guides
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className={cn(sectionPadding, "banc-dark-surface bg-banc-dark-deep text-white")}>
        <div className="mx-auto max-w-7xl">
          <p className={eyebrowOnDark}>Get in touch</p>
          <h2 className={cn(sectionHeadingOnDark, "mt-3 max-w-3xl")}>
            Get in touch about a community initiative
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-white/70">
            To discuss any community initiatives please call Andrew Crump or Nitesh Bheda.
          </p>
          <div className="mt-7 flex flex-col items-start gap-2">
            <a href={BANC_CONTACT.callHref} className={actionPrimaryOnDark}>
              <Phone className="h-4 w-4" aria-hidden="true" />
              {BANC_CONTACT.displayPhone}
            </a>
            <a href="mailto:andrew@bancproperty.com" className={cn(emailLink, "mt-2")}>
              andrew@bancproperty.com
            </a>
            <a href="mailto:nitesh@bancproperty.com" className={emailLink}>
              nitesh@bancproperty.com
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
