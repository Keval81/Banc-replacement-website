"use client";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
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

interface GuideSection {
  id: string;
  number: string;
  icon: React.ElementType;
  title: string;
  intro?: string;
  content: string[];
  checklist?: string[];
  highlights?: { icon: React.ElementType; text: string }[];
}

const sections: GuideSection[] = [
  {
    id: "budget",
    number: "01",
    icon: Calculator,
    title: "Fixing a Budget",
    content: [
      "Letting agents have strict affordability guidelines, usually based on a percentage of your yearly salary",
      "Commission and overtime are not generally counted, though savings can be considered in certain circumstances",
      "Contact us before making an offer to ensure your budget meets our criteria",
      "Remember to budget for bills as well as rent: council tax, contents insurance, utilities, cable, travel, and parking"
    ],
    highlights: [
      { icon: Wallet, text: "Calculate total monthly outgoings" },
      { icon: Clock, text: "Factor in commute costs" },
      { icon: ShieldCheck, text: "Consider contents insurance" }
    ]
  },
  {
    id: "requirements",
    number: "02",
    icon: ClipboardList,
    title: "Working Out Your Requirements",
    intro: "Before you start your search, consider the following:",
    content: [
      "Location — town, rural, close to schools, transport links, shops, or countryside (see our Area Guides)",
      "Property size — how many bedrooms, living rooms, and bathrooms do you need?",
      "Furnishing — furnished, unfurnished, or flexible on either",
      "Occupants — who will be living there, including ages of any children",
      "Pets — do you have any pets that will be moving with you?",
      "Tenancy length — how long are you looking to rent for?",
      "Timing — do you have a specific move-in date or are you flexible?",
      "Credit history — do you have any adverse credit history to declare?"
    ],
    highlights: [
      { icon: MapPin, text: "Research neighbourhoods thoroughly" },
      { icon: Home, text: "List must-haves vs nice-to-haves" },
      { icon: Users, text: "Confirm who will be on the tenancy" }
    ]
  },
  {
    id: "viewing",
    number: "03",
    icon: Eye,
    title: "Viewing Properties",
    content: [
      "Take a notepad and prepare questions in advance",
      "Ask about fixtures, fittings, the neighbourhood, and the landlords",
      "The rental market moves quickly — make viewing times a priority and arrive promptly",
      "Stay in the neighbourhood afterwards to soak up the atmosphere and explore local amenities",
      "Do a dummy-run of your commute if the area is unfamiliar to you"
    ],
    highlights: [
      { icon: Lightbulb, text: "Test mobile signal in the property" },
      { icon: Clock, text: "Visit at different times of day" },
      { icon: MapPin, text: "Check local transport connections" }
    ]
  },
  {
    id: "applying",
    number: "04",
    icon: FileText,
    title: "Applying for a Tenancy",
    content: [
      "All offers must be submitted through the letting agent",
      "Provide full details of all prospective tenants",
      "Specify any fixtures or fittings you would like included",
      "State your proposed moving date and preferred tenancy length",
      "Disclose details of any children and pets",
      "Provide two forms of ID for all tenants and guarantors (passport plus a utility bill or bank statement less than 3 months old)",
      "Complete Banc tenancy application forms and provide references",
      "Remember that all offers are subject to satisfactory references and agreement of the tenancy agreement"
    ],
    highlights: [
      { icon: FileCheck, text: "Have documents ready in advance" },
      { icon: Users, text: "Be transparent about all occupants" },
      { icon: Clock, text: "Respond quickly to requests" }
    ]
  },
  {
    id: "signing",
    number: "05",
    icon: PenTool,
    title: "Signing the Tenancy Agreement",
    content: [
      "Three identical copies of the tenancy agreement will be provided",
      "Read the agreement carefully, sign all copies, and return them promptly",
      "Ask questions before signing if anything is unclear — the agreement is legally binding once signed",
      "Transfer your first rental payment and security deposit at least 48 hours before moving",
      "Arrange a convenient time to take possession of the property",
      "Moving day is when most agreements are signed and keys are released"
    ],
    checklist: [
      "Book removals company",
      "Redirect your post",
      "Tell friends and family your new address",
      "Read utility meters on moving day",
      "Cancel old services and set up new ones",
      "Change your TV Licence address",
      "Inform council tax authority"
    ],
    highlights: [
      { icon: Key, text: "Keep copies of all documents" },
      { icon: Clock, text: "Arrange key collection in advance" },
      { icon: FileCheck, text: "Photograph meter readings" }
    ]
  },
  {
    id: "utilities",
    number: "06",
    icon: Zap,
    title: "Utilities",
    content: [
      "Please note that rent does NOT include utilities. You will be responsible for setting up and paying for:",
      "Gas and electricity supply and usage",
      "Water rates and sewerage charges",
      "Council tax (determined by your local authority)",
      "TV Licence",
      "Telephone line rental and call charges",
      "Internet and broadband services"
    ],
    highlights: [
      { icon: Lightbulb, text: "Compare energy providers early" },
      { icon: Clock, text: "Set up utilities before move-in" },
      { icon: Wallet, text: "Budget £150-250/month for bills" }
    ]
  }
];

interface TenantFee {
  title: string;
  amount: string;
  description: string;
  icon: React.ElementType;
}

const tenantFees: TenantFee[] = [
  {
    title: "Holding Deposit",
    amount: "One week's rent",
    description: "To reserve the property. This will be withheld if you withdraw, fail Right to Rent checks, provide false or misleading information, or fail to sign the tenancy agreement.",
    icon: Wallet
  },
  {
    title: "Security Deposit",
    amount: "5 weeks (<£50k) / 6 weeks (>£50k)",
    description: "Covered under the Tenant Fees Act 2019. This covers damages or defaults by the tenant during the tenancy. Protected in a government-approved scheme.",
    icon: ShieldCheck
  },
  {
    title: "Unpaid Rent Interest",
    amount: "3% above BoE base rate",
    description: "Interest charged on unpaid rent from the due date, applicable only after the rent has been outstanding for 14 days or more.",
    icon: Clock
  },
  {
    title: "Lost Keys / Security Device",
    amount: "Actual cost + £15/hr",
    description: "Cost of replacement keys or security devices, plus £15 per hour for any additional time required to facilitate the replacement.",
    icon: Key
  },
  {
    title: "Variation of Contract",
    amount: "£100 (incl. VAT)",
    description: "Fee payable when a tenant requests a change to the tenancy agreement terms, such as adding a permitted occupier or amending clauses.",
    icon: FileCheck
  },
  {
    title: "Change of Sharer",
    amount: "£100 per replacement (incl. VAT)",
    description: "Fee for adding or changing a tenant on the agreement. Covers new tenant referencing, Right to Rent checks, and associated paperwork.",
    icon: Users
  },
  {
    title: "Early Termination",
    amount: "Landlord's re-letting costs",
    description: "Should you wish to terminate your tenancy early, you will be liable for the landlord's reasonable costs in re-letting the property, plus all rent due until the new tenancy begins.",
    icon: Home
  }
];

export default function TenantsGuideClient() {
  return (
    <div className="min-h-screen bg-[var(--off-white)]">
      <Header />
      
      {/* Premium Hero Section */}
      <section className="relative bg-[#2C2F33] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#1DBFDD]/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#1DBFDD]/3 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1DBFDD]/10 border border-[#1DBFDD]/20 mb-6">
              <Sparkles className="h-4 w-4 text-[#1DBFDD]" />
              <span className="text-sm font-medium text-[#1DBFDD] tracking-wide uppercase">Tenant Resources</span>
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
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/80 hover:bg-[#1DBFDD]/20 hover:border-[#1DBFDD]/30 hover:text-white transition-all duration-300"
                >
                  {section.number} {section.title}
                </Link>
              ))}
              <Link 
                href="#fees"
                className="px-4 py-2 rounded-lg bg-[#1DBFDD]/20 border border-[#1DBFDD]/30 text-sm text-[#1DBFDD] hover:bg-[#1DBFDD]/30 transition-all duration-300"
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
                    <span className="text-5xl font-bold text-[#1DBFDD]/20 font-heading">
                      {section.number}
                    </span>
                    <div className="w-14 h-14 rounded-2xl bg-[#1DBFDD] flex items-center justify-center shadow-lg shadow-[#1DBFDD]/20">
                      <section.icon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  
                  {/* Title */}
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-semibold text-[#2C2F33] tracking-tight">
                      {section.title}
                    </h2>
                  </div>
                </div>
                
                {/* Content Grid */}
                <div className="md:ml-52">
                  {section.intro && (
                    <p className="text-[#2C2F33] font-medium mb-4 text-lg">{section.intro}</p>
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
                            <span className="w-2 h-2 rounded-full bg-[#1DBFDD] mt-2.5 flex-shrink-0" />
                            <span className="text-[#6B6E72] leading-relaxed">{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                      
                      {/* Moving day checklist */}
                      {section.checklist && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          className="mt-8 p-6 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm"
                        >
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-[#2C2F33] flex items-center justify-center">
                              <CheckCircle className="h-5 w-5 text-[#1DBFDD]" />
                            </div>
                            <h3 className="font-semibold text-[#2C2F33]">Moving Day Checklist</h3>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {section.checklist.map((item, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#F9FAFB]">
                                <div className="w-5 h-5 rounded-full border-2 border-[#1DBFDD]/30 flex items-center justify-center flex-shrink-0">
                                  <div className="w-2 h-2 rounded-full bg-[#1DBFDD]" />
                                </div>
                                <span className="text-sm text-[#6B6E72]">{item}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Highlights sidebar */}
                    {section.highlights && (
                      <div className="lg:col-span-1">
                        <div className="p-6 bg-[#2C2F33] rounded-2xl">
                          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">
                            Pro Tips
                          </h3>
                          <div className="space-y-4">
                            {section.highlights.map((highlight, i) => (
                              <div key={i} className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#1DBFDD]/20 flex items-center justify-center flex-shrink-0">
                                  <highlight.icon className="h-4 w-4 text-[#1DBFDD]" />
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
                  <div className="mt-16 pt-16 border-t border-[#E5E7EB]">
                    <div className="flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#1DBFDD]/30" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tenant Fees Section - Premium Table Design */}
      <section id="fees" className="py-20 lg:py-28 bg-[#2C2F33] relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#1DBFDD]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-[#1DBFDD]/3 rounded-full blur-3xl" />
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
              <span className="text-6xl font-bold text-[#1DBFDD]/20 font-heading">07</span>
              <div className="w-16 h-16 rounded-2xl bg-[#1DBFDD] flex items-center justify-center shadow-lg shadow-[#1DBFDD]/20">
                <PoundSterling className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-tight">
              Tenant Fees
            </h2>
            
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <BadgeCheck className="h-4 w-4 text-[#1DBFDD]" />
              <span className="text-sm text-white/70">
                Tenant Fees Act 2019 — New Assured Shorthold Tenancies
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
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 lg:p-8 hover:bg-white/10 hover:border-[#1DBFDD]/30 transition-all duration-300">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-xl bg-[#1DBFDD]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#1DBFDD]/30 transition-colors">
                      <fee.icon className="h-7 w-7 text-[#1DBFDD]" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{fee.title}</h3>
                      <p className="text-white/60 leading-relaxed">{fee.description}</p>
                    </div>
                    
                    {/* Amount */}
                    <div className="lg:text-right flex-shrink-0">
                      <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#1DBFDD]/20 border border-[#1DBFDD]/30">
                        <span className="text-[#1DBFDD] font-semibold whitespace-nowrap">{fee.amount}</span>
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
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2C2F33] to-[#3A3D42] p-10 lg:p-16"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#1DBFDD]/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#1DBFDD]/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
            
            <div className="relative flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
              {/* Badge/Icon side */}
              <div className="flex-shrink-0">
                <div className="w-28 h-28 rounded-full bg-[#1DBFDD] flex items-center justify-center shadow-2xl shadow-[#1DBFDD]/30">
                  <ShieldCheck className="h-14 w-14 text-white" />
                </div>
              </div>
              
              {/* Content side */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1DBFDD]/20 border border-[#1DBFDD]/30 mb-4">
                  <BadgeCheck className="h-4 w-4 text-[#1DBFDD]" />
                  <span className="text-sm font-medium text-[#1DBFDD]">Accredited Agent</span>
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
                    <CheckCircle className="h-5 w-5 text-[#1DBFDD]" />
                    <span>Professional Standards</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <CheckCircle className="h-5 w-5 text-[#1DBFDD]" />
                    <span>Transparent Fees</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <CheckCircle className="h-5 w-5 text-[#1DBFDD]" />
                    <span>Client Money Protection</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-[#1DBFDD] relative overflow-hidden">
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
                  className="bg-white text-[#1DBFDD] hover:bg-white/90 px-8 py-6 text-base font-semibold rounded-xl shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-black/20 transition-all duration-300"
                >
                  Browse Properties
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                size="lg"
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-base font-semibold rounded-xl transition-all duration-300"
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
