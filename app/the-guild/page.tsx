"use client";

import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Building2, 
  Award, 
  Users, 
  Megaphone, 
  GraduationCap, 
  MapPin,
  ArrowUpRight,
  CheckCircle2,
  Globe,
  Shield
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const benefits = [
  {
    icon: Globe,
    title: "National Reach",
    description: "Access to over 800 independent estate agents across the UK means your property gains exposure to a nationwide audience of qualified buyers.",
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
  { value: "800+", label: "Member Offices" },
  { value: "£12bn", label: "Property Sold Annually" },
  { value: "UK-Wide", label: "Coverage" },
  { value: "1994", label: "Established" },
];

export default function TheGuildPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-[#1a1a1a] min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#4AC8E8]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#4AC8E8]/3 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
        </div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
        
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12 w-full py-24 lg:py-0">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            {/* Left Content */}
            <div className="max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-5 py-2.5 mb-8"
              >
                <Award className="h-4 w-4 text-[#4AC8E8]" />
                <span className="text-sm font-medium text-white/80 tracking-wide">Proud Member</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-white leading-[1.1] tracking-tight"
              >
                The Guild of{" "}
                <span className="text-[#4AC8E8]">Property</span>{" "}
                Professionals
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-8 text-lg lg:text-xl text-white/60 leading-relaxed max-w-xl"
              >
                National Network. Local Independence. We combine the personal service 
                of a local independent estate agent with the reach and resources of 
                a national network.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-10 flex flex-wrap gap-4"
              >
                <Button 
                  className="bg-[#4AC8E8] hover:bg-[#4AC8E8]/90 text-white px-8 py-6 text-base font-medium rounded-full group transition-all duration-300"
                >
                  <Link href="/sales/properties" className="flex items-center">
                    View Properties
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white/20 text-white hover:bg-white/5 hover:border-white/30 px-8 py-6 text-base rounded-full transition-all duration-300"
                >
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </motion.div>
            </div>
            
            {/* Right Content - Guild Logo */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-[#4AC8E8]/20 rounded-3xl blur-[60px] scale-110" />
                
                {/* Logo Container */}
                <div className="relative bg-white rounded-3xl p-12 lg:p-16 shadow-2xl shadow-black/20">
                  <div className="relative w-64 h-64 lg:w-80 lg:h-80">
                    <Image
                      src="/TheGuild_Logo_RGB.jpg"
                      alt="The Guild of Property Professionals"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
                
                {/* Floating Elements */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 -right-6 bg-[#4AC8E8] text-white rounded-2xl p-4 shadow-lg"
                >
                  <Building2 className="h-8 w-8" />
                </motion.div>
                
                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-6 -left-6 bg-white text-[#1a1a1a] rounded-2xl p-4 shadow-lg"
                >
                  <Globe className="h-8 w-8" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2"
          >
            <div className="w-1.5 h-3 bg-[#4AC8E8] rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Introduction Section */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            {/* Image Side */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-[#f5f5f5]">
                <Image
                  src="/map-area.png"
                  alt="Banc Property Group coverage area"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/70 via-transparent to-transparent" />
                
                {/* Badge */}
                <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-3">
                  <div className="w-10 h-10 bg-[#4AC8E8]/10 rounded-xl flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-[#4AC8E8]" />
                  </div>
                  <div>
                    <p className="text-xs text-banc-grey uppercase tracking-wider">Our Promise</p>
                    <p className="text-sm font-semibold text-[#1a1a1a]">Local expertise, national reach</p>
                  </div>
                </div>
              </div>
              
              {/* Decorative */}
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-[#4AC8E8]/5 rounded-full blur-3xl -z-10" />
            </div>
            
            {/* Content Side */}
            <div className="lg:pl-8">
              <div className="inline-flex items-center gap-2 text-[#4AC8E8] mb-6">
                <div className="h-px w-8 bg-[#4AC8E8]" />
                <span className="text-sm font-medium uppercase tracking-[0.2em]">Our Membership</span>
              </div>
              
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-semibold text-[#1a1a1a] leading-tight">
                National Network.<br />
                <span className="text-[#4AC8E8]">Local Independence.</span>
              </h2>
              
              <div className="mt-8 space-y-5">
                <p className="text-lg text-banc-grey leading-relaxed">
                  Banc is proud to be a member of The Guild of Property Professionals, 
                  a prestigious network of independent estate agents across the UK. This 
                  membership reflects our commitment to maintaining the highest standards 
                  of service while benefiting from national exposure and shared expertise.
                </p>
                <p className="text-banc-grey leading-relaxed">
                  Unlike corporate chains, The Guild brings together carefully selected 
                  independent agents who share a passion for exceptional customer service 
                  and deep local knowledge. As a member, we combine our Cuffley and 
                  Mayfair expertise with the resources of a network spanning the entire UK.
                </p>
              </div>
              
              <div className="mt-10 grid grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#4AC8E8]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-[#4AC8E8]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1a1a1a]">Quality Assured</p>
                    <p className="text-sm text-banc-grey mt-1">Rigorous selection process</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#4AC8E8]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-[#4AC8E8]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1a1a1a]">Trusted Network</p>
                    <p className="text-sm text-banc-grey mt-1">Professional excellence</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="bg-[#fafafa] py-24 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          {/* Section Header */}
          <div className="max-w-3xl mx-auto text-center mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 text-[#4AC8E8] mb-6 justify-center">
              <div className="h-px w-8 bg-[#4AC8E8]" />
              <span className="text-sm font-medium uppercase tracking-[0.2em]">Benefits for You</span>
              <div className="h-px w-8 bg-[#4AC8E8]" />
            </div>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-semibold text-[#1a1a1a]">
              What Guild Membership Means
            </h2>
            <p className="mt-6 text-lg text-banc-grey leading-relaxed">
              Our partnership with The Guild delivers tangible advantages that help us 
              achieve better results and provide a superior experience for buyers and 
              sellers alike.
            </p>
          </div>
          
          {/* Benefits Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-2xl p-8 border border-banc-grey/10 hover:border-[#4AC8E8]/30 hover:shadow-xl hover:shadow-[#4AC8E8]/5 transition-all duration-500"
              >
                <div className="w-14 h-14 bg-[#4AC8E8]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#4AC8E8] transition-colors duration-500">
                  <benefit.icon className="h-7 w-7 text-[#4AC8E8] group-hover:text-white transition-colors duration-500" />
                </div>
                <h3 className="text-xl font-semibold text-[#1a1a1a] mb-3 group-hover:text-[#4AC8E8] transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-banc-grey leading-relaxed text-sm">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-[#1a1a1a] py-20 lg:py-28 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#4AC8E8]/10 rounded-full blur-[100px]" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl xl:text-6xl font-bold text-[#4AC8E8] tracking-tight">
                  {stat.value}
                </div>
                <div className="mt-3 text-white/60 text-sm lg:text-base font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About The Guild */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid gap-16 lg:grid-cols-12 items-start">
            {/* Left Column */}
            <div className="lg:col-span-5 lg:sticky lg:top-32">
              <div className="inline-flex items-center gap-2 text-[#4AC8E8] mb-6">
                <div className="h-px w-8 bg-[#4AC8E8]" />
                <span className="text-sm font-medium uppercase tracking-[0.2em]">About The Guild</span>
              </div>
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-semibold text-[#1a1a1a] leading-tight">
                A Network Built on{" "}
                <span className="text-[#4AC8E8]">Excellence</span>
              </h2>
              <div className="mt-8 flex items-center gap-4">
                <div className="w-16 h-16 bg-[#4AC8E8]/10 rounded-2xl flex items-center justify-center">
                  <Award className="h-8 w-8 text-[#4AC8E8]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1a1a1a]">Since 1994</p>
                  <p className="text-banc-grey">30+ years of excellence</p>
                </div>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="lg:col-span-7 space-y-6">
              <p className="text-lg text-banc-grey leading-relaxed">
                Founded in 1994, The Guild of Property Professionals has established itself as 
                one of the UK's most respected networks of independent estate agents. Unlike 
                corporate chains, The Guild champions the independent agency model, recognising 
                that local expertise, community connections, and personalised service are 
                irreplaceable assets in the property market.
              </p>
              <p className="text-banc-grey leading-relaxed">
                Membership is by invitation only, with each member agency undergoing a rigorous 
                selection process to ensure they meet The Guild's exacting standards for customer 
                service, professional conduct, and market knowledge. This selective approach means 
                that when you work with a Guild member like Banc, you can be confident you're 
                working with one of the best agents in your area.
              </p>
              <p className="text-banc-grey leading-relaxed">
                The Guild's collaborative culture means members share best practices, market insights, 
                and resources, while retaining the independence that allows them to provide the 
                personalised service that only a local agent can offer. It's this unique combination 
                that makes Guild membership so valuable to both agents and clients.
              </p>
              
              {/* Quote */}
              <div className="mt-10 bg-[#fafafa] rounded-2xl p-8 border-l-4 border-[#4AC8E8]">
                <p className="text-lg text-[#1a1a1a] italic leading-relaxed">
                  &ldquo;The Guild represents the very best of independent estate agency in the UK. 
                  Being a member allows us to offer our clients the perfect combination of 
                  personal service and national reach.&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#4AC8E8]/10 rounded-full flex items-center justify-center">
                    <span className="text-[#4AC8E8] font-semibold text-sm">B</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1a1a1a] text-sm">Banc Property Group</p>
                    <p className="text-banc-grey text-xs">Proud Guild Member</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#4AC8E8] py-24 lg:py-32 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-semibold text-white mb-6">
                Experience the Guild Difference
              </h2>
              <p className="text-lg lg:text-xl text-white/80 max-w-2xl mx-auto mb-12">
                Whether you&apos;re buying, selling, or letting, benefit from the perfect 
                combination of local expertise and national reach.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  className="bg-white text-[#4AC8E8] hover:bg-white/90 px-10 py-7 text-base font-semibold rounded-full group transition-all duration-300 shadow-lg shadow-black/10"
                >
                  <Link href="/sales/properties" className="flex items-center">
                    Browse Properties
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white/10 px-10 py-7 text-base rounded-full transition-all duration-300"
                >
                  <Link href="/contact" className="flex items-center">
                    Get in Touch
                    <ArrowUpRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
