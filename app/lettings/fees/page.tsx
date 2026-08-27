import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  PoundSterling, 
  Shield, 
  FileText, 
  Info,
  Check,
  AlertCircle,
  ArrowRight,
  Home,
  Key,
  Users,
  Building2,
  Phone
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lettings Fees | Banc Property Group",
  description: "Transparent fee information for tenants and landlords. Tenant fees banned under the Tenant Fees Act 2019. Full landlord service fees disclosed.",
  keywords: "lettings fees, tenant fees, landlord fees, property management fees, banc lettings",
};

// Tenant fees - compliant with Tenant Fees Act 2019
const tenantFees = {
  permitted: [
    {
      name: "Holding Deposit",
      amount: "1 week's rent",
      description: "Equivalent to one week's rent, which holds the property for 14 days.",
      refundable: true,
      conditions: [
        "Withheld if any relevant person (including any guarantor) withdraws from the tenancy",
        "Withheld if any relevant person fails a Right to Rent check",
        "Withheld if materially significant false or misleading information is provided",
        "Withheld if you fail to sign your tenancy agreement within the deadline for agreement"
      ]
    },
    {
      name: "Security Deposit",
      amount: "Maximum 5 weeks' rent",
      description: "(Or 6 weeks if annual rent exceeds £50,000). Protected in a government-approved scheme.",
      refundable: true,
      note: "Returned at end of tenancy, subject to property condition"
    },
    {
      name: "Rent",
      amount: "As advertised",
      description: "Monthly rental payments as specified in your tenancy agreement.",
      refundable: false
    },
    {
      name: "Utilities",
      amount: "Variable",
      description: "Gas, electricity, water, and sewerage charges.",
      refundable: false
    },
    {
      name: "Council Tax",
      amount: "Variable",
      description: "Payable to the local authority.",
      refundable: false
    },
    {
      name: "TV Licence",
      amount: "Annual fee",
      description: "Required if you watch or record live TV.",
      refundable: false
    },
    {
      name: "Communication Services",
      amount: "Variable",
      description: "Telephone, broadband, satellite/cable TV installation and subscription.",
      refundable: false
    }
  ],
  banned: [
    "Application/Administration fees",
    "Referencing fees",
    "Check-in/check-out fees",
    "Inventory fees",
    "Renewal fees",
    "Professional cleaning fees (as a requirement)",
    "Pet fees/deposits (separate from general deposit)"
  ]
};

// Landlord fees — per the published Banc Property Group landlord fee schedule
const landlordFees = [
  {
    name: "Tenant Find",
    description: "We find and reference tenants, you manage the property",
    pricing: "8% (inc VAT)",
    features: [
      "Professional property marketing",
      "Accompanied viewings",
      "Tenant referencing (up to two tenants included)",
      "Collect and remit initial month's rent",
      "Agree collection of any shortfall and payment method",
      "Deduct any pre-tenancy invoices"
    ]
  },
  {
    name: "Rent Collection",
    description: "We find tenants and collect rent, you handle maintenance",
    pricing: "10% (inc VAT)",
    features: [
      "All Tenant Find services",
      "Monthly rent collection and statements",
      "Security deposit submitted to a government-authorised scheme",
      "Chasing arrears"
    ]
  },
  {
    name: "Fully Managed",
    description: "Complete hands-off service — we handle everything",
    pricing: "13% (inc VAT)",
    popular: true,
    features: [
      "All Rent Collection services",
      "Pursue non-payment of rent and advise on rent arrears actions",
      "Two inspection visits per annum",
      "Arrange routine repairs and instruct approved contractors (two quotes)",
      "Hold keys throughout the tenancy term"
    ]
  }
];

// Additional landlord fees — per the published landlord fee schedule
const additionalFees = [
  { service: "Setup Fee (landlord's share)", fee: "One week's rent (inc VAT)" },
  { service: "Amendment Fee", fee: "£50 (inc VAT)" },
  { service: "Renewal Fee", fee: "£180 (inc VAT)" },
  { service: "Check-out Fee", fee: "£0" },
  { service: "Future Landlord Reference Fee", fee: "£0" },
  { service: "Referencing (up to two tenants)", fee: "£0" },
  { service: "Additional tenant, guarantor or permitted occupier referencing", fee: "£0" },
  { service: "Inventory", fee: "From £100 (inc VAT), dependent on property size" }
];

export default function LettingsFeesPage() {
  return (
    <div className="min-h-screen bg-[#F4F3F1]">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-[#1A1917] py-24 lg:py-32 overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1917]/80 via-[#1A1917]/60 to-[#1A1917]/40" />
        </div>
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#4AC8E8] rounded-full blur-[128px]" />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <PoundSterling className="h-4 w-4 text-[#4AC8E8]" />
              <span className="text-sm font-medium text-white/80">Transparent Pricing</span>
            </div>
            
            <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl tracking-tight">
              Lettings Fees
            </h1>
            <p className="mt-6 text-xl text-white/70 leading-relaxed">
              Complete transparency on all fees and charges. We believe in being 
              upfront about costs so there are no surprises.
            </p>
          </div>
        </div>
      </section>

      {/* Tenant Fees Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main content */}
            <div className="lg:col-span-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4AC8E8]/10 border border-[#4AC8E8]/20 mb-6">
                <Users className="h-4 w-4 text-[#4AC8E8]" />
                <span className="text-sm font-medium text-[#1A9BBF]">For Tenants</span>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-semibold text-[#1A1917] mb-4">
                Tenant Fees Explained
              </h2>
              
              {/* Legal notice */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800 mb-1">Tenant Fees Act 2019 Compliant</h3>
                    <p className="text-green-700 text-sm">
                      Under the Tenant Fees Act 2019, most fees charged to tenants are now banned. 
                      We only charge the permitted payments outlined below. Any landlord or agent 
                      charging banned fees may be fined up to £5,000.
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-lg text-[#8A8880] mb-8">
                Under current legislation, we are only permitted to charge the following payments to tenants:
              </p>
              
              {/* Permitted fees */}
              <div className="space-y-6">
                {tenantFees.permitted.map((fee) => (
                  <div key={fee.name} className="bg-white rounded-2xl p-6 border border-[#E0DFDC]/30">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[#1A1917]">{fee.name}</h3>
                        <p className="text-[#8A8880] mt-1">{fee.description}</p>
                      </div>
                      <span className="px-4 py-2 rounded-full bg-[#4AC8E8]/10 text-[#4AC8E8] font-semibold text-sm">
                        {fee.amount}
                      </span>
                    </div>
                    
                    {fee.conditions && (
                      <div className="mt-4 pt-4 border-t border-[#E0DFDC]/30">
                        <p className="text-sm font-medium text-[#3D3B37] mb-2">Refund conditions:</p>
                        <ul className="space-y-1">
                          {fee.conditions.map((condition, index) => (
                            <li key={index} className="text-sm text-[#8A8880] flex items-start gap-2">
                              <span className="text-[#4AC8E8] mt-1">•</span>
                              {condition}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {fee.note && (
                      <div className="mt-4 pt-4 border-t border-[#E0DFDC]/30">
                        <p className="text-sm text-[#8A8880]">{fee.note}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Banned fees notice */}
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold text-red-800">Banned Fees</h3>
                </div>
                <p className="text-sm text-red-700 mb-4">
                  We do NOT charge tenants any of the following:
                </p>
                <ul className="space-y-2">
                  {tenantFees.banned.map((fee) => (
                    <li key={fee} className="text-sm text-red-700 flex items-start gap-2">
                      <span className="text-red-400">✕</span>
                      {fee}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Deposit protection info */}
              <div className="bg-white rounded-2xl p-6 border border-[#E0DFDC]/30">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-[#4AC8E8]" />
                  <h3 className="font-semibold text-[#1A1917]">Deposit Protection</h3>
                </div>
                <p className="text-sm text-[#8A8880] mb-4">
                  Your security deposit is protected in a government-approved scheme:
                </p>
                <ul className="space-y-2 text-sm text-[#8A8880]">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Government-authorised tenancy deposit scheme
                  </li>
                </ul>
                <p className="text-sm text-[#8A8880] mt-4">
                  You'll receive prescribed information within 30 days of payment.
                </p>
              </div>
              
              {/* CTA */}
              <div className="bg-[#4AC8E8] rounded-2xl p-6 text-center">
                <Home className="h-8 w-8 text-white mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Looking to Rent?</h3>
                <p className="text-sm text-white/80 mb-4">
                  Browse our available rental properties
                </p>
                <Link href="/lettings/properties">
                  <Button className="w-full bg-white text-[#4AC8E8] hover:bg-white/90">
                    View Properties
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Landlord Fees Section */}
      <section className="py-20 lg:py-28 bg-[#1A1917]">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <Key className="h-4 w-4 text-[#4AC8E8]" />
              <span className="text-sm font-medium text-white/80">For Landlords</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-semibold text-white">
              Landlord Service Fees
            </h2>
            <p className="mt-4 text-lg text-white/60">
              Choose the level of service that works for you. All fees are transparent 
              with no hidden charges.
            </p>
          </div>
          
          {/* Pricing cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {landlordFees.map((service) => (
              <div 
                key={service.name}
                className={`relative rounded-2xl p-8 ${
                  service.popular 
                    ? 'bg-[#4AC8E8] text-white' 
                    : 'bg-white/5 border border-white/10 text-white'
                }`}
              >
                {service.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full bg-white text-[#4AC8E8] text-xs font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                <p className={`text-sm mb-6 ${service.popular ? 'text-white/80' : 'text-white/60'}`}>
                  {service.description}
                </p>
                
                <div className="mb-6">
                  <span className="text-3xl font-bold">{service.pricing}</span>
                </div>
                
                <ul className="space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${service.popular ? 'text-white' : 'text-[#4AC8E8]'}`} />
                      <span className={service.popular ? 'text-white/90' : 'text-white/70'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          {/* Additional fees table */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-white mb-6">Additional Services & Fees</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Service</th>
                    <th className="text-right py-3 px-4 text-white/50 text-sm font-medium">Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {additionalFees.map((item) => (
                    <tr key={item.service} className="border-b border-white/5 last:border-0">
                      <td className="py-3 px-4 text-white">{item.service}</td>
                      <td className="py-3 px-4 text-right text-[#4AC8E8] font-medium">{item.fee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-white/50 mt-6">
              * Fees are shown inclusive of VAT as published in our landlord fee schedule.
              Please contact us for a full written quotation tailored to your property.
            </p>
          </div>
        </div>
      </section>

      {/* Important Information Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Fee transparency */}
            <div className="bg-white rounded-2xl p-8 border border-[#E0DFDC]/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#4AC8E8]/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-[#4AC8E8]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1A1917]">Fee Transparency</h3>
              </div>
              
              <ul className="space-y-4">
                {[
                  "Landlord fees are shown inclusive of VAT",
                  "We will provide a written quotation before any work begins",
                  "No hidden charges - all costs explained upfront",
                  "Landlord fees are deducted from rent collected",
                  "Setup fee (landlord's share): one week's rent (inc VAT), payable upon instruction"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-[#8A8880]">
                    <Check className="h-5 w-5 text-[#4AC8E8] flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Cancellation policy */}
            <div className="bg-white rounded-2xl p-8 border border-[#E0DFDC]/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#4AC8E8]/10 flex items-center justify-center">
                  <Info className="h-6 w-6 text-[#4AC8E8]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1A1917]">Cancellation Policy</h3>
              </div>
              
              <div className="space-y-4 text-[#8A8880]">
                <p>
                  <strong className="text-[#1A1917]">Tenants:</strong> Once a holding deposit
                  is paid, it becomes non-refundable if you withdraw from the tenancy
                  (subject to the conditions outlined above).
                </p>
                <p>
                  <strong className="text-[#1A1917]">Tenancy Renewals:</strong> No fees are
                  charged to tenants for tenancy renewals. The landlord renewal fee is £180
                  (inc VAT).
                </p>
                <p>
                  <strong className="text-[#1A1917]">Questions:</strong> Contact Andrew Crump
                  or Nitesh Bheda on{" "}
                  <a href="tel:01707877781" className="text-[#4AC8E8] hover:underline">01707 877781</a>, or email{" "}
                  <a href="mailto:andrew@bancproperty.com" className="text-[#4AC8E8] hover:underline">andrew@bancproperty.com</a> /{" "}
                  <a href="mailto:nitesh@bancproperty.com" className="text-[#4AC8E8] hover:underline">nitesh@bancproperty.com</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client Money Protection */}
      <section className="py-20 lg:py-28 bg-[#F4F3F1]">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="bg-white rounded-3xl p-8 lg:p-12 border border-[#E0DFDC]/30">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4AC8E8]/10 border border-[#4AC8E8]/20 mb-6">
                  <Shield className="h-4 w-4 text-[#4AC8E8]" />
                  <span className="text-sm font-medium text-[#1A9BBF]">Protection</span>
                </div>
                
                <h2 className="text-3xl font-semibold text-[#1A1917]">
                  Client Money Protection
                </h2>
                <p className="mt-4 text-lg text-[#8A8880]">
                  Banc Property Group is a member of a Client Money Protection scheme, 
                  providing peace of mind that your money is protected.
                </p>
                
                <div className="mt-8 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#4AC8E8]/10 flex items-center justify-center flex-shrink-0">
                      <Check className="h-5 w-5 text-[#4AC8E8]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1A1917]">Client Money Protected</h3>
                      <p className="text-sm text-[#8A8880]">All client funds held in segregated accounts</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#4AC8E8]/10 flex items-center justify-center flex-shrink-0">
                      <Check className="h-5 w-5 text-[#4AC8E8]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1A1917]">Client Money Protect Member</h3>
                      <p className="text-sm text-[#8A8880]">Client money protection for landlords and tenants</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#4AC8E8]/10 flex items-center justify-center flex-shrink-0">
                      <Check className="h-5 w-5 text-[#4AC8E8]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1A1917]">Redress Scheme</h3>
                      <p className="text-sm text-[#8A8880]">Member of The Property Ombudsman</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F4F3F1] rounded-2xl p-6 text-center">
                  <Shield className="h-10 w-10 text-[#4AC8E8] mx-auto mb-3" />
                  <p className="font-semibold text-[#1A1917]">Client Money Protection</p>
                  <p className="text-sm text-[#8A8880]">Fully Protected</p>
                </div>
                <div className="bg-[#F4F3F1] rounded-2xl p-6 text-center">
                  <Building2 className="h-10 w-10 text-[#4AC8E8] mx-auto mb-3" />
                  <p className="font-semibold text-[#1A1917]">Professional Membership</p>
                  <p className="text-sm text-[#8A8880]">The Guild of Professional Estate Agents</p>
                </div>
                <div className="bg-[#F4F3F1] rounded-2xl p-6 text-center">
                  <FileText className="h-10 w-10 text-[#4AC8E8] mx-auto mb-3" />
                  <p className="font-semibold text-[#1A1917]">Redress Scheme</p>
                  <p className="text-sm text-[#8A8880]">The Property Ombudsman</p>
                </div>
                <div className="bg-[#F4F3F1] rounded-2xl p-6 text-center">
                  <Key className="h-10 w-10 text-[#4AC8E8] mx-auto mb-3" />
                  <p className="font-semibold text-[#1A1917]">Deposit Protection</p>
                  <p className="text-sm text-[#8A8880]">Government-authorised scheme</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-24 bg-[#4AC8E8]">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 text-center">
          <h2 className="text-3xl font-semibold text-white mb-4">
            Have Questions About Fees?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Our team is happy to explain any aspect of our fee structure. 
            Get in touch for a no-obligation chat.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="tel:01707877781">
              <Button className="bg-white text-[#4AC8E8] hover:bg-white/90 px-8 py-6 text-base font-semibold">
                <Phone className="mr-2 h-5 w-5" />
                Call 01707 877781
              </Button>
            </a>
            <Link href="/contact">
              <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-base font-semibold">
                Contact Us
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
