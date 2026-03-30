import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Award, 
  Users, 
  MapPin, 
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
import Image from "next/image";

export const metadata: Metadata = {
  title: "Why Choose Us | Banc Property Group",
  description: "Discover why Banc Property Group is the premium choice for selling, letting and managing properties in Cuffley, Mayfair and beyond. 45+ years combined experience.",
  keywords: "estate agent cuffley, property sales hertfordshire, why choose banc, best estate agent, property experts",
};

// 8 Differentiators with compelling content
const differentiators = [
  {
    icon: MapPin,
    title: "Local Expertise",
    description: "45+ years combined experience in Cuffley, Goffs Oak and surrounding areas. Our directors have lived and worked locally for decades.",
    stat: "45+",
    statLabel: "Years Combined Experience"
  },
  {
    icon: Heart,
    title: "Personalised Service",
    description: "No call centres or junior staff. You'll work directly with experienced directors and senior negotiators from start to finish.",
    stat: "100%",
    statLabel: "Director-Led Service"
  },
  {
    icon: Camera,
    title: "Premium Marketing",
    description: "Professional photography, video tours, drone footage, and targeted social media campaigns to showcase your property.",
    stat: "4K",
    statLabel: "Drone & Video Tours"
  },
  {
    icon: Award,
    title: "Guild Membership",
    description: "Access to 800+ independent agents nationwide. Local expertise with national reach through The Guild network.",
    stat: "800+",
    statLabel: "Network Partners"
  },
  {
    icon: TrendingUp,
    title: "Track Record",
    description: "Consistently achieving above-asking-price sales. Our results speak for themselves with hundreds of successful transactions.",
    stat: "97%",
    statLabel: "Asking Price Achieved"
  },
  {
    icon: Building2,
    title: "Comprehensive Services",
    description: "From sales and lettings to premier homes and property management. Everything you need under one roof.",
    stat: "5",
    statLabel: "Service Categories"
  },
  {
    icon: Users,
    title: "Community Involvement",
    description: "Active supporters of local sports clubs, schools, and charities. We're not just agents, we're your neighbours.",
    stat: "15+",
    statLabel: "Community Partnerships"
  },
  {
    icon: Target,
    title: "Technology-Driven",
    description: "Cutting-edge property technology for seamless transactions, virtual viewings, and real-time updates on your sale.",
    stat: "24/7",
    statLabel: "Online Property Tracking"
  }
];

// Process timeline
const processSteps = [
  {
    step: "01",
    title: "Free Valuation",
    description: "Expert market appraisal by one of our directors. We provide honest, evidence-based valuations based on current market conditions.",
    duration: "60 minutes",
    icon: Home
  },
  {
    step: "02",
    title: "Marketing Preparation",
    description: "Professional photography, floor plans, and compelling property descriptions. We ensure your home looks its absolute best.",
    duration: "1-2 days",
    icon: Camera
  },
  {
    step: "03",
    title: "Listing & Promotion",
    description: "Your property goes live on Rightmove, Zoopla, OnTheMarket, our website, and social media channels to thousands of buyers.",
    duration: "Day 1",
    icon: Target
  },
  {
    step: "04",
    title: "Viewings Management",
    description: "Accompanied viewings by experienced negotiators who know your property inside out. Flexible times including evenings and weekends.",
    duration: "Ongoing",
    icon: Users
  },
  {
    step: "05",
    title: "Offer Negotiation",
    description: "We negotiate the best possible price on your behalf, vetting all buyers for their position and ability to proceed.",
    duration: "Immediate",
    icon: BarChart3
  },
  {
    step: "06",
    title: "Sales Progression",
    description: "Dedicated sales progressor keeps everything moving smoothly, liaising with solicitors, surveyors, and all parties until completion.",
    duration: "8-12 weeks",
    icon: Clock
  },
  {
    step: "07",
    title: "Completion",
    description: "Congratulations! Keys are handed over and your successful sale is complete. We celebrate your success with you.",
    duration: "Moving Day",
    icon: CheckCircle2
  }
];

// Key stats
const keyStats = [
  { value: "£400M+", label: "Property Sales Value" },
  { value: "97%", label: "Asking Price Achieved" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "15+", label: "Years Established" },
  { value: "500+", label: "Happy Clients" },
  { value: "45+", label: "Years Experience" }
];

// Awards/Recognition
const awards = [
  { name: "The Guild of Property Professionals", description: "Proud Member" },
  { name: "Propertymark", description: "Regulated & Protected" },
  { name: "Rightmove Premium", description: "Featured Agent" },
  { name: "AllAgents", description: "5-Star Rated" }
];

// Featured testimonials
const testimonials = [
  {
    quote: "Banc achieved £15,000 more than another agent had valued our property at. Their marketing was exceptional and they found us the perfect buyer within 2 weeks.",
    author: "Sarah & James Mitchell",
    location: "Cuffley",
    rating: 5
  },
  {
    quote: "As a landlord with multiple properties, I need an agent I can trust. Banc's management service gives me complete peace of mind.",
    author: "Robert Chen",
    location: "Goffs Oak",
    rating: 5
  },
  {
    quote: "Andrew and Nitesh went above and beyond during our purchase. Their communication was excellent and they made the whole process stress-free.",
    author: "Emma Thompson",
    location: "Brookmans Park",
    rating: 5
  }
];

export default function WhyUsPage() {
  return (
    <div className="min-h-screen bg-[#F4F3F1]">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-[#1A1917] py-24 lg:py-32 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#4AC8E8] rounded-full blur-[128px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4AC8E8] rounded-full blur-[128px]" />
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
            <Star className="h-4 w-4 text-[#4AC8E8]" />
            <span className="text-sm font-medium text-white/80">5-Star Rated Estate Agent</span>
          </div>
          
          <div className="max-w-4xl">
            <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl tracking-tight">
              Why Choose{" "}
              <span className="text-[#4AC8E8]">Banc Property Group</span>
            </h1>
            <p className="mt-6 text-xl text-white/70 leading-relaxed max-w-3xl">
              Born from a desire to provide a truly tailored and bespoke service. 
              We combine <span className="text-white font-medium">45+ years of local expertise</span> with 
              modern marketing and technology to deliver results that exceed expectations.
            </p>
            
            {/* Quick stats row */}
            <div className="mt-10 flex flex-wrap gap-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#4AC8E8]/20 flex items-center justify-center">
                  <Award className="h-6 w-6 text-[#4AC8E8]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">97%</p>
                  <p className="text-sm text-white/60">Asking Price Achieved</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#4AC8E8]/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-[#4AC8E8]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">500+</p>
                  <p className="text-sm text-white/60">Happy Clients</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#4AC8E8]/20 flex items-center justify-center">
                  <Star className="h-6 w-6 text-[#4AC8E8]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">4.9/5</p>
                  <p className="text-sm text-white/60">Google Reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs text-white/40 uppercase tracking-widest">Discover More</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#4AC8E8] to-transparent" />
        </div>
      </section>

      {/* Differentiators Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {/* Section header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4AC8E8]/10 border border-[#4AC8E8]/20 mb-6">
              <Award className="h-4 w-4 text-[#4AC8E8]" />
              <span className="text-sm font-medium text-[#1A9BBF]">What Sets Us Apart</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-semibold text-[#1A1917]">
              8 Reasons to Choose Banc
            </h2>
            <p className="mt-4 text-lg text-[#8A8880]">
              We don't just sell properties – we build relationships and deliver results that matter.
            </p>
          </div>
          
          {/* Differentiators grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {differentiators.map((item, index) => (
              <div 
                key={item.title}
                className="group relative bg-white rounded-2xl p-6 border border-[#E0DFDC]/30 hover:border-[#4AC8E8]/50 hover:shadow-xl hover:shadow-[#4AC8E8]/5 transition-all duration-300"
              >
                {/* Stat badge */}
                <div className="absolute -top-3 -right-3 w-16 h-16 rounded-xl bg-[#4AC8E8] flex flex-col items-center justify-center shadow-lg">
                  <span className="text-lg font-bold text-white">{item.stat}</span>
                  <span className="text-[10px] text-white/80 uppercase tracking-wide">{item.statLabel}</span>
                </div>
                
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-[#4AC8E8]/10 flex items-center justify-center mb-4 group-hover:bg-[#4AC8E8]/20 transition-colors">
                  <item.icon className="h-7 w-7 text-[#4AC8E8]" />
                </div>
                
                {/* Content */}
                <h3 className="text-lg font-semibold text-[#1A1917] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[#8A8880] leading-relaxed">
                  {item.description}
                </p>
                
                {/* Number indicator */}
                <div className="absolute bottom-4 right-4 text-6xl font-bold text-[#F4F3F1] group-hover:text-[#4AC8E8]/10 transition-colors">
                  {String(index + 1).padStart(2, '0')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Timeline Section */}
      <section className="py-20 lg:py-28 bg-[#1A1917] relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#4AC8E8] to-transparent" />
        </div>
        
        <div className="mx-auto max-w-7xl px-6 lg:px-10 relative">
          {/* Section header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <Clock className="h-4 w-4 text-[#4AC8E8]" />
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
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#4AC8E8]/50 to-transparent" />
            
            <div className="space-y-8 lg:space-y-0">
              {processSteps.map((step, index) => (
                <div 
                  key={step.step}
                  className={`relative lg:grid lg:grid-cols-2 lg:gap-12 ${index !== processSteps.length - 1 ? 'lg:pb-12' : ''}`}
                >
                  {/* Content side */}
                  <div className={`${index % 2 === 0 ? 'lg:pr-16 lg:text-right' : 'lg:col-start-2 lg:pl-16'}`}>
                    <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#4AC8E8]/50 transition-colors ${index % 2 === 0 ? '' : 'lg:ml-0'}`}>
                      {/* Step number and duration */}
                      <div className={`flex items-center gap-3 mb-4 ${index % 2 === 0 ? 'lg:justify-end' : ''}`}>
                        <span className="text-3xl font-bold text-[#4AC8E8]">{step.step}</span>
                        <span className="px-3 py-1 rounded-full bg-[#4AC8E8]/20 text-[#4AC8E8] text-xs font-medium">
                          {step.duration}
                        </span>
                      </div>
                      
                      {/* Icon and title */}
                      <div className={`flex items-center gap-3 mb-3 ${index % 2 === 0 ? 'lg:justify-end' : ''}`}>
                        <step.icon className="h-5 w-5 text-[#4AC8E8]" />
                        <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                      </div>
                      
                      <p className="text-white/60 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Center node */}
                  <div className="hidden lg:flex absolute left-1/2 top-6 -translate-x-1/2">
                    <div className="w-4 h-4 rounded-full bg-[#4AC8E8] ring-4 ring-[#1A1917] shadow-lg shadow-[#4AC8E8]/50" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats & Awards Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
            {keyStats.map((stat) => (
              <div key={stat.label} className="text-center p-6 bg-white rounded-2xl border border-[#E0DFDC]/30 shadow-sm">
                <p className="text-3xl lg:text-4xl font-bold text-[#4AC8E8]">{stat.value}</p>
                <p className="mt-2 text-sm text-[#8A8880]">{stat.label}</p>
              </div>
            ))}
          </div>
          
          {/* Awards section */}
          <div className="bg-gradient-to-br from-[#1A1917] to-[#3D3B37] rounded-3xl p-8 lg:p-12">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-semibold text-white">Accreditations & Memberships</h3>
              <p className="mt-2 text-white/60">Trusted by industry leaders and regulated by professional bodies</p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {awards.map((award) => (
                <div key={award.name} className="bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-colors">
                  <Award className="h-8 w-8 text-[#4AC8E8] mx-auto mb-3" />
                  <p className="font-semibold text-white text-sm">{award.name}</p>
                  <p className="text-xs text-white/50 mt-1">{award.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-28 bg-[#F4F3F1]">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {/* Section header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4AC8E8]/10 border border-[#4AC8E8]/20 mb-6">
              <Star className="h-4 w-4 text-[#4AC8E8]" />
              <span className="text-sm font-medium text-[#1A9BBF]">Client Testimonials</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-semibold text-[#1A1917]">
              What Our Clients Say
            </h2>
            <p className="mt-4 text-lg text-[#8A8880]">
              Don't just take our word for it – hear from the people we've helped.
            </p>
          </div>
          
          {/* Testimonials grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 border border-[#E0DFDC]/30 shadow-sm hover:shadow-lg transition-shadow relative"
              >
                {/* Quote marks */}
                <div className="absolute -top-4 left-6 w-8 h-8 bg-[#4AC8E8] rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-serif">"</span>
                </div>
                
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#4AC8E8] text-[#4AC8E8]" />
                  ))}
                </div>
                
                {/* Quote */}
                <p className="text-[#3D3B37] leading-relaxed mb-6">
                  "{testimonial.quote}"
                </p>
                
                {/* Author */}
                <div className="pt-4 border-t border-[#E0DFDC]/30">
                  <p className="font-semibold text-[#1A1917]">{testimonial.author}</p>
                  <p className="text-sm text-[#8A8880]">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Link to all reviews */}
          <div className="text-center">
            <Link href="/reviews">
              <Button variant="outline" className="border-[#4AC8E8] text-[#4AC8E8] hover:bg-[#4AC8E8] hover:text-white px-8">
                Read All Reviews
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-24 bg-[#4AC8E8]">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-semibold text-white">
              Ready to Experience the Banc Difference?
            </h2>
            <p className="mt-4 text-lg text-white/90">
              Whether you're selling, letting, buying, or renting, we're here to help you achieve your property goals.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/valuation">
                <Button className="bg-white text-[#4AC8E8] hover:bg-white/90 px-8 py-6 text-base font-semibold rounded-xl shadow-lg shadow-black/10">
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
              Call us: <a href="tel:01707877781" className="font-semibold text-white hover:underline">01707 877781</a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
