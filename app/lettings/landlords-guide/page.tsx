import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Shield,
  FileText,
  CheckCircle,
  Home,
  Users,
  Globe,
  Wrench,
  Umbrella,
  BadgeCheck,
  Award,
  Building2,
  ClipboardCheck,
  Phone,
  TrendingUp,
  Lock,
  Hammer,
  Sparkles,
  Zap,
  Scale,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Landlords Guide | Banc Property Services",
  description: "Bespoke letting solutions for landlords. Expert property management services in Cuffley, Goffs Oak, Cheshunt, Potters Bar and surrounding areas. Property Guild approved agent.",
};

const whyChooseBanc = [
  {
    icon: Users,
    title: "Experienced Staff",
    desc: "Experienced, attentive and very knowledgeable staff",
  },
  {
    icon: Sparkles,
    title: "Flexible Service",
    desc: "Flexible service options, competitively priced",
  },
  {
    icon: BadgeCheck,
    title: "Transparent Fees",
    desc: "Open and transparent fees with no hidden charges",
  },
  {
    icon: FileText,
    title: "Legal Documents",
    desc: "Up to date legal documents and advice on property rental matters",
  },
  {
    icon: TrendingUp,
    title: "Property Appraisals",
    desc: "Property appraisals from experienced letting consultants",
  },
  {
    icon: Globe,
    title: "Internet Advertising",
    desc: "Extensive internet advertising on the UK's top property websites",
  },
  {
    icon: Users,
    title: "Pre-qualified Tenants",
    desc: "A pre-qualified database of waiting tenants",
  },
  {
    icon: ClipboardCheck,
    title: "Tenant Referencing",
    desc: "Comprehensive tenant referencing service with full credit check",
  },
  {
    icon: FileText,
    title: "Inventories",
    desc: "Professionally produced inventories, if required",
  },
  {
    icon: Shield,
    title: "Money Protection",
    desc: "Full client money protection",
  },
  {
    icon: Building2,
    title: "Tenancy Deposit",
    desc: "Registered with the government-backed Tenancy Deposit Scheme",
  },
  {
    icon: Hammer,
    title: "Expert Tradespeople",
    desc: "Database of expert and reliable tradespeople on call",
  },
];

const insuranceProducts = [
  {
    icon: Building2,
    title: "Landlord Comprehensive Buildings Insurance",
    desc: "Complete protection for your property investment",
  },
  {
    icon: Shield,
    title: "Landlord Low Cost Building Insurance",
    desc: "Affordable coverage without compromising quality",
  },
  {
    icon: Home,
    title: "Landlord Full and Limited Contents Insurance",
    desc: "Flexible options for furnished and unfurnished properties",
  },
  {
    icon: Zap,
    title: "Landlords Emergency Assistance",
    desc: "24/7 emergency support for urgent repairs",
  },
  {
    icon: Scale,
    title: "Landlords Legal Expenses",
    desc: "Protection against legal costs and disputes",
  },
];

export default function LandlordsGuidePage() {
  return (
    <div className="bg-white text-[#1A1917] min-h-screen">
      <Header />

      {/* Hero Section - Premium Dark with Gradient */}
      <section className="relative bg-[#1A1917] py-28 lg:py-36 overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1917]/80 via-[#1A1917]/60 to-[#1A1917]/40" />
        </div>
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #4AC8E8 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Cyan accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#4AC8E8] to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4AC8E8]/10 border border-[#4AC8E8]/20 mb-6">
              <Award className="h-4 w-4 text-[#4AC8E8]" />
              <span className="text-sm font-medium text-[#4AC8E8]">
                Property Guild Approved
              </span>
            </div>

            <h1 className="text-5xl font-semibold text-white sm:text-6xl lg:text-7xl tracking-tight leading-[1.1]">
              Landlords Guide
            </h1>

            <p className="mt-8 text-xl text-white/70 leading-relaxed max-w-2xl">
              Whether you are looking to let your home while away on business,
              or you need a long-term tenancy solution for your investment
              property, our lettings team offers the correct service to suit.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Button className="bg-[#4AC8E8] hover:bg-[#1A9BBF] text-white px-8 py-6 text-base font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#4AC8E8]/25">
                Book Free Valuation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-8 py-6 text-base"
              >
                Download Guide
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative element */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#4AC8E8]/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/2" />
      </section>

      {/* Introduction & Coverage Areas */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-16 lg:grid-cols-2 items-start">
            {/* Left Column - Main Content */}
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-[#4AC8E8] font-semibold">
                Introduction
              </p>
              <h2 className="mt-4 text-4xl font-semibold sm:text-5xl tracking-tight">
                Expert Letting Services
              </h2>

              <div className="mt-8 space-y-6 text-[#8A8880] text-lg leading-relaxed">
                <p>
                  We understand that becoming a landlord can be a daunting
                  experience. It is easy to see why, when you consider there are
                  hundreds of separate laws and regulations that landlords must
                  abide by when letting a property!
                </p>
                <p>
                  Our in-house property teams are experts in their field,
                  on-hand to help throughout the entire process. We offer a
                  comprehensive range of residential lettings services,
                  including full property management.
                </p>
              </div>

              {/* Accreditation Badges */}
              <div className="mt-10 flex flex-wrap gap-4">
                <div className="flex items-center gap-3 px-5 py-3 bg-[#F4F3F1] rounded-xl">
                  <BadgeCheck className="h-6 w-6 text-[#4AC8E8]" />
                  <div>
                    <p className="text-sm font-semibold text-[#1A1917]">
                      Property Guild
                    </p>
                    <p className="text-xs text-[#8A8880]">Approved Agent</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-3 bg-[#F4F3F1] rounded-xl">
                  <Lock className="h-6 w-6 text-[#4AC8E8]" />
                  <div>
                    <p className="text-sm font-semibold text-[#1A1917]">
                      CMP Protected
                    </p>
                    <p className="text-xs text-[#8A8880]">Client Money</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-3 bg-[#F4F3F1] rounded-xl">
                  <Shield className="h-6 w-6 text-[#4AC8E8]" />
                  <div>
                    <p className="text-sm font-semibold text-[#1A1917]">
                      The Property Ombudsman
                    </p>
                    <p className="text-xs text-[#8A8880]">Redress Scheme</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Coverage Card */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-[#4AC8E8]/10 to-transparent rounded-3xl" />
              <div className="relative bg-[#F4F3F1] rounded-2xl p-8 lg:p-10">
                <div className="h-14 w-14 rounded-xl bg-[#4AC8E8] flex items-center justify-center mb-6">
                  <Home className="h-7 w-7 text-white" />
                </div>

                <h3 className="text-2xl font-semibold mb-4">
                  Covering Your Area
                </h3>

                <p className="text-[#8A8880] leading-relaxed">
                  From Apartments, Victorian cottages to Country estates, let our
                  lettings department look after your properties of every type,
                  size and style there is.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {["Cuffley", "Goffs Oak", "Cheshunt", "Potters Bar"].map(
                    (area) => (
                      <span
                        key={area}
                        className="inline-flex items-center px-4 py-2 rounded-full bg-white text-[#1A1917] text-sm font-medium shadow-sm"
                      >
                        {area}
                      </span>
                    )
                  )}
                </div>

                <p className="mt-6 text-[#8A8880] leading-relaxed">
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
        </div>
      </section>

      {/* Premium Statistics Banner - 30% Highlight */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[#1A1917]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#4AC8E8]/10 via-transparent to-[#4AC8E8]/10" />

        {/* Decorative circles */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#4AC8E8]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#4AC8E8]/5 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            {/* Stat Display */}
            <div className="flex items-center gap-8">
              <div className="relative">
                <div className="absolute -inset-4 bg-[#4AC8E8]/20 rounded-2xl blur-xl" />
                <div className="relative flex items-center justify-center h-32 w-32 rounded-2xl bg-gradient-to-br from-[#4AC8E8] to-[#1A9BBF] shadow-2xl shadow-[#4AC8E8]/30">
                  <span className="text-5xl font-bold text-white">30%</span>
                </div>
              </div>
              <div>
                <p className="text-sm uppercase tracking-widest text-[#4AC8E8] font-medium">
                  Strict Referencing
                </p>
                <p className="text-3xl font-semibold text-white mt-1">
                  Pass Rate
                </p>
                <p className="text-white/60 mt-2">
                  Of applicants approved
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="text-white/80 text-lg leading-relaxed">
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
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            {/* Image Side */}
            <div className="relative order-2 lg:order-1">
              <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80"
                  alt="Quality tenants in a premium rental property"
                  className="w-full h-full object-cover"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1917]/60 via-transparent to-transparent" />
              </div>

              {/* Floating Stats Card */}
              <div className="absolute -bottom-6 -right-6 lg:right-8 bg-white rounded-xl shadow-2xl p-6 max-w-xs">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-[#4AC8E8]/10 flex items-center justify-center">
                    <CheckCircle className="h-7 w-7 text-[#4AC8E8]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1A1917]">30%</p>
                    <p className="text-sm text-[#8A8880]">
                      Pass strict referencing
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Side */}
            <div className="order-1 lg:order-2">
              <p className="text-sm uppercase tracking-[0.25em] text-[#4AC8E8] font-semibold">
                Our Priority
              </p>
              <h2 className="mt-4 text-4xl font-semibold sm:text-5xl tracking-tight">
                Quality Tenants
              </h2>

              <div className="mt-8 space-y-6 text-[#8A8880] text-lg leading-relaxed">
                <p>
                  Our number 1 priority is quality tenants. We&apos;re
                  particularly fussy when it comes to finding quality tenants
                  for your property.
                </p>
                <p>
                  In fact only about{" "}
                  <span className="text-[#4AC8E8] font-bold">
                    30% of our applicants
                  </span>{" "}
                  actually make it through our strict referencing procedure
                  which includes checking the applicants&apos; credit and work
                  history, salary and any references from any previous landlords
                  before being approved.
                </p>
                <p>
                  We also encourage you to meet the tenants, so you can verify
                  you&apos;re happy with the people we&apos;ve found. If, for
                  any reason, you would prefer us to keep looking, we will
                  politely decline the tenants and continue marketing your
                  property.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marketing Section */}
      <section className="py-24 bg-[#F4F3F1]">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-16 lg:grid-cols-2 items-start">
            {/* Left Content */}
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-[#4AC8E8] font-semibold">
                Marketing
              </p>
              <h2 className="mt-4 text-4xl font-semibold sm:text-5xl tracking-tight">
                It&apos;s All About The Internet!
              </h2>

              <p className="mt-8 text-[#8A8880] text-lg leading-relaxed">
                These days people looking for rental property rely on the
                internet, not local papers. Which is why we&apos;ll heavily
                promote your property on our own website,{" "}
                <strong className="text-[#1A1917]">bancproperty.com</strong>,
                and all of the most important property websites along with
                popular Social Media platforms.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                {[
                  { icon: Globe, label: "Major Property Portals" },
                  { icon: Users, label: "Social Media" },
                  { icon: Home, label: "bancproperty.com" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center px-5 py-3 rounded-full bg-white text-[#1A1917] text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
                  >
                    <item.icon className="h-4 w-4 mr-2 text-[#4AC8E8]" />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Card - Dark Theme */}
            <div className="relative">
              <div className="bg-[#1A1917] rounded-2xl p-10 shadow-xl">
                <div className="h-14 w-14 rounded-xl bg-[#4AC8E8] flex items-center justify-center mb-6">
                  <Globe className="h-7 w-7 text-white" />
                </div>

                <h3 className="text-2xl font-semibold text-white mb-4">
                  Maximum Exposure
                </h3>

                <ul className="space-y-4">
                  {[
                    "Prominent placement on bancproperty.com",
                    "Featured on major property websites",
                    "Social media promotion across platforms",
                    "Pre-qualified database of waiting tenants",
                    "Professional photography and descriptions",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#4AC8E8] mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-white/70">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Property Management - Premium Dark Section */}
      <section className="relative py-24 bg-[#1A1917] overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#4AC8E8]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4AC8E8]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.25em] text-[#4AC8E8] font-semibold">
              Full Management
            </p>
            <h2 className="mt-4 text-4xl font-semibold text-white sm:text-5xl tracking-tight">
              Property Management Service
            </h2>
            <p className="mt-6 text-white/60 max-w-2xl mx-auto text-lg">
              Managing your property can be time-consuming and demanding. With
              our Fully Managed letting service, just sit back and let us take
              the stress out of being a landlord.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Home,
                title: "Well-Maintained Homes",
                desc: "The best quality tenants demand the best-maintained homes, expecting maximum value for their rent. Whether it is fridge failure or a leaking shower, you can be sure any tenant will want a swift repair.",
              },
              {
                icon: Wrench,
                title: "Prompt Repairs",
                desc: "Hundreds of clients trust our award-winning property management team. We look after any repairs and tenancy issues for you promptly and professionally.",
              },
              {
                icon: Shield,
                title: "Compliance Checks",
                desc: "We visit the property and organise any maintenance and safety compliance checks, assuring you that your property remains in sound condition and your legal obligations are met.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#4AC8E8]/50 transition-all duration-300 hover:bg-white/10"
              >
                <div className="h-14 w-14 rounded-xl bg-[#4AC8E8]/20 flex items-center justify-center mb-6 group-hover:bg-[#4AC8E8]/30 transition-colors">
                  <item.icon className="h-7 w-7 text-[#4AC8E8]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-white/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Dedicated Manager Highlight */}
          <div className="mt-12 bg-gradient-to-r from-[#4AC8E8]/20 to-[#4AC8E8]/5 rounded-2xl p-10 border border-[#4AC8E8]/20">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
              <div className="h-20 w-20 rounded-2xl bg-[#4AC8E8] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#4AC8E8]/25">
                <Users className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  Dedicated In-House Property Manager
                </h3>
                <p className="text-white/70 leading-relaxed text-lg">
                  As part of our Fully Managed service, we provide you with your
                  own dedicated &apos;in-house&apos; Property Manager, whose job
                  it is to look after every aspect of your property throughout
                  the life of the tenancy. Our landlords tell us they appreciate
                  the continuity and accountability of having a local, single
                  point of contact, rather than having to battle with the
                  faceless call centres used by many agencies today.
                </p>
                <div className="mt-4 flex items-center gap-2 text-[#4AC8E8]">
                  <Phone className="h-5 w-5" />
                  <span className="font-medium">Direct line to your manager</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Banc - Premium Grid */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.25em] text-[#4AC8E8] font-semibold">
              Why Us
            </p>
            <h2 className="mt-4 text-4xl font-semibold sm:text-5xl tracking-tight">
              Why Choose Banc
            </h2>
            <p className="mt-6 text-[#8A8880] max-w-2xl mx-auto text-lg">
              We pride ourselves on delivering exceptional service to landlords
              across our coverage areas
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {whyChooseBanc.map((item, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-6 border border-[#E0DFDC]/50 hover:border-[#4AC8E8] transition-all duration-300 hover:shadow-xl hover:shadow-[#4AC8E8]/5 hover:-translate-y-1"
              >
                {/* Cyan accent on hover */}
                <div className="absolute inset-x-0 top-0 h-1 bg-[#4AC8E8] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-[#4AC8E8]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#4AC8E8]/20 transition-colors">
                    <item.icon className="h-6 w-6 text-[#4AC8E8]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1A1917] text-lg">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-[#8A8880]">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Insurance Products - Clean Premium Section */}
      <section className="py-24 bg-[#F4F3F1]">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            {/* Left Content */}
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-[#4AC8E8] font-semibold">
                Protection
              </p>
              <h2 className="mt-4 text-4xl font-semibold sm:text-5xl tracking-tight">
                Insurance Products Available
              </h2>

              <p className="mt-8 text-[#8A8880] text-lg leading-relaxed">
                Protect your investment with our range of landlord insurance
                products. We offer comprehensive coverage options to give you
                complete peace of mind.
              </p>

              <div className="mt-10">
                <Button className="bg-[#4AC8E8] hover:bg-[#1A9BBF] text-white px-8 py-6 text-base font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#4AC8E8]/25">
                  Enquire About Insurance
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="mt-10 flex items-center gap-6">
                <div className="flex items-center gap-2 text-[#8A8880]">
                  <Shield className="h-5 w-5 text-[#4AC8E8]" />
                  <span className="text-sm">Fully Protected</span>
                </div>
                <div className="flex items-center gap-2 text-[#8A8880]">
                  <CheckCircle className="h-5 w-5 text-[#4AC8E8]" />
                  <span className="text-sm">Quick Claims</span>
                </div>
                <div className="flex items-center gap-2 text-[#8A8880]">
                  <Award className="h-5 w-5 text-[#4AC8E8]" />
                  <span className="text-sm">A-Rated Providers</span>
                </div>
              </div>
            </div>

            {/* Right - Insurance Cards */}
            <div className="space-y-4">
              {insuranceProducts.map((product, index) => (
                <div
                  key={index}
                  className="group flex items-center gap-5 p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-transparent hover:border-[#4AC8E8]/20"
                >
                  <div className="h-14 w-14 rounded-xl bg-[#4AC8E8]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#4AC8E8]/20 transition-colors">
                    <product.icon className="h-7 w-7 text-[#4AC8E8]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1A1917] text-lg">
                      {product.title}
                    </h3>
                    <p className="text-[#8A8880] text-sm mt-0.5">
                      {product.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Premium Gradient */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4AC8E8] to-[#1A9BBF]" />

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        <div className="relative mx-auto max-w-4xl px-6 lg:px-10 text-center">
          <h2 className="text-4xl font-semibold text-white sm:text-5xl tracking-tight">
            Thinking of letting your property?
          </h2>
          <p className="mt-6 text-xl text-white/90 max-w-2xl mx-auto">
            We would be delighted to hear from you. Book your free rental
            valuation or speak to our lettings team today.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button className="bg-white text-[#4AC8E8] hover:bg-white/90 px-10 py-7 text-base font-semibold transition-all duration-300 hover:shadow-xl">
              Book Free Valuation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-10 py-7 text-base font-semibold"
            >
              Contact Lettings Team
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
