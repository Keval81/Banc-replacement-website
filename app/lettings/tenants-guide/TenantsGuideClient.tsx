"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Calculator, 
  ClipboardList, 
  Eye, 
  FileText, 
  PenTool, 
  Zap, 
  PoundSterling, 
  CheckCircle,
  ShieldCheck,
  Home,
  Users,
  MapPin,
  Clock,
  FileCheck,
  Wallet,
  Lightbulb,
  Key,
  BadgeCheck,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { TENANT_FEES, TENANT_GUIDE_SECTIONS } from "@/lib/banc-content/tenants-guide";

const sectionVisuals = [
  { icon: Calculator, highlightIcons: [Wallet, Clock, ShieldCheck] },
  { icon: ClipboardList, highlightIcons: [MapPin, Home, Users] },
  { icon: Eye, highlightIcons: [Lightbulb, Clock, MapPin] },
  { icon: FileText, highlightIcons: [FileCheck, Users, Clock] },
  { icon: PenTool, highlightIcons: [Key, Clock, FileCheck] },
  { icon: Zap, highlightIcons: [Lightbulb, Clock, Wallet] },
] as const;

const sections = TENANT_GUIDE_SECTIONS.map((section, index) => {
  const visual = sectionVisuals[index];

  return {
    ...section,
    icon: visual.icon,
    highlights: section.highlights?.map((text, highlightIndex) => ({
      icon: visual.highlightIcons[highlightIndex],
      text,
    })),
  };
});

const tenantFees = TENANT_FEES.map((fee, index) => ({
  ...fee,
  icon: [Wallet, ShieldCheck, Clock, Key, FileCheck, Users, Home][index],
}));

export default function TenantsGuideClient() {
  return (
    <div className="min-h-screen bg-[var(--off-white)]">
      <Header />
      
      {/* Premium Hero Section */}
      <section className="relative bg-banc-dark-deep overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-banc-dark-deep/80 via-banc-dark-deep/60 to-banc-dark-deep/40" />
        </div>
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-banc-sky/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-banc-sky/3 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-banc-sky/10 border border-banc-sky/20 mb-6">
              <Sparkles className="h-4 w-4 text-banc-sky" />
              <span className="text-sm font-medium text-banc-sky tracking-wide uppercase">Tenant Resources</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-tight">
              Tenants Guide
            </h1>
            
            <p className="mt-6 text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl">
              Banc Property Group is proud to be an approved Property Guild agent, so you can be 
              sure of best practice when you rent with us, including helpful advice and complete 
              transparency of charges.
            </p>
            
            <p className="mt-4 text-white/50">
              Whether you&apos;re a first-time renter or experienced tenant, this comprehensive guide 
              will walk you through every step of the renting process.
            </p>
            
            {/* Quick navigation */}
            <div className="mt-10 flex flex-wrap gap-3">
              {sections.map((section) => (
                <Link 
                  key={section.id}
                  href={`#${section.id}`}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/80 hover:bg-banc-sky/20 hover:border-banc-sky/30 hover:text-white transition-all duration-300"
                >
                  {section.number} {section.title}
                </Link>
              ))}
              <Link 
                href="#fees"
                className="px-4 py-2 rounded-lg bg-banc-sky/20 border border-banc-sky/30 text-sm text-banc-sky hover:bg-banc-sky/30 transition-all duration-300"
              >
                07 Tenant Fees
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--off-white)] to-transparent" />
      </section>

      {/* Main Guide Sections */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-20 lg:gap-24">
            {sections.map((section, index) => (
              <motion.div 
                key={section.id} 
                id={section.id} 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="scroll-mt-28"
              >
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
                  {/* Number & Icon */}
                  <div className="flex items-center gap-4 md:w-48 flex-shrink-0">
                    <span className="text-5xl font-bold text-banc-focus/20 font-heading">
                      {section.number}
                    </span>
                    <div className="w-14 h-14 rounded-2xl bg-banc-sky flex items-center justify-center shadow-lg shadow-banc-sky/20">
                      <section.icon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  
                  {/* Title */}
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-semibold text-banc-dark-deep tracking-tight">
                      {section.title}
                    </h2>
                  </div>
                </div>
                
                {/* Content Grid */}
                <div className="md:ml-52">
                  {section.intro && (
                    <p className="text-banc-dark-deep font-medium mb-4 text-lg">{section.intro}</p>
                  )}
                  
                  <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main content */}
                    <div className="lg:col-span-2">
                      <ul className="space-y-4">
                        {section.content.map((item, i) => (
                          <motion.li 
                            key={i} 
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-start gap-4"
                          >
                            <span className="w-2 h-2 rounded-full bg-banc-sky mt-2.5 flex-shrink-0" />
                            <span className="text-banc-muted-readable leading-relaxed">{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                      
                      {/* Moving day checklist */}
                      {section.checklist && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          className="mt-8 p-6 bg-white rounded-2xl border border-banc-line shadow-sm"
                        >
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-banc-dark-deep flex items-center justify-center">
                              <CheckCircle className="h-5 w-5 text-banc-sky" />
                            </div>
                            <h3 className="font-semibold text-banc-dark-deep">Moving Day Checklist</h3>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {section.checklist.map((item, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-banc-grey-pale">
                                <div className="w-5 h-5 rounded-full border-2 border-banc-sky/30 flex items-center justify-center flex-shrink-0">
                                  <div className="w-2 h-2 rounded-full bg-banc-sky" />
                                </div>
                                <span className="text-sm text-banc-muted-readable">{item}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Highlights sidebar */}
                    {section.highlights && (
                      <div className="lg:col-span-1">
                        <div className="p-6 bg-banc-dark-deep rounded-2xl">
                          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">
                            Pro Tips
                          </h3>
                          <div className="space-y-4">
                            {section.highlights.map((highlight, i) => (
                              <div key={i} className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-banc-sky/20 flex items-center justify-center flex-shrink-0">
                                  <highlight.icon className="h-4 w-4 text-banc-sky" />
                                </div>
                                <span className="text-sm text-white/80">{highlight.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Divider */}
                {index < sections.length - 1 && (
                  <div className="mt-16 pt-16 border-t border-banc-line">
                    <div className="flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-banc-sky/30" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tenant Fees Section - Premium Table Design */}
      <section id="fees" className="py-20 lg:py-28 bg-banc-dark-deep relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-banc-sky/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-banc-sky/3 rounded-full blur-3xl" />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 mb-6">
              <span className="text-6xl font-bold text-banc-sky/20 font-heading">07</span>
              <div className="w-16 h-16 rounded-2xl bg-banc-sky flex items-center justify-center shadow-lg shadow-banc-sky/20">
                <PoundSterling className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-tight">
              Tenant Fees
            </h2>
            
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <BadgeCheck className="h-4 w-4 text-banc-sky" />
              <span className="text-sm text-white/70">
                Tenant Fees Act 2019 — Assured Shorthold Tenancies signed on or after 1 June 2019
              </span>
            </div>
          </motion.div>
          
          {/* Premium Fee Cards */}
          <div className="grid gap-4 max-w-5xl mx-auto">
            {tenantFees.map((fee, index) => (
              <motion.div
                key={fee.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="group"
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 lg:p-8 hover:bg-white/10 hover:border-banc-sky/30 transition-all duration-300">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-xl bg-banc-sky/20 flex items-center justify-center flex-shrink-0 group-hover:bg-banc-sky/30 transition-colors">
                      <fee.icon className="h-7 w-7 text-banc-sky" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{fee.title}</h3>
                      <p className="text-white/60 leading-relaxed">{fee.description}</p>
                    </div>
                    
                    {/* Amount */}
                    <div className="lg:text-right flex-shrink-0">
                      <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-banc-sky/20 border border-banc-sky/30">
                        <span className="text-banc-sky font-semibold whitespace-nowrap">{fee.amount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Footer note */}
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-10 text-center text-sm text-white/50 max-w-2xl mx-auto"
          >
            All fees are inclusive of VAT where applicable. These fees are accurate as of the Tenant Fees Act 2019. 
            For any questions about fees or charges, please contact our lettings team who will be happy to help.
          </motion.p>
        </div>
      </section>

      {/* Property Guild Approval Section - Premium Badge */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-banc-dark-deep to-banc-dark-mid p-10 lg:p-16"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-banc-sky/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-banc-sky/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
            
            <div className="relative flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
              {/* Badge/Icon side */}
              <div className="flex-shrink-0">
                <div className="w-28 h-28 rounded-full bg-banc-sky flex items-center justify-center shadow-2xl shadow-banc-sky/30">
                  <ShieldCheck className="h-14 w-14 text-white" />
                </div>
              </div>
              
              {/* Content side */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-banc-sky/20 border border-banc-sky/30 mb-4">
                  <BadgeCheck className="h-4 w-4 text-banc-focus" />
                  <span className="text-sm font-medium text-banc-focus">Accredited Agent</span>
                </div>
                
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-4">
                  Property Guild Approved Agent
                </h3>
                
                <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
                  Banc Property Group is proud to be an approved Property Guild agent, demonstrating 
                  our unwavering commitment to best practice, professional standards, and complete 
                  transparency in all our lettings services. When you rent with us, you can be confident 
                  you&apos;re working with a trusted, accredited agency.
                </p>
                
                <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
                  <div className="flex items-center gap-2 text-white/60">
                    <CheckCircle className="h-5 w-5 text-banc-focus" />
                    <span>Professional Standards</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <CheckCircle className="h-5 w-5 text-banc-focus" />
                    <span>Transparent Fees</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <CheckCircle className="h-5 w-5 text-banc-focus" />
                    <span>Client Money Protection</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-banc-sky relative overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <div className="relative mx-auto max-w-4xl px-6 lg:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-tight">
              Ready to find your perfect rental home?
            </h2>
            
            <p className="mt-6 text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Browse our available properties or register your requirements with our lettings team 
              for personalised recommendations.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/lettings/properties">
                <Button 
                  size="lg"
                  className="bg-white text-banc-focus hover:bg-white/90 px-8 py-6 text-base font-semibold rounded-xl shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-black/20 transition-all duration-300"
                >
                  Browse Properties
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                size="lg"
                variant="outline" 
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-base font-semibold rounded-xl transition-all duration-300"
              >
                Register Your Requirements
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
