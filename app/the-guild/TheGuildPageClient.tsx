"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageBand } from "@/components/PageBand";
import {
  actionPrimaryOnDark,
  actionSecondaryOnDark,
  eyebrow,
  sectionHeading,
  sectionHeadingOnDark,
  sectionPadding,
} from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Award,
  Users,
  Megaphone,
  GraduationCap,
  MapPin,
  ArrowUpRight,
  CheckCircle2,
  Globe,
  Shield,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const benefits = [
  {
    icon: Globe,
    title: "National Reach",
    description: "Ties with over 750 member offices all over the UK mean your property gains exposure to a nationwide audience of buyers.",
  },
  {
    icon: Award,
    title: "Higher Standards",
    description: "Guild members are carefully selected and must meet rigorous standards of professionalism, ethics, and customer service excellence.",
  },
  {
    icon: Users,
    title: "Nationwide Buyers",
    description: "Through The Guild's inter-office referral system, we connect your property with motivated buyers from across the country.",
  },
  {
    icon: Megaphone,
    title: "Enhanced Marketing",
    description: "Benefit from national marketing campaigns, premium property portal exposure, and shared marketing resources.",
  },
  {
    icon: GraduationCap,
    title: "Professional Development",
    description: "Our team benefits from continuous training and best practice sharing through The Guild's comprehensive development programmes.",
  },
  {
    icon: MapPin,
    title: "Relocation Assistance",
    description: "Moving out of the area? We connect you with trusted Guild agents in your destination location for seamless transitions.",
  },
];

const stats = [
  { value: "750+", label: "Member Offices" },
  { value: "UK-Wide", label: "Coverage" },
  { value: "Park Lane", label: "Mayfair Associate Office" },
  { value: "30+", label: "Years of The Guild" },
];

export default function TheGuildPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <PageBand
        eyebrow="Proud Member"
        title="The Guild of Property Professionals"
        lede="National Network. Local Independence. We combine the personal service of a local independent estate agent with the reach and resources of a national network."
        image={{
          src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=80",
          alt: "",
          priority: true,
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/sales/properties" className={actionPrimaryOnDark}>
            View Properties
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="/contact" className={actionSecondaryOnDark}>
            Contact Us
          </Link>
        </div>
      </PageBand>

      {/* Introduction Section */}
      <section className={sectionPadding}>
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-7 lg:grid-cols-2 lg:gap-16">
            {/* Image Side */}
            <figure>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-md)] bg-banc-grey-pale">
                <Image
                  src="/map-area.png"
                  alt="Banc Property Group coverage area"
                  fill
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-4 border-t border-banc-dark/15 pt-4">
                <p className={eyebrow}>Our Promise</p>
                <p className="mt-1 text-sm font-semibold text-banc-dark-deep">Local expertise, national reach</p>
              </figcaption>
            </figure>

            {/* Content Side */}
            <div>
              <p className={eyebrow}>Our Membership</p>
              <h2 className={cn(sectionHeading, "mt-3")}>
                National Network.<br />
                Local Independence.
              </h2>

              <div className="mt-7 space-y-5">
                <p className="text-base leading-relaxed text-banc-muted-readable lg:text-lg">
                  Banc is proud to be a member of The Guild of Property Professionals,
                  a prestigious network of independent estate agents across the UK. This
                  membership reflects our commitment to maintaining the highest standards
                  of service while benefiting from national exposure and shared expertise.
                </p>
                <p className="leading-relaxed text-banc-muted-readable">
                  Unlike corporate chains, The Guild brings together carefully selected
                  independent agents who share a passion for exceptional customer service
                  and deep local knowledge. As a member, we combine our Cuffley and
                  Mayfair expertise with the resources of a network spanning the entire UK.
                </p>
              </div>

              <div className="mt-7 grid gap-x-8 sm:grid-cols-2">
                <div className="flex items-start gap-3 border-t border-banc-dark/15 py-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-banc-focus" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-banc-dark-deep">Quality Assured</p>
                    <p className="mt-1 text-sm text-banc-muted-readable">Rigorous selection process</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 border-t border-banc-dark/15 py-4">
                  <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-banc-focus" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-banc-dark-deep">Trusted Network</p>
                    <p className="mt-1 text-sm text-banc-muted-readable">Professional excellence</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className={cn(sectionPadding, "bg-banc-grey-pale")}>
        <div className="mx-auto max-w-7xl">
          <p className={eyebrow}>Benefits for You</p>
          <h2 className={cn(sectionHeading, "mt-3")}>What Guild Membership Means</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-banc-muted-readable lg:text-lg">
            Our partnership with The Guild delivers tangible advantages that help us
            achieve better results and provide a superior experience for buyers and
            sellers alike.
          </p>

          <div className="mt-7 grid gap-x-10 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="border-t border-banc-dark/15 py-6"
              >
                <benefit.icon className="h-6 w-6 text-banc-focus" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold text-banc-dark-deep">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-banc-muted-readable">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={cn(sectionPadding, "banc-dark-surface bg-banc-dark-deep text-white")}>
        <div className="mx-auto max-w-7xl">
          <div className="grid border-t border-white/15 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="border-b border-white/15 py-5 lg:border-b-0"
              >
                <div className="font-display text-3xl font-light tracking-tight text-white lg:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-white/70">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About The Guild */}
      <section className={sectionPadding}>
        <div className="mx-auto max-w-7xl">
          <div className="grid items-start gap-7 lg:grid-cols-12 lg:gap-16">
            {/* Left Column */}
            <div className="lg:sticky lg:top-32 lg:col-span-5">
              <p className={eyebrow}>About The Guild</p>
              <h2 className={cn(sectionHeading, "mt-3")}>
                A Network Built on Excellence
              </h2>
              <div className="mt-7 flex items-center gap-5 border-t border-banc-dark/15 pt-6">
                <div className="relative h-24 w-24 flex-shrink-0">
                  <Image
                    src="/TheGuild_Logo_RGB.jpg"
                    alt="The Guild of Property Professionals"
                    fill
                    sizes="96px"
                    className="object-contain"
                  />
                </div>
                <div>
                  <p className="font-display text-2xl font-light text-banc-dark-deep">Since 1994</p>
                  <p className="mt-1 text-sm text-banc-muted-readable">30+ years of excellence</p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5 lg:col-span-7">
              <p className="text-base leading-relaxed text-banc-muted-readable lg:text-lg">
                The Guild has been working alongside independent estate agents for over 30 years,
                establishing itself as one of the UK&apos;s most respected networks. Unlike
                corporate chains, The Guild champions the independent agency model, recognising
                that local expertise, community connections, and personalised service are
                irreplaceable assets in the property market.
              </p>
              <p className="leading-relaxed text-banc-muted-readable">
                Each member is exclusively chosen as The Guild representative in their area based
                on their dedication and expertise in the local property market. This selective
                approach means that when you work with a Guild member like Banc, you can be
                confident you&apos;re working with a trusted agent in your area.
              </p>
              <p className="leading-relaxed text-banc-muted-readable">
                The Guild&apos;s collaborative culture means members share best practices, market insights,
                and resources, while retaining the independence that allows them to provide the
                personalised service that only a local agent can offer. It&apos;s this unique combination
                that makes Guild membership so valuable to both agents and clients.
              </p>

              {/* Quote — Banc's own published words (bancproperty.com/why-us) */}
              <figure className="border-t border-banc-dark/15 pt-6">
                <blockquote className="font-display text-lg font-light leading-relaxed text-banc-dark-deep lg:text-xl">
                  &ldquo;As a member of the Guild our associate office in Park Lane, Mayfair is
                  amongst the very best placed in Europe. The exposure your property receives is
                  further enhanced by over 750 membered offices all over the UK who we have ties
                  with.&rdquo;
                </blockquote>
                <figcaption className="mt-4">
                  <p className="text-sm font-semibold text-banc-dark-deep">Banc Property Group</p>
                  <p className="text-xs text-banc-muted-readable">Proud Guild Member</p>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={cn(sectionPadding, "banc-dark-surface bg-banc-dark-deep text-white")}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-7xl"
        >
          <h2 className={sectionHeadingOnDark}>Experience the Guild Difference</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 lg:text-lg">
            Whether you&apos;re buying, selling, or letting, benefit from the perfect
            combination of local expertise and national reach.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/sales/properties" className={actionPrimaryOnDark}>
              Browse Properties
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/contact" className={actionSecondaryOnDark}>
              Get in Touch
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
