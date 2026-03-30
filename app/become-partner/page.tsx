import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  TrendingUp,
  Clock,
  Shield,
  Users,
  Mail,
  ArrowRight,
  CheckCircle2,
  Target,
  Award,
  Rocket,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Become a Partner | Banc Property Group",
  description:
    "Join Banc Property Group as a partner agent. Run your own business with uncapped earnings, back-end support, and the strength of our professional brand in North London, Hertfordshire and Essex.",
  openGraph: {
    title: "Become a Partner | Banc Property Group",
    description:
      "Exciting opportunity to run your own estate agency business in partnership with a professional brand. Uncapped earnings and full back-end support.",
    type: "website",
  },
};

// Benefits data
const benefits = [
  {
    icon: Briefcase,
    title: "Be Your Own Boss",
    description:
      "Run your own business and take control of your career. Work independently while benefiting from our established brand reputation.",
  },
  {
    icon: TrendingUp,
    title: "Uncapped Earnings",
    description:
      "Your earning potential is unlimited. The more you put in, the more you get out. Build a prosperous future on your own terms.",
  },
  {
    icon: Clock,
    title: "Control Your Hours",
    description:
      "Flexibility to manage your own schedule. Work when it suits you and achieve the work-life balance you've always wanted.",
  },
  {
    icon: Shield,
    title: "Low Cost & Low Risk",
    description:
      "Our Partner Agent model provides an affordable entry into business ownership with minimal financial risk for the right individuals.",
  },
];

// Partner traits data
const partnerTraits = [
  { icon: Rocket, title: "Entrepreneurial", description: "Self-starters with business mindset" },
  { icon: Target, title: "Ambitious", description: "Driven to achieve great things" },
  { icon: Sparkles, title: "Motivated", description: "Passionate about success" },
  { icon: Award, title: "Disciplined", description: "Committed to excellence" },
  { icon: Users, title: "Proactive", description: "Always one step ahead" },
  { icon: TrendingUp, title: "Growth-Focused", description: "Committed to personal development" },
];

// Division of responsibilities
const youHandle = [
  "Prospecting for new clients",
  "Property listings & valuations",
  "Selling & negotiation",
  "Building client relationships",
  "Viewings & client meetings",
  "Local market expertise",
];

const weHandle = [
  "Back-end administration",
  "Appointment bookings",
  "Sales progression",
  "Marketing & advertising costs",
  "Technology & CRM support",
  "Brand & compliance guidance",
];

export default function BecomePartnerPage() {
  return (
    <div className="min-h-screen bg-[#F4F3F1]">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#1A1917]">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, #4AC8E8 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#4AC8E8]/10 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* Eyebrow */}
            <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#4AC8E8]/10 px-4 py-2 text-sm font-medium uppercase tracking-[0.2em] text-[#4AC8E8]">
              <Sparkles className="h-4 w-4" />
              Career Opportunity
            </p>

            {/* Main Headline */}
            <h1 className="font-heading text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              Become a Partner
            </h1>

            {/* Sub-headline */}
            <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-white/80 lg:text-2xl">
              Are you looking for the next step, or perhaps the first step in your
              estate agency career?
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="mailto:nitesh@bancproperty.com,andrew@bancproperty.com?subject=Partner Agent Application"
                className="group"
              >
                <Button className="bg-[#4AC8E8] px-8 py-6 text-base font-medium text-white transition-all duration-300 hover:bg-[#1A9BBF] hover:shadow-lg hover:shadow-[#4AC8E8]/25">
                  Apply Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </a>
              <a href="#opportunity">
                <Button
                  variant="outline"
                  className="border-white/30 bg-transparent px-8 py-6 text-base text-white transition-all duration-300 hover:border-[#4AC8E8] hover:bg-[#4AC8E8]/10 hover:text-white"
                >
                  Learn More
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4AC8E8]/50 to-transparent" />
      </section>

      {/* Introduction Section */}
      <section id="opportunity" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Content */}
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-[#4AC8E8]">
                The Opportunity
              </p>
              <h2 className="mt-4 font-heading text-3xl font-semibold text-[#1A1917] sm:text-4xl lg:text-5xl">
                Run Your Own Business with Professional Support
              </h2>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-[#8A8880]">
                <p>
                  We are looking for local business partners in{" "}
                  <strong className="text-[#1A1917]">North London</strong>,{" "}
                  <strong className="text-[#1A1917]">Hertfordshire</strong> and{" "}
                  <strong className="text-[#1A1917]">Essex</strong> areas.
                </p>
                <p>
                  This is an exciting opportunity to run your own business and to be
                  your own boss in partnership with a professional brand. Your
                  earnings will be un-capped, you can control the hours that you work
                  and concentrate on the tasks that estate agents love!
                </p>
              </div>
            </div>

            {/* Visual Card */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl bg-[#1A1917] p-8 shadow-2xl lg:p-10">
                {/* Decorative gradient */}
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#4AC8E8]/20 blur-3xl" />
                
                <div className="relative">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#4AC8E8]/20">
                    <Briefcase className="h-7 w-7 text-[#4AC8E8]" />
                  </div>
                  <h3 className="font-heading text-2xl font-semibold text-white">
                    Partner Agent Model
                  </h3>
                  <p className="mt-4 text-white/70">
                    Provides a low cost and low risk entry to a business, which for
                    the right individuals provides excellent financial rewards.
                  </p>
                  
                  {/* Stats */}
                  <div className="mt-8 grid grid-cols-2 gap-6 border-t border-white/10 pt-8">
                    <div>
                      <p className="font-heading text-3xl font-bold text-[#4AC8E8]">3</p>
                      <p className="mt-1 text-sm text-white/60">Key Regions</p>
                    </div>
                    <div>
                      <p className="font-heading text-3xl font-bold text-[#4AC8E8]">∞</p>
                      <p className="mt-1 text-sm text-white/60">Earning Potential</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative corner accent */}
              <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-2xl bg-[#4AC8E8]/20" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-[#1A1917] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {/* Section Header */}
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-[#4AC8E8]">
              Why Partner With Us
            </p>
            <h2 className="mt-4 font-heading text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
              Benefits of the Partner Model
            </h2>
            <p className="mt-4 text-lg text-white/60">
              Focus on what you do best while we handle the rest
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:border-[#4AC8E8]/50 hover:bg-white/10"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#4AC8E8]/20 transition-colors duration-300 group-hover:bg-[#4AC8E8]">
                  <benefit.icon className="h-6 w-6 text-[#4AC8E8] transition-colors duration-300 group-hover:text-white" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-white">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Division of Responsibilities Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {/* Section Header */}
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-[#4AC8E8]">
              How It Works
            </p>
            <h2 className="mt-4 font-heading text-3xl font-semibold text-[#1A1917] sm:text-4xl lg:text-5xl">
              What You Handle vs What We Handle
            </h2>
            <p className="mt-4 text-lg text-[#8A8880]">
              Our partner agents concentrate on the tasks that estate agents love,
              whilst we handle the back-end operations
            </p>
          </div>

          {/* Comparison Grid */}
          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            {/* You Handle */}
            <div className="overflow-hidden rounded-2xl border border-[#1A1917]/10 bg-white shadow-lg">
              <div className="bg-[#1A1917] px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4AC8E8]">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-white">
                    You Handle
                  </h3>
                </div>
                <p className="mt-2 text-sm text-white/60">
                  The activities you enjoy and excel at
                </p>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  {youHandle.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#4AC8E8]" />
                      <span className="text-[#3D3B37]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* We Handle */}
            <div className="overflow-hidden rounded-2xl border border-[#4AC8E8]/20 bg-white shadow-lg shadow-[#4AC8E8]/5">
              <div className="bg-[#4AC8E8] px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                    <Shield className="h-5 w-5 text-[#4AC8E8]" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-white">
                    We Handle
                  </h3>
                </div>
                <p className="mt-2 text-sm text-white/80">
                  The operational and administrative burden
                </p>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  {weHandle.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#4AC8E8]" />
                      <span className="text-[#3D3B37]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ideal Partner Traits Section */}
      <section className="bg-[#1A1917] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {/* Section Header */}
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-[#4AC8E8]">
              Ideal Candidate
            </p>
            <h2 className="mt-4 font-heading text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
              Who We Are Looking For
            </h2>
            <p className="mt-4 text-lg text-white/60">
              Our business partners are exceptional individuals who share our values
            </p>
          </div>

          {/* Traits Grid */}
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {partnerTraits.map((trait, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-white/5 p-6 transition-all duration-300 hover:bg-white/10"
              >
                {/* Hover accent */}
                <div className="absolute left-0 top-0 h-full w-1 bg-[#4AC8E8] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#4AC8E8]/20 transition-colors duration-300 group-hover:bg-[#4AC8E8]">
                    <trait.icon className="h-6 w-6 text-[#4AC8E8] transition-colors duration-300 group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-white">
                      {trait.title}
                    </h3>
                    <p className="mt-1 text-sm text-white/50">{trait.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Description */}
          <div className="mx-auto mt-12 max-w-3xl text-center">
            <p className="text-white/60">
              Our business partners are entrepreneurial and ambitious individuals who
              want to live a great lifestyle, they are motivated to succeed,
              disciplined, proactive and committed to personal development and trying
              new methods of property marketing.
            </p>
          </div>
        </div>
      </section>

      {/* Regions Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Content */}
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-[#4AC8E8]">
                Locations
              </p>
              <h2 className="mt-4 font-heading text-3xl font-semibold text-[#1A1917] sm:text-4xl">
                Currently Recruiting In
              </h2>
              <p className="mt-4 text-lg text-[#8A8880]">
                We are actively seeking partners in these key regions
              </p>

              <div className="mt-8 space-y-4">
                {["North London", "Hertfordshire", "Essex"].map((region) => (
                  <div
                    key={region}
                    className="flex items-center gap-4 rounded-xl border border-[#1A1917]/10 bg-white p-4 shadow-sm transition-all duration-300 hover:border-[#4AC8E8]/30 hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4AC8E8]/10">
                      <Target className="h-5 w-5 text-[#4AC8E8]" />
                    </div>
                    <span className="font-heading text-lg font-medium text-[#1A1917]">
                      {region}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual/Map Placeholder */}
            <div className="relative">
              <div className="aspect-square overflow-hidden rounded-2xl bg-[#1A1917] p-8 lg:aspect-auto lg:h-[400px]">
                {/* Decorative Map Background */}
                <div className="absolute inset-0 opacity-10">
                  <svg
                    className="h-full w-full"
                    viewBox="0 0 400 400"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="200" cy="200" r="150" stroke="#4AC8E8" strokeWidth="1" />
                    <circle cx="200" cy="200" r="100" stroke="#4AC8E8" strokeWidth="1" />
                    <circle cx="200" cy="200" r="50" stroke="#4AC8E8" strokeWidth="2" />
                    <line x1="200" y1="0" x2="200" y2="400" stroke="#4AC8E8" strokeWidth="1" />
                    <line x1="0" y1="200" x2="400" y2="200" stroke="#4AC8E8" strokeWidth="1" />
                  </svg>
                </div>

                <div className="relative flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#4AC8E8]/20">
                    <MapPin className="h-10 w-10 text-[#4AC8E8]" />
                  </div>
                  <h3 className="font-heading text-2xl font-semibold text-white">
                    Join Our Network
                  </h3>
                  <p className="mx-auto mt-2 max-w-xs text-white/60">
                    Become part of a growing team of professional estate agents
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="relative overflow-hidden bg-[#1A1917] py-20 lg:py-28">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, #4AC8E8 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-[#4AC8E8]/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-[#4AC8E8]/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-10">
          <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#4AC8E8]/20">
            <Mail className="h-8 w-8 text-[#4AC8E8]" />
          </div>

          <h2 className="font-heading text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
            Ready to Take the Next Step?
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
            If you want to find out more about this exciting opportunity, forward
            your CV and covering letter to one of our directors. All information
            provided and discussed will be dealt with in the strictest confidence.
          </p>

          {/* Email Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="mailto:nitesh@bancproperty.com?subject=Partner Agent Application"
              className="w-full sm:w-auto"
            >
              <Button className="w-full bg-[#4AC8E8] px-8 py-6 text-base font-medium text-white transition-all duration-300 hover:bg-[#1A9BBF] hover:shadow-lg hover:shadow-[#4AC8E8]/25 sm:w-auto">
                <Mail className="mr-2 h-5 w-5" />
                Email Nitesh
              </Button>
            </a>
            <a
              href="mailto:andrew@bancproperty.com?subject=Partner Agent Application"
              className="w-full sm:w-auto"
            >
              <Button className="w-full bg-white px-8 py-6 text-base font-medium text-[#1A1917] transition-all duration-300 hover:bg-white/90 sm:w-auto">
                <Mail className="mr-2 h-5 w-5" />
                Email Andrew
              </Button>
            </a>
          </div>

          {/* Email Addresses Display */}
          <div className="mt-8 flex flex-col items-center gap-2 text-sm text-white/50">
            <p>nitesh@bancproperty.com</p>
            <p>andrew@bancproperty.com</p>
          </div>

          {/* Privacy Note */}
          <p className="mt-6 text-xs text-white/40">
            All information provided and discussed will be dealt with in the
            strictest confidence
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Additional icon component for the map section
function MapPin({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}
