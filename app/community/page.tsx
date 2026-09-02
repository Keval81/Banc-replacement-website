import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Phone, Mail, Heart, Trophy } from "lucide-react";
import { BANC_CONTACT } from "@/lib/banc-contact";

export const metadata: Metadata = withPageDefaults("/community", {
  title: "Community | Banc Property Group",
  description:
    "Playing our part in the local community — Banc Property Group sponsors local schools, tennis and football clubs across Cuffley and the surrounding villages.",
});

export const revalidate = 3600;

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-[var(--off-white)]">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--charcoal)]">
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="h-px w-8 bg-[var(--primary-cyan)]" />
              <span className="text-sm font-medium tracking-widest uppercase text-[var(--primary-cyan)]">
                Community
              </span>
              <div className="h-px w-8 bg-[var(--primary-cyan)]" />
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]">
              Playing our part in the local community
            </h1>

            <div className="mt-8 flex justify-center">
              <div className="h-1 w-24 bg-gradient-to-r from-transparent via-[var(--primary-cyan)] to-transparent" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--off-white)] to-transparent" />
      </section>

      {/* Body copy */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <div className="space-y-6 text-lg leading-relaxed text-[var(--charcoal)]/80">
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
          <div className="mt-12 rounded-2xl bg-white p-8 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--primary-cyan)]/10 text-[var(--primary-cyan)]">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--charcoal)]">
                  Northaw and Cuffley Tennis Club&apos;s Easter Party
                </h2>
                <p className="mt-3 text-[var(--charcoal)]/70 leading-relaxed">
                  We are extremely proud to support our local tennis club with their events and will
                  be working closely with the club going forward.
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-12 rounded-2xl bg-[var(--charcoal)] p-8 text-white">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--primary-cyan)]/20 text-[var(--primary-cyan)]">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Get in touch about a community initiative</h2>
                <p className="mt-3 text-white/70 leading-relaxed">
                  To discuss any community initiatives please call Andrew Crump or Nitesh Bheda.
                </p>
                <div className="mt-5 space-y-2">
                  <a
                    href={BANC_CONTACT.callHref}
                    className="flex items-center gap-3 text-white/90 transition-colors hover:text-[var(--primary-cyan)]"
                  >
                    <Phone className="h-4 w-4" />
                    {BANC_CONTACT.displayPhone}
                  </a>
                  <a
                    href="mailto:andrew@bancproperty.com"
                    className="flex items-center gap-3 text-white/90 transition-colors hover:text-[var(--primary-cyan)]"
                  >
                    <Mail className="h-4 w-4" />
                    andrew@bancproperty.com
                  </a>
                  <a
                    href="mailto:nitesh@bancproperty.com"
                    className="flex items-center gap-3 text-white/90 transition-colors hover:text-[var(--primary-cyan)]"
                  >
                    <Mail className="h-4 w-4" />
                    nitesh@bancproperty.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Local areas cross-link */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-[var(--charcoal)] mb-4">
              Find properties in your local area
            </h3>
            <p className="text-[var(--mid-grey)] mb-8">
              From Cuffley to Potters Bar, Cheshunt to Brookmans Park — explore the areas we serve.
            </p>
            <Link
              href="/area-guides"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--primary-cyan)] text-white font-semibold rounded-lg hover:bg-[var(--dark-cyan)] transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
              View Area Guides
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
