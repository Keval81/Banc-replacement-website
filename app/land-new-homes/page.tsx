import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  Mail, 
  ArrowRight, 
  Home, 
  MapPin, 
  Building2, 
  Landmark, 
  TrendingUp, 
  Shield, 
  Clock, 
  Users,
  CheckCircle2,
  Sparkles
} from "lucide-react";

export const metadata: Metadata = {
  title: "Land & New Homes | Banc Property Services",
  description: "Specialist land and new homes services in North London and Hertfordshire. Expert marketing campaigns for new property developments and land acquisition.",
  keywords: "land acquisition, new homes, property development, marketing campaigns, North London, Hertfordshire, developers, builders",
  openGraph: {
    title: "Land & New Homes | Banc Property Services",
    description: "Expert marketing campaigns for new property developments across North London and Hertfordshire.",
    type: "website",
  },
};

export default function LandNewHomesPage() {
  return (
    <div className="min-h-screen bg-[#F4F3F1]">
      <Header />
      
      {/* Premium Hero Section */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1783858828529-6f5354095c60?w=1920&q=80"
            alt="Modern architectural development"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1917]/95 via-[#1A1917]/85 to-[#1A1917]/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1917] via-transparent to-transparent" />
        </div>
        
        {/* Animated Accent Lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#4AC8E8]/30 to-transparent" />
          <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-[#4AC8E8]/20 to-transparent" />
          <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-[#4AC8E8]/30 to-transparent" />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4AC8E8]/10 border border-[#4AC8E8]/30 mb-8">
              <Sparkles className="w-4 h-4 text-[#4AC8E8]" />
              <span className="text-sm font-medium text-[#4AC8E8] tracking-wide">Premium Development Services</span>
            </div>
            
            {/* Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]">
              Land &<br />
              <span className="text-[#4AC8E8]">New Homes</span>
            </h1>
            
            {/* Description */}
            <p className="mt-8 text-xl text-white/80 leading-relaxed max-w-2xl">
              Expert marketing campaigns for new property developments and land opportunities 
              across North London and Hertfordshire. Partner with specialists who understand 
              the developer mindset.
            </p>
            
            {/* CTA Buttons */}
            <div className="mt-10 flex flex-wrap gap-4">
              <Button 
                asChild
                size="lg"
                className="bg-[#4AC8E8] hover:bg-[#1A9BBF] text-white px-8 py-6 text-base font-semibold rounded-full group"
              >
                <a href="#contact">
                  <Phone className="mr-2 h-5 w-5" />
                  Discuss Your Project
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button 
                asChild
                variant="outline" 
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-base rounded-full"
              >
                <a href="#services">Explore Services</a>
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#4AC8E8]/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[#4AC8E8]" />
                </div>
                <span className="text-white/70 text-sm">Bespoke Campaigns</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#4AC8E8]/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[#4AC8E8]" />
                </div>
                <span className="text-white/70 text-sm">Local Expertise</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#4AC8E8]/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[#4AC8E8]" />
                </div>
                <span className="text-white/70 text-sm">Proven Results</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2">
          <span className="text-white/50 text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-[#4AC8E8] to-transparent" />
        </div>
      </section>

      {/* Section 1: Land & New Homes - Image Left, Text Right */}
      <section id="services" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            {/* Image Side */}
            <div className="relative group">
              {/* Main Image */}
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80"
                  alt="Contemporary apartment development"
                  className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1917]/60 via-transparent to-transparent" />
                
                {/* Services Overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg">
                      <Building2 className="w-6 h-6 text-[#4AC8E8] mx-auto mb-2" />
                      <p className="text-sm font-bold text-[#1A1917]">New Homes</p>
                      <p className="text-xs text-[#8A8880]">Marketing</p>
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg">
                      <TrendingUp className="w-6 h-6 text-[#4AC8E8] mx-auto mb-2" />
                      <p className="text-sm font-bold text-[#1A1917]">Land</p>
                      <p className="text-xs text-[#8A8880]">Acquisition</p>
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg">
                      <Users className="w-6 h-6 text-[#4AC8E8] mx-auto mb-2" />
                      <p className="text-sm font-bold text-[#1A1917]">Director</p>
                      <p className="text-xs text-[#8A8880]">Led Service</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#4AC8E8]/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-[#4AC8E8]/10 rounded-full blur-3xl" />
              
              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-[#4AC8E8] text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
                <Home className="w-4 h-4" />
                <span className="text-sm font-semibold">New Homes</span>
              </div>
            </div>
            
            {/* Content Side */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4AC8E8]/10 mb-6">
                <Building2 className="w-4 h-4 text-[#4AC8E8]" />
                <span className="text-sm font-medium text-[#4AC8E8] uppercase tracking-wider">Development Services</span>
              </div>
              
              <h2 className="text-4xl sm:text-5xl font-bold text-[#1A1917] leading-tight">
                Land & New Homes
              </h2>
              
              <div className="mt-8 space-y-6 text-[#3D3B37] leading-relaxed text-lg">
                <p>
                  The directors at Banc have a wealth of experience in providing marketing 
                  campaigns for new property developments in North London and Hertfordshire. 
                  With years of experience in establishing bespoke campaigns for our clients, 
                  we have the skills and local knowledge required to get the most out of your 
                  new developments.
                </p>
                <p>
                  We offer a comprehensive service when promoting your new home, working 
                  closely with you to ensure your properties gain the level of exposure 
                  needed to create a swift and effective return on your investment.
                </p>
                <p>
                  We have experience working with a wide range of clients including builders, 
                  developers and private investors across the Hertfordshire area. Whether you 
                  are developing a block of contemporary apartments, an individual bespoke 
                  home or a collection of new houses, please contact us to find out how we 
                  can provide you with a campaign that will be tailored to your needs.
                </p>
                <p className="font-medium text-[#1A1917]">
                  In addition we can offer strategic advice right the way through from planning 
                  stages to implementation of a prolific and successful campaign.
                </p>
              </div>
              
              {/* Feature List */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  "Bespoke Marketing Campaigns",
                  "Strategic Planning Advice",
                  "Maximum Property Exposure",
                  "Local Market Expertise"
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#4AC8E8]/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-[#4AC8E8]" />
                    </div>
                    <span className="text-[#3D3B37] text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Land Acquisition - Text Left, Image Right */}
      <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #1A1917 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <div className="mx-auto max-w-7xl px-6 lg:px-10 relative">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            {/* Content Side */}
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4AC8E8]/10 mb-6">
                <Landmark className="w-4 h-4 text-[#4AC8E8]" />
                <span className="text-sm font-medium text-[#4AC8E8] uppercase tracking-wider">Land Opportunities</span>
              </div>
              
              <h2 className="text-4xl sm:text-5xl font-bold text-[#1A1917] leading-tight">
                Land Acquisition
              </h2>
              
              <div className="mt-8 space-y-6 text-[#3D3B37] leading-relaxed text-lg">
                <p>
                  We care about our local area and the people in the area. Our land department 
                  exists to provide expert advice to those who own land and property where there 
                  may be the possibility of development or redevelopment.
                </p>
                <p>
                  We work hard with land owners and land buyers, helping us to build strong 
                  long standing relationships across our local communities.
                </p>
                <p className="font-medium text-[#1A1917]">
                  If you have a property or land which you think could have development potential, 
                  we would be delighted to hear from you.
                </p>
              </div>
              
              {/* Contact Highlight Box */}
              <div className="mt-8 p-6 bg-gradient-to-r from-[#4AC8E8]/10 to-transparent rounded-2xl border-l-4 border-[#4AC8E8]">
                <p className="text-[#3D3B37] leading-relaxed">
                  Please call <strong className="text-[#1A1917]">Nitesh Bheda</strong> or <strong className="text-[#1A1917]">Andrew Crump</strong> on <a href="tel:01707877781" className="text-[#4AC8E8] font-semibold hover:underline">01707 877781</a> alternatively email <a href="mailto:nitesh@bancproperty.com" className="text-[#4AC8E8] hover:underline">nitesh@bancproperty.com</a> or <a href="mailto:andrew@bancproperty.com" className="text-[#4AC8E8] hover:underline">andrew@bancproperty.com</a> to discuss your enquiry.
                </p>
              </div>
              
              {/* Confidentiality Badge */}
              <div className="mt-6 inline-flex items-center gap-3 px-5 py-3 bg-[#1A1917] rounded-full">
                <Shield className="w-5 h-5 text-[#4AC8E8]" />
                <span className="text-white font-medium text-sm">All conversations strictly confidential & without obligation</span>
              </div>
            </div>
            
            {/* Image Side */}
            <div className="relative group order-1 lg:order-2">
              {/* Main Image */}
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1448630360428-65456885c650?w=1200&q=80"
                  alt="Land development opportunity"
                  className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1917]/40 via-transparent to-transparent" />
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#4AC8E8]/20 rounded-full blur-3xl" />
              <div className="absolute -top-6 -right-6 w-40 h-40 bg-[#4AC8E8]/10 rounded-full blur-3xl" />
              
              {/* Floating Card */}
              <div className="absolute bottom-8 -left-8 bg-white rounded-2xl shadow-xl p-6 max-w-xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#4AC8E8]/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#4AC8E8]" />
                  </div>
                  <span className="font-semibold text-[#1A1917]">Local Expertise</span>
                </div>
                <p className="text-sm text-[#8A8880]">Deep knowledge of North London and Hertfordshire development opportunities</p>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -top-4 -left-4 bg-[#1A1917] text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
                <Landmark className="w-4 h-4 text-[#4AC8E8]" />
                <span className="text-sm font-semibold">Land Team</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dark Contact CTA Section */}
      <section id="contact" className="py-24 lg:py-32 bg-[#1A1917] relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#4AC8E8]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#4AC8E8]/5 rounded-full blur-[120px]" />
        </div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>
        
        <div className="mx-auto max-w-7xl px-6 lg:px-10 relative">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4AC8E8]/10 border border-[#4AC8E8]/30 mb-6">
              <Phone className="w-4 h-4 text-[#4AC8E8]" />
              <span className="text-sm font-medium text-[#4AC8E8] uppercase tracking-wider">Get In Touch</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
              Contact Our Land<br />& New Homes Team
            </h2>
            <p className="mt-6 text-lg text-white/70 leading-relaxed">
              Ready to discuss your development project? Our specialists are here to help 
              maximise your investment potential.
            </p>
          </div>
          
          {/* Contact Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {/* Phone Card */}
            <a 
              href="tel:01707877781" 
              className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#4AC8E8]/50 rounded-2xl p-6 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#4AC8E8]/0 to-[#4AC8E8]/0 group-hover:from-[#4AC8E8]/5 group-hover:to-transparent rounded-2xl transition-all duration-300" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-[#4AC8E8]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Phone className="h-6 w-6 text-[#4AC8E8]" />
                </div>
                <p className="text-sm text-white/50 mb-1">Call Us</p>
                <p className="text-xl font-bold text-white group-hover:text-[#4AC8E8] transition-colors">01707 877781</p>
                <div className="mt-4 flex items-center gap-2 text-[#4AC8E8] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Call Now</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </a>
            
            {/* Nitesh Email Card */}
            <a 
              href="mailto:nitesh@bancproperty.com" 
              className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#4AC8E8]/50 rounded-2xl p-6 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#4AC8E8]/0 to-[#4AC8E8]/0 group-hover:from-[#4AC8E8]/5 group-hover:to-transparent rounded-2xl transition-all duration-300" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-[#4AC8E8]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Mail className="h-6 w-6 text-[#4AC8E8]" />
                </div>
                <p className="text-sm text-white/50 mb-1">Nitesh Bheda</p>
                <p className="text-sm font-semibold text-white group-hover:text-[#4AC8E8] transition-colors truncate">nitesh@bancproperty.com</p>
                <div className="mt-4 flex items-center gap-2 text-[#4AC8E8] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Send Email</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </a>
            
            {/* Andrew Email Card */}
            <a 
              href="mailto:andrew@bancproperty.com" 
              className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#4AC8E8]/50 rounded-2xl p-6 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#4AC8E8]/0 to-[#4AC8E8]/0 group-hover:from-[#4AC8E8]/5 group-hover:to-transparent rounded-2xl transition-all duration-300" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-[#4AC8E8]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Mail className="h-6 w-6 text-[#4AC8E8]" />
                </div>
                <p className="text-sm text-white/50 mb-1">Andrew Crump</p>
                <p className="text-sm font-semibold text-white group-hover:text-[#4AC8E8] transition-colors truncate">andrew@bancproperty.com</p>
                <div className="mt-4 flex items-center gap-2 text-[#4AC8E8] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Send Email</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </a>
            
            {/* Confidential Badge Card */}
            <div className="relative bg-gradient-to-br from-[#4AC8E8]/20 to-[#4AC8E8]/5 border border-[#4AC8E8]/30 rounded-2xl p-6">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-[#4AC8E8]/30 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-[#4AC8E8]" />
                </div>
                <p className="text-sm text-white/50 mb-1">Our Promise</p>
                <p className="text-lg font-bold text-white">Strictly Confidential</p>
                <p className="mt-2 text-sm text-white/60">All conversations without obligation</p>
              </div>
            </div>
          </div>
          
          {/* Response Time Banner */}
          <div className="mt-10 flex justify-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 rounded-full border border-white/10">
              <Clock className="w-5 h-5 text-[#4AC8E8]" />
              <span className="text-white/80">We aim to respond to all enquiries within <span className="text-[#4AC8E8] font-semibold">24 hours</span></span>
            </div>
          </div>
          
          {/* Main CTA Buttons */}
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Button 
              asChild
              size="lg"
              className="bg-[#4AC8E8] hover:bg-[#1A9BBF] text-white px-10 py-7 text-lg font-semibold rounded-full group"
            >
              <a href="tel:01707877781">
                <Phone className="mr-3 h-5 w-5" />
                Call Now
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button 
              asChild
              variant="outline" 
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 px-10 py-7 text-lg rounded-full"
            >
              <a href="mailto:nitesh@bancproperty.com">
                <Mail className="mr-3 h-5 w-5" />
                Email Us
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
