import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Award,
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
    description: "On the phone or email 24/7, and the office is open 9am to 6pm Monday to Saturday. Viewings and valuations arranged at your convenience — we don't miss an opportunity to get you moved."
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
      
      {/* Hero Section */}
      <section className="relative bg-banc-dark-deep py-24 lg:py-32 overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1771011890148-fbddda692217?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-banc-dark-deep/80 via-banc-dark-deep/60 to-banc-dark-deep/40" />
        </div>
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-banc-sky rounded-full blur-[128px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-banc-sky rounded-full blur-[128px]" />
        </div>
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <Star className="h-4 w-4 text-banc-sky" />
            <span className="text-sm font-medium text-white/80">Hard Work · Enthusiasm · Honesty · Integrity</span>
          </div>

          <div className="max-w-4xl">
            <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl tracking-tight">
              Why Choose{" "}
              <span className="text-banc-sky">Banc Property Group</span>
            </h1>
            <p className="mt-6 text-xl text-white/70 leading-relaxed max-w-3xl">
              With a combined <span className="text-white font-medium">60 years experience</span> in the local
              property market, we are confident that we can offer an unrivalled knowledge and an exceptional
              service in a bespoke and tailored fashion. The foundations of Banc are based on the simple
              fundamentals of hard work, enthusiasm, honesty and integrity.
            </p>

            {/* Quick stats row */}
            <div className="mt-10 flex flex-wrap gap-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-banc-sky/20 flex items-center justify-center">
                  <Award className="h-6 w-6 text-banc-sky" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">60 yrs</p>
                  <p className="text-sm text-white/60">Combined Experience</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-banc-sky/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-banc-sky" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">2</p>
                  <p className="text-sm text-white/60">Local Owner Directors</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-banc-sky/20 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-banc-sky" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">750+</p>
                  <p className="text-sm text-white/60">Guild Offices Nationwide</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs text-white/40 uppercase tracking-widest">Discover More</span>
          <div className="w-px h-8 bg-gradient-to-b from-banc-sky to-transparent" />
        </div>
      </section>

      {/* Company pitch — verbatim from the live homepage */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-10 text-center">
          <h2 className="text-3xl lg:text-4xl font-semibold text-banc-dark-deep">
            Welcome to Banc Property Group
          </h2>
          <p className="mt-6 text-lg text-banc-dark-mid leading-relaxed">
            Born from a desire to provide a more tailored and bespoke service, we take pride in listening
            to your needs and requirements, to deliver a service which exceeds client expectations. We offer
            a bespoke approach to selling and letting properties, combining local expertise and a powerful
            national network with unique property marketing campaigns, always providing outstanding customer care.
          </p>
          <p className="mt-4 text-lg text-banc-dark-mid leading-relaxed">
            Our experience comes from over 45 years of selling and renting homes in the local areas combined,
            and the expertise of our two local owners.
          </p>
        </div>
      </section>

      {/* Differentiators Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {/* Section header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-banc-sky/10 border border-banc-sky/20 mb-6">
              <Award className="h-4 w-4 text-banc-sky" />
              <span className="text-sm font-medium text-banc-sky-dark">What Sets Us Apart</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-semibold text-banc-dark-deep">
              What We Do Differently
            </h2>
            <p className="mt-4 text-lg text-banc-grey">
              We don&apos;t say we do things — we actually do them.
            </p>
          </div>

          {/* Differentiators grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {differentiators.map((item, index) => (
              <div
                key={item.title}
                className="group relative bg-white rounded-2xl p-6 border border-banc-line/30 hover:border-banc-sky/50 hover:shadow-xl hover:shadow-banc-sky/5 transition-all duration-300"
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-banc-sky/10 flex items-center justify-center mb-4 group-hover:bg-banc-sky/20 transition-colors">
                  <item.icon className="h-7 w-7 text-banc-sky" />
                </div>
                
                {/* Content */}
                <h3 className="text-lg font-semibold text-banc-dark-deep mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-banc-grey leading-relaxed">
                  {item.description}
                </p>
                
                {/* Number indicator */}
                <div className="absolute bottom-4 right-4 text-6xl font-bold text-banc-grey-pale group-hover:text-banc-sky/10 transition-colors">
                  {String(index + 1).padStart(2, '0')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Timeline Section */}
      <section className="py-20 lg:py-28 bg-banc-dark-deep relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-banc-sky to-transparent" />
        </div>
        
        <div className="mx-auto max-w-7xl px-6 lg:px-10 relative">
          {/* Section header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <Clock className="h-4 w-4 text-banc-sky" />
              <span className="text-sm font-medium text-white/80">Our Process</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-semibold text-white">
              Your Journey With Us
            </h2>
            <p className="mt-4 text-lg text-white/60">
              From initial valuation to completion, we guide you through every step of the process.
            </p>
          </div>
          
          {/* Timeline */}
          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-banc-sky/50 to-transparent" />
            
            <div className="space-y-8 lg:space-y-0">
              {processSteps.map((step, index) => (
                <div 
                  key={step.step}
                  className={`relative lg:grid lg:grid-cols-2 lg:gap-12 ${index !== processSteps.length - 1 ? 'lg:pb-12' : ''}`}
                >
                  {/* Content side */}
                  <div className={`${index % 2 === 0 ? 'lg:pr-16 lg:text-right' : 'lg:col-start-2 lg:pl-16'}`}>
                    <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-banc-sky/50 transition-colors ${index % 2 === 0 ? '' : 'lg:ml-0'}`}>
                      {/* Step number */}
                      <div className={`flex items-center gap-3 mb-4 ${index % 2 === 0 ? 'lg:justify-end' : ''}`}>
                        <span className="text-3xl font-bold text-banc-sky">{step.step}</span>
                      </div>

                      {/* Icon and title */}
                      <div className={`flex items-center gap-3 mb-3 ${index % 2 === 0 ? 'lg:justify-end' : ''}`}>
                        <step.icon className="h-5 w-5 text-banc-sky" />
                        <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                      </div>
                      
                      <p className="text-white/60 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Center node */}
                  <div className="hidden lg:flex absolute left-1/2 top-6 -translate-x-1/2">
                    <div className="w-4 h-4 rounded-full bg-banc-sky ring-4 ring-banc-dark-deep shadow-lg shadow-banc-sky/50" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {/* Awards section */}
          <div className="bg-gradient-to-br from-banc-dark-deep to-banc-dark-mid rounded-3xl p-8 lg:p-12">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-semibold text-white">Accreditations & Memberships</h3>
              <p className="mt-2 text-white/60">Giving you peace of mind that you are truly in professional hands</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {awards.map((award) => (
                <div key={award.name} className="bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-colors">
                  <Award className="h-8 w-8 text-banc-sky mx-auto mb-3" />
                  <p className="font-semibold text-white text-sm">{award.name}</p>
                  <p className="text-xs text-white/50 mt-1">{award.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-28 bg-banc-grey-pale">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {/* Section header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-banc-sky/10 border border-banc-sky/20 mb-6">
              <Star className="h-4 w-4 text-banc-sky" />
              <span className="text-sm font-medium text-banc-sky-dark">Client Testimonials</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-semibold text-banc-dark-deep">
              What Our Clients Say
            </h2>
            <p className="mt-4 text-lg text-banc-grey">
              Don&apos;t just take our word for it – hear from the people we&apos;ve helped.
            </p>
          </div>
          
          {/* Testimonials grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 border border-banc-line/30 shadow-sm hover:shadow-lg transition-shadow relative"
              >
                {/* Quote marks */}
                <div className="absolute -top-4 left-6 w-8 h-8 bg-banc-sky rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-serif">&quot;</span>
                </div>
                
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-banc-sky text-banc-sky" />
                  ))}
                </div>
                
                {/* Quote */}
                <p className="text-banc-dark-mid leading-relaxed mb-6">
                  &quot;{testimonial.quote}&quot;
                </p>
                
                {/* Author */}
                <div className="pt-4 border-t border-banc-line/30">
                  <p className="font-semibold text-banc-dark-deep">{testimonial.author}</p>
                  <p className="text-sm text-banc-grey">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Link to all reviews */}
          <div className="text-center">
            <Link href="/reviews">
              <Button variant="outline" className="border-banc-sky text-banc-sky hover:bg-banc-sky hover:text-white px-8">
                Read All Reviews
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-24 bg-banc-sky">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-semibold text-white">
              Ready to Experience the Banc Difference?
            </h2>
            <p className="mt-4 text-lg text-white/90">
              Whether you&apos;re selling, letting, buying, or renting, we&apos;re here to help you achieve your property goals.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/valuation">
                <Button className="bg-white text-banc-sky hover:bg-white/90 px-8 py-6 text-base font-semibold rounded-xl shadow-lg shadow-black/10">
                  <Home className="mr-2 h-5 w-5" />
                  Get Free Valuation
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-base font-semibold rounded-xl">
                  <Phone className="mr-2 h-5 w-5" />
                  Contact Us
                </Button>
              </Link>
            </div>
            
            <p className="mt-6 text-sm text-white/70">
              Call us: <a href={BANC_CONTACT.callHref} className="font-semibold text-white hover:underline">{BANC_CONTACT.displayPhone}</a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
