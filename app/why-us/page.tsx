import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageBand } from "@/components/PageBand";
import {
  actionPrimaryOnDark,
  actionSecondary,
  actionSecondaryOnDark,
  eyebrow,
  eyebrowOnDark,
  sectionHeading,
  sectionHeadingOnDark,
  sectionPadding,
} from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";
import { Carousel } from "@/components/Carousel";
import { surfaceFor } from "@/lib/carousel-surfaces";
import {
  ArrowRight,
  Users,
  TrendingUp,
  Shield,
  Camera,
  Clock,
  Home,
  Star,
  Phone,
  CheckCircle2,
  Target,
  Heart,
  Building2,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import { BANC_CONTACT } from "@/lib/banc-contact";

export const metadata: Metadata = withPageDefaults("/why-us", {
  title: "Why Choose Us | Banc Property Group",
  description: "Discover why Banc Property Group is the premium choice for selling, letting and managing properties in Cuffley, Mayfair and beyond. 45+ years combined experience.",
  keywords: "estate agent cuffley, property sales hertfordshire, why choose banc, best estate agent, property experts",
});

export const revalidate = 3600;

// Differentiators — condensed from the live site's own Why Us copy (bancproperty.com/why-us)
const differentiators = [
  {
    icon: Home,
    title: "Bespoke Property Details",
    description: "Beautifully designed brochures with professional-grade photography, EPCs and floorplans — plus our unique 'Sellers Secrets', your own take on your home, to really bring it to life."
  },
  {
    icon: Camera,
    title: "Marketing",
    description: "The biggest property portals, proactive call-outs to our database, eye-catching for sale boards as your 24/7 salesman, and every property delivered through our Facebook and Instagram feeds."
  },
  {
    icon: Clock,
    title: "Open All Hours",
    description: "On the phone or email 24/7, and the office is open 9am to 5:30pm Monday to Saturday. Viewings and valuations arranged at your convenience — we don't miss an opportunity to get you moved."
  },
  {
    icon: Shield,
    title: "Transparent & Straightforward",
    description: "Honest, evidence-backed valuations with comparable properties. No long tie-in contracts — instruct and stay with us on the merits of the job we are doing."
  },
  {
    icon: Star,
    title: "Showtime",
    description: "Staging advice before the cameras arrive, block viewings or open houses where they suit, and experienced consultants or directors accompanying viewings — never part-time staff."
  },
  {
    icon: Heart,
    title: "Communication",
    description: "To us silence is never golden. Viewing feedback within a day, and bi-monthly face-to-face consultation reviews with every vendor and landlord to keep the campaign on track."
  },
  {
    icon: Target,
    title: "Discreet Marketing",
    description: "A private-sale service for sellers who prefer to keep their business matters off the portals — giving committed buyers access without publicly exposing your home to the market."
  },
  {
    icon: Users,
    title: "Director Led",
    description: "Nitesh and Andrew — with over 45 years combined experience — personally handle your market appraisal, viewings, negotiation and sales progression through to key handover."
  },
  {
    icon: Building2,
    title: "London Market",
    description: "As a Guild member, our associate office on Park Lane, Mayfair — 2000 sq ft of office and showroom — showcases properties via touchscreen displays 24/7 to London and international buyers."
  },
  {
    icon: TrendingUp,
    title: "The Extra Mile",
    description: "Glossy lifestyle and property magazines distributed locally and through the Guild network, plus video tours, drone photography and dedicated websites for individual homes."
  }
];

// Process timeline — mirrors the 10-step sellers guide
const processSteps = [
  {
    step: "01",
    title: "Market Appraisal",
    description: "Expert market appraisal by one of our directors. We provide honest, evidence-based valuations backed up with comparable properties.",
    icon: Home
  },
  {
    step: "02",
    title: "Marketing Preparation",
    description: "Professional photography, floor plans, and compelling property descriptions. We ensure your home looks its absolute best.",
    icon: Camera
  },
  {
    step: "03",
    title: "Listing & Promotion",
    description: "Your property goes live on the major portals, our website, and social media channels — backed by proactive call-outs to our buyer database.",
    icon: Target
  },
  {
    step: "04",
    title: "Viewings Management",
    description: "Accompanied viewings by experienced consultants or directors who know your property inside out. Flexible times to suit you.",
    icon: Users
  },
  {
    step: "05",
    title: "Offer Negotiation",
    description: "We negotiate the best possible price on your behalf, vetting all buyers for their position and ability to proceed.",
    icon: BarChart3
  },
  {
    step: "06",
    title: "Sales Progression",
    description: "We keep everything moving smoothly, liaising with solicitors, surveyors, and all parties until completion.",
    icon: Clock
  },
  {
    step: "07",
    title: "Completion",
    description: "Keys are handed over and your successful sale is complete — we even aim to be there on that special completion date.",
    icon: CheckCircle2
  }
];

// Accreditations — as evidenced on bancproperty.com and its published certificates
const awards = [
  { name: "The Property Ombudsman", description: "Accredited" },
  { name: "The Guild of Professional Estate Agents", description: "Member" },
  { name: "Client Money Protect", description: "Client Money Protection" }
];

// Real client reviews — verbatim from bancproperty.com/reviews
const testimonials = [
  {
    quote: "You guys are brilliant, when you valued our property at a much higher price than other agents we were sceptical we could achieve that but it sold for exactly that. You really know what you're talking about and because of your expert knowledge we were able to move to a location we thought we couldn't afford.",
    author: "Lesley & James",
    location: "Beverley Gardens, Cheshunt",
    rating: 5
  },
  {
    quote: "We have just sold our house through Banc Property Group and it was such a positive experience. I cannot speak highly enough of Andrew who couldn't have been more helpful. We achieved the asking price very quickly. If I am selling again I would go straight to Banc. Thank you to the whole team.",
    author: "Dawn",
    location: "Leefe Way, Cuffley",
    rating: 5
  },
  {
    quote: "Banc are a very professional company. They have been letting 4 of my properties over the last 7 years with no issues. There always fully occupied with good tenants. I am really impressed with the speed that they find new tenants when the old tenant's leave. I will only use Banc from now on.",
    author: "Stuart Heath",
    location: "Churchgate, Cheshunt",
    rating: 5
  }
];

export default function WhyUsPage() {
  return (
    <div className="min-h-screen bg-banc-grey-pale">
      <Header />
      
      <PageBand
        eyebrow="Hard Work · Enthusiasm · Honesty · Integrity"
        title="Why Choose Banc Property Group"
        lede="With a combined 60 years experience in the local property market, we are confident that we can offer an unrivalled knowledge and an exceptional service in a bespoke and tailored fashion. The foundations of Banc are based on the simple fundamentals of hard work, enthusiasm, honesty and integrity."
        image={{
          src: "https://images.unsplash.com/photo-1771011890148-fbddda692217?auto=format&fit=crop&w=1920&q=80",
          alt: "",
          priority: true,
        }}
      >
        <div className="grid border-t border-white/15 sm:grid-cols-3 sm:gap-x-8">
          {[
            { value: "60 yrs", label: "Combined Experience" },
            { value: "2", label: "Local Owner Directors" },
            { value: "750+", label: "Guild Offices Nationwide" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-baseline justify-between gap-4 border-b border-white/15 py-4 sm:block sm:border-b-0">
              <p className="font-display text-3xl font-light text-white lg:text-4xl">{stat.value}</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/70 sm:mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </PageBand>

      {/* Company pitch — verbatim from the live homepage */}
      <section className={sectionPadding}>
        <div className="mx-auto max-w-7xl">
          <h2 className={sectionHeading}>Welcome to Banc Property Group</h2>
          <p className="mt-7 max-w-3xl text-base leading-relaxed text-banc-dark-mid lg:text-lg">
            Born from a desire to provide a more tailored and bespoke service, we take pride in listening
            to your needs and requirements, to deliver a service which exceeds client expectations. We offer
            a bespoke approach to selling and letting properties, combining local expertise and a powerful
            national network with unique property marketing campaigns, always providing outstanding customer care.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-banc-dark-mid lg:text-lg">
            Our experience comes from over 45 years of selling and renting homes in the local areas combined,
            and the expertise of our two local owners.
          </p>
        </div>
      </section>

      {/* Differentiators Section */}
      <section className={cn(sectionPadding, "border-t border-banc-dark/15")}>
        <div className="mx-auto max-w-7xl">
          <p className={eyebrow}>What Sets Us Apart</p>
          <h2 className={cn(sectionHeading, "mt-3")}>What We Do Differently</h2>
          <p className="mb-7 mt-4 max-w-2xl text-base leading-relaxed text-banc-muted-readable lg:text-lg">
            We don&apos;t say we do things — we actually do them.
          </p>

          {/* Colour-backed carousel cards, one surface per card in rotation. */}
          <Carousel label="What we do differently">
            {differentiators.map((item, index) => {
              const surface = surfaceFor(index);
              return (
                <article
                  key={item.title}
                  className={`banc-lift relative flex h-full flex-col overflow-hidden rounded-[10px] border p-6 ${surface.background} ${surface.border}`}
                >
                  <div
                    aria-hidden="true"
                    className={`mb-5 text-[11px] uppercase tracking-[0.18em] ${surface.mutedInk}`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <item.icon className={`mb-4 h-7 w-7 ${surface.ink}`} aria-hidden="true" />
                  <h3 className={`text-lg font-semibold ${surface.ink}`}>
                    {item.title}
                  </h3>
                  <p className={`mt-2 text-sm leading-relaxed ${surface.mutedInk}`}>
                    {item.description}
                  </p>
                </article>
              );
            })}
          </Carousel>
        </div>
      </section>

      {/* Process Timeline Section */}
      <section className={cn(sectionPadding, "banc-dark-surface bg-banc-dark-deep text-white")}>
        <div className="mx-auto max-w-7xl">
          <p className={eyebrowOnDark}>Our Process</p>
          <h2 className={cn(sectionHeadingOnDark, "mt-3")}>Your Journey With Us</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 lg:text-lg">
            From initial valuation to completion, we guide you through every step of the process.
          </p>

          <ol className="mt-7 grid gap-x-12 lg:grid-cols-2">
            {processSteps.map((step) => (
              <li key={step.step} className="flex gap-5 border-t border-white/15 py-6">
                <span className="font-display text-3xl font-light leading-none text-[var(--banc-focus-dark)]">{step.step}</span>
                <div>
                  <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Awards Section */}
      <section className={sectionPadding}>
        <div className="mx-auto max-w-7xl">
          <h2 className={sectionHeading}>Accreditations &amp; Memberships</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-banc-muted-readable">
            Giving you peace of mind that you are truly in professional hands
          </p>

          <div className="mt-7 grid gap-x-8 sm:grid-cols-3">
            {awards.map((award) => (
              <div key={award.name} className="border-t border-banc-dark/15 py-5">
                <p className="font-semibold text-banc-dark-deep">{award.name}</p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-banc-muted-readable">{award.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={cn(sectionPadding, "border-t border-banc-dark/15")}>
        <div className="mx-auto max-w-7xl">
          <p className={eyebrow}>Client Testimonials</p>
          <h2 className={cn(sectionHeading, "mt-3")}>What Our Clients Say</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-banc-muted-readable lg:text-lg">
            Don&apos;t just take our word for it – hear from the people we&apos;ve helped.
          </p>

          <div className="mt-7 grid gap-x-10 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <figure key={index} className="border-t border-banc-dark/15 py-6">
                <div className="flex gap-1" role="img" aria-label={`${testimonial.rating} out of 5 stars`}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-banc-focus text-banc-focus" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="mt-4 leading-relaxed text-banc-dark-mid">
                  &quot;{testimonial.quote}&quot;
                </blockquote>
                <figcaption className="mt-5">
                  <p className="font-semibold text-banc-dark-deep">{testimonial.author}</p>
                  <p className="text-sm text-banc-muted-readable">{testimonial.location}</p>
                </figcaption>
              </figure>
            ))}
          </div>

          <Link href="/reviews" className={cn(actionSecondary, "mt-4")}>
            Read All Reviews
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className={cn(sectionPadding, "banc-dark-surface bg-banc-dark-deep text-white")}>
        <div className="mx-auto max-w-7xl">
          <h2 className={sectionHeadingOnDark}>Ready to Experience the Banc Difference?</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 lg:text-lg">
            Whether you&apos;re selling, letting, buying, or renting, we&apos;re here to help you achieve your property goals.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/valuation" className={actionPrimaryOnDark}>
              <Home className="h-4 w-4" aria-hidden="true" />
              Get Free Valuation
            </Link>
            <Link href="/contact" className={actionSecondaryOnDark}>
              <Phone className="h-4 w-4" aria-hidden="true" />
              Contact Us
            </Link>
          </div>

          <p className="mt-6 text-sm text-white/70">
            Call us: <a href={BANC_CONTACT.callHref} className="inline-flex min-h-11 items-center font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">{BANC_CONTACT.displayPhone}</a>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
