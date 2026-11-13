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

export const metadata: Metadata = withPageDefaults("/become-partner", {
  title: "Become a Partner | Banc Property Group",
  description:
    "Join Banc Property Group as a partner agent. Run your own business with uncapped earnings, back-end support, and the strength of our professional brand in North London, Hertfordshire and Essex.",
  openGraph: {
    title: "Become a Partner | Banc Property Group",
    description:
      "Exciting opportunity to run your own estate agency business in partnership with a professional brand. Uncapped earnings and full back-end support.",
    type: "website",
  },
});

export const revalidate = 3600;

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
];

export default function BecomePartnerPage() {
  return (
    <div className="min-h-screen bg-banc-grey-pale">
      <Header />

      <PageBand
        eyebrow="Career Opportunity"
        title="Become a Partner"
        lede="Are you looking for the next step, or perhaps the first step in your estate agency career?"
        image={{
          src: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80",
          alt: "",
          priority: true,
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="mailto:nitesh@bancproperty.com,andrew@bancproperty.com?subject=Partner Agent Application"
            className={actionPrimaryOnDark}
          >
            Apply Now
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <a href="#opportunity" className={actionSecondaryOnDark}>
            Learn More
          </a>
        </div>
      </PageBand>

      {/* Introduction Section */}
      <section id="opportunity" className={cn(sectionPadding, "scroll-mt-24")}>
        <div className="mx-auto max-w-7xl">
          <div className="grid items-start gap-7 lg:grid-cols-2 lg:gap-16">
            {/* Content */}
            <div>
              <p className={eyebrow}>The Opportunity</p>
              <h2 className={cn(sectionHeading, "mt-3")}>
                Run Your Own Business with Professional Support
              </h2>
              <div className="mt-7 space-y-4 text-base leading-relaxed text-banc-muted-readable lg:text-lg">
                <p>
                  We are looking for local business partners in{" "}
                  <strong className="text-banc-dark-deep">North London</strong>,{" "}
                  <strong className="text-banc-dark-deep">Hertfordshire</strong> and{" "}
                  <strong className="text-banc-dark-deep">Essex</strong> areas.
                </p>
                <p>
                  This is an exciting opportunity to run your own business and to be
                  your own boss in partnership with a professional brand. Your
                  earnings will be un-capped, you can control the hours that you work
                  and concentrate on the tasks that estate agents love!
                </p>
              </div>
            </div>

            {/* Partner model */}
            <div className="border-t border-banc-dark/15 pt-6">
              <h3 className="font-display text-2xl font-light text-banc-dark-deep">
                Partner Agent Model
              </h3>
              <p className="mt-3 leading-relaxed text-banc-muted-readable">
                Provides a low cost and low risk entry to a business, which for
                the right individuals provides excellent financial rewards.
              </p>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-2 gap-x-8 border-t border-banc-dark/15 pt-5">
                <div>
                  <p className="font-display text-3xl font-light text-banc-dark-deep">3</p>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-banc-muted-readable">Key Regions</p>
                </div>
                <div>
                  <p className="font-display text-3xl font-light text-banc-dark-deep">∞</p>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-banc-muted-readable">Earning Potential</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={cn(sectionPadding, "banc-dark-surface bg-banc-dark-deep text-white")}>
        <div className="mx-auto max-w-7xl">
          <p className={eyebrowOnDark}>Why Partner With Us</p>
          <h2 className={cn(sectionHeadingOnDark, "mt-3")}>Benefits of the Partner Model</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 lg:text-lg">
            Focus on what you do best while we handle the rest
          </p>

          <div className="mt-7 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="border-t border-white/15 py-6">
                <benefit.icon className="h-6 w-6 text-[var(--banc-focus-dark)]" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold text-white">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Division of Responsibilities Section */}
      <section className={sectionPadding}>
        <div className="mx-auto max-w-7xl">
          <p className={eyebrow}>How It Works</p>
          <h2 className={cn(sectionHeading, "mt-3")}>What You Handle vs What We Handle</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-banc-muted-readable lg:text-lg">
            Our partner agents concentrate on the tasks that estate agents love,
            whilst we handle the back-end operations
          </p>

          <div className="mt-7 grid gap-10 lg:grid-cols-2 lg:gap-16">
            {/* You Handle */}
            <div className="border-t border-banc-dark/15 pt-6">
              <h3 className="font-display text-2xl font-light text-banc-dark-deep">You Handle</h3>
              <p className="mt-2 text-sm text-banc-muted-readable">
                The activities you enjoy and excel at
              </p>
              <ul className="mt-5">
                {youHandle.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 border-t border-banc-dark/15 py-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-banc-focus" aria-hidden="true" />
                    <span className="text-banc-dark-mid">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* We Handle */}
            <div className="border-t border-banc-dark/15 pt-6">
              <h3 className="font-display text-2xl font-light text-banc-dark-deep">We Handle</h3>
              <p className="mt-2 text-sm text-banc-muted-readable">
                The operational and administrative burden
              </p>
              <ul className="mt-5">
                {weHandle.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 border-t border-banc-dark/15 py-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-banc-focus" aria-hidden="true" />
                    <span className="text-banc-dark-mid">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Ideal Partner Traits Section */}
      <section className={cn(sectionPadding, "banc-dark-surface bg-banc-dark-deep text-white")}>
        <div className="mx-auto max-w-7xl">
          <p className={eyebrowOnDark}>Ideal Candidate</p>
          <h2 className={cn(sectionHeadingOnDark, "mt-3")}>Who We Are Looking For</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 lg:text-lg">
            Our business partners are exceptional individuals who share our values
          </p>

          <div className="mt-7 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {partnerTraits.map((trait, index) => (
              <div key={index} className="flex items-start gap-4 border-t border-white/15 py-5">
                <trait.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--banc-focus-dark)]" aria-hidden="true" />
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {trait.title}
                  </h3>
                  <p className="mt-1 text-sm text-white/70">{trait.description}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 max-w-3xl border-t border-white/15 pt-6 leading-relaxed text-white/70">
            Our business partners are entrepreneurial and ambitious individuals who
            want to live a great lifestyle, they are motivated to succeed,
            disciplined, proactive and committed to personal development and trying
            new methods of property marketing.
          </p>
        </div>
      </section>

      {/* Regions Section */}
      <section className={sectionPadding}>
        <div className="mx-auto max-w-7xl">
          <div className="grid items-start gap-7 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className={eyebrow}>Locations</p>
              <h2 className={cn(sectionHeading, "mt-3")}>Currently Recruiting In</h2>
              <p className="mt-4 text-base leading-relaxed text-banc-muted-readable lg:text-lg">
                We are actively seeking partners in these key regions
              </p>

              <ul className="mt-7">
                {["North London", "Hertfordshire", "Essex"].map((region) => (
                  <li
                    key={region}
                    className="flex items-center gap-3 border-t border-banc-dark/15 py-4"
                  >
                    <MapPin className="h-5 w-5 flex-shrink-0 text-banc-focus" />
                    <span className="font-display text-xl font-light text-banc-dark-deep">
                      {region}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-banc-dark/15 pt-6">
              <h3 className="font-display text-2xl font-light text-banc-dark-deep">
                Join Our Network
              </h3>
              <p className="mt-3 max-w-md leading-relaxed text-banc-muted-readable">
                Become part of a growing team of professional estate agents
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className={cn(sectionPadding, "banc-dark-surface bg-banc-dark-deep text-white")}>
        <div className="mx-auto max-w-7xl">
          <h2 className={sectionHeadingOnDark}>Ready to Take the Next Step?</h2>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 lg:text-lg">
            If you want to find out more about this exciting opportunity, forward
            your CV and covering letter to one of our directors. All information
            provided and discussed will be dealt with in the strictest confidence.
          </p>

          {/* Email Buttons */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href="mailto:nitesh@bancproperty.com?subject=Partner Agent Application"
              className={actionPrimaryOnDark}
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              Email Nitesh
            </a>
            <a
              href="mailto:andrew@bancproperty.com?subject=Partner Agent Application"
              className={actionSecondaryOnDark}
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              Email Andrew
            </a>
          </div>

          {/* Email Addresses Display */}
          <div className="mt-6 flex flex-col gap-1 text-sm text-white/70">
            <p>nitesh@bancproperty.com</p>
            <p>andrew@bancproperty.com</p>
          </div>

          {/* Privacy Note */}
          <p className="mt-6 text-xs text-white/60">
            All information provided and discussed will be dealt with in the
            strictest confidence
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Additional icon component for the regions list
function MapPin({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
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
