import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search,
  ArrowRight,
  HelpCircle,
  Phone,
  MessageCircle,
  ChevronDown,
  Home,
  Key,
  Users,
  Building,
  FileText
} from "lucide-react";
import Link from "next/link";
import FAQAccordion from "./FAQAccordion";

export const metadata: Metadata = {
  title: "FAQ | Banc Property Group",
  description: "Find answers to frequently asked questions about selling, buying, letting, and renting properties with Banc Property Group.",
  keywords: "property FAQ, estate agent questions, selling property FAQ, renting FAQ, letting questions",
};

// FAQ data organized by categories
const faqCategories = [
  {
    id: "general",
    name: "General Questions",
    icon: HelpCircle,
    questions: [
      {
        question: "How do I arrange a property viewing?",
        answer: "You can arrange a viewing by calling us on 01707 877781, emailing info@bancproperty.com, or using the 'Book Viewing' button on any property listing. We offer flexible viewing times including evenings and weekends to suit your schedule."
      },
      {
        question: "What are your opening hours?",
        answer: "Our Cuffley office is open Monday to Friday 9:00 AM - 6:00 PM, and Saturday 9:00 AM - 4:00 PM. We're closed on Sundays. Our Mayfair office operates by appointment. We also offer evening appointments by arrangement."
      },
      {
        question: "Which areas do you cover?",
        answer: "We primarily cover Cuffley, Goffs Oak, Brookmans Park, Northaw, Potters Bar, Cheshunt, Waltham Cross, Enfield, Barnet, and surrounding Hertfordshire and North London areas. Through our Mayfair office, we also handle prime central London properties."
      },
      {
        question: "Do you offer virtual viewings?",
        answer: "Yes, we offer virtual viewings for all our properties. These can be pre-recorded video tours or live video calls where we walk you through the property in real-time. Just ask us to arrange this when you enquire about a property."
      },
      {
        question: "How can I contact Banc Property Group?",
        answer: "You can reach us by phone at 01707 877781, email at info@bancproperty.com, or visit our Cuffley office at 1 Station Road, Cuffley, EN6 4HU. You can also use the contact form on our website or reach out via our social media channels."
      }
    ]
  },
  {
    id: "selling",
    name: "Selling Questions",
    icon: Home,
    questions: [
      {
        question: "How much is my property worth?",
        answer: "The best way to find out your property's value is to arrange a free, no-obligation valuation with one of our directors. We'll assess your property based on current market conditions, comparable sales, unique features, and location. You can book a valuation online or call us."
      },
      {
        question: "How long will it take to sell my property?",
        answer: "The time to sell varies depending on market conditions, property type, price, and location. On average, properties in our area sell within 8-12 weeks from listing to accepting an offer, with completion typically 8-12 weeks after that. We'll give you a realistic timeframe during your valuation."
      },
      {
        question: "What marketing do you provide?",
        answer: "We provide comprehensive marketing including professional photography, floor plans, detailed property descriptions, listings on Rightmove, Zoopla, and OnTheMarket, social media promotion, email campaigns to our database, video tours, and drone footage for suitable properties."
      },
      {
        question: "When do I pay agency fees?",
        answer: "Our agency fees are payable upon completion of the sale, not upfront. This means we're motivated to achieve a successful sale for you. We'll discuss our fee structure during the valuation, and it's only payable when your property completes."
      },
      {
        question: "Do I need an Energy Performance Certificate (EPC)?",
        answer: "Yes, it's a legal requirement to have a valid EPC when marketing your property for sale. An EPC is valid for 10 years. If you don't have one, we can arrange this for you. The certificate shows potential buyers the energy efficiency of your property."
      },
      {
        question: "What happens if my buyer pulls out?",
        answer: "Unfortunately, buyers can pull out at any point before exchange of contracts without penalty. We minimise this risk by thoroughly qualifying all buyers before accepting offers and maintaining regular communication throughout the process. We also have a database of active buyers ready to step in if needed."
      },
      {
        question: "Should I stage my home for viewings?",
        answer: "While not essential, presenting your home well can make a significant difference. We recommend decluttering, deep cleaning, and addressing minor repairs. We can provide specific advice tailored to your property during our valuation visit."
      }
    ]
  },
  {
    id: "buying",
    name: "Buying Questions",
    icon: Key,
    questions: [
      {
        question: "How do I make an offer on a property?",
        answer: "You can make an offer by calling us directly, emailing, or visiting our office. We'll need to know your position (cash buyer, mortgage in principle, etc.) and your timescales. We'll present your offer to the seller and keep you updated throughout the negotiation process."
      },
      {
        question: "What's the buying process?",
        answer: "The typical process is: 1) Find a property and make an offer, 2) Offer accepted (property goes 'under offer'), 3) Instruct a solicitor and arrange a survey, 4) Apply for your mortgage, 5) Exchange contracts (legally binding), 6) Completion (you get the keys). This usually takes 8-12 weeks from offer to completion."
      },
      {
        question: "Do I need a solicitor?",
        answer: "Yes, you'll need a solicitor or licensed conveyancer to handle the legal aspects of the purchase. They conduct searches, review contracts, handle the transfer of funds, and register the property in your name. We can recommend experienced local solicitors if needed."
      },
      {
        question: "When do I pay the deposit?",
        answer: "The deposit (usually 10% of the purchase price) is paid to your solicitor at the point of exchange of contracts. At completion, you'll pay the remaining balance. If you're selling a property, the deposit from your sale is often used towards your purchase deposit."
      },
      {
        question: "Do I need a survey?",
        answer: "While not mandatory, we strongly recommend having a survey done. A basic mortgage valuation only confirms value for your lender. A homebuyer's report or full structural survey can identify potential issues that could cost thousands to fix later."
      },
      {
        question: "What is 'sold subject to contract'?",
        answer: "This means the seller has accepted an offer, but contracts haven't been exchanged yet. Either party can still pull out without penalty at this stage. Once contracts are exchanged, the sale becomes legally binding."
      },
      {
        question: "Can I make an offer if I haven't sold my property yet?",
        answer: "You can make an offer, but sellers typically prefer buyers who are proceedable (either cash buyers or with a sold property). We recommend getting your property on the market first to put you in the strongest negotiating position."
      }
    ]
  },
  {
    id: "lettings",
    name: "Lettings Questions",
    icon: Users,
    questions: [
      {
        question: "What fees do tenants pay?",
        answer: "Under the Tenant Fees Act 2019, we only charge permitted payments: a holding deposit (maximum 1 week's rent), security deposit (maximum 5 weeks' rent, or 6 weeks if rent exceeds £50,000/year), and of course your monthly rent. We don't charge application fees, referencing fees, or check-in fees."
      },
      {
        question: "How do I report a repair?",
        answer: "For managed properties, you can report repairs through our online portal, by email, or by calling our office. For emergencies (gas leaks, flooding, etc.), we have a 24/7 emergency line. For non-managed properties, contact your landlord directly."
      },
      {
        question: "How is my deposit protected?",
        answer: "Your security deposit is protected in a government-approved deposit protection scheme (we use MyDeposits). You'll receive prescribed information about this within 30 days of payment. The deposit is returned at the end of your tenancy, subject to the property being in good condition."
      },
      {
        question: "Can I have pets in a rental property?",
        answer: "This depends on the landlord's policy. Some properties allow pets, while others don't. We're seeing more landlords becoming pet-friendly, sometimes with a slightly higher deposit. Always check the property listing or ask us about pet policies."
      },
      {
        question: "What references do I need?",
        answer: "We'll conduct referencing which typically includes: credit check, employment verification, previous landlord reference, and affordability check (usually rent shouldn't exceed 30-35% of gross income). If you're self-employed, we'll need accountant references or tax returns."
      },
      {
        question: "How long is a tenancy agreement?",
        answer: "Most initial fixed-term tenancies are 6 or 12 months. After this, it typically becomes a rolling periodic tenancy. The length is agreed between landlord and tenant before the tenancy starts."
      },
      {
        question: "Who pays for utilities?",
        answer: "Unless otherwise stated, tenants are responsible for all utility bills (gas, electricity, water), council tax, TV licence, and internet/phone services. These should be transferred into your name when you move in."
      }
    ]
  },
  {
    id: "landlord",
    name: "Landlord Questions",
    icon: Building,
    questions: [
      {
        question: "How do you find tenants?",
        answer: "We use multiple channels: listings on Rightmove, Zoopla, and OnTheMarket, our own website, social media marketing, our database of registered applicants, local advertising, and The Guild network. We also offer virtual viewings to reach a wider audience."
      },
      {
        question: "What is rent protection insurance?",
        answer: "Rent protection insurance covers you if your tenant stops paying rent. Our full management service includes this as standard, covering legal expenses and lost rent up to a specified amount. This gives you peace of mind and financial protection."
      },
      {
        question: "Do you handle maintenance?",
        answer: "Yes, with our full management service, we handle all maintenance issues. We have a network of trusted contractors for everything from emergency repairs to routine maintenance. We'll liaise with tenants, arrange access, and ensure work is completed to a high standard."
      },
      {
        question: "What compliance do I need?",
        answer: "Landlords must comply with: Gas Safety Certificate (annual), EPC (minimum E rating), Electrical Safety Check (EICR) every 5 years, smoke alarms on every floor, carbon monoxide alarms where required, Right to Rent checks, and deposit protection. We can manage all of this for you."
      },
      {
        question: "How much rent can I charge?",
        answer: "Rental value depends on property size, condition, location, and current market demand. We'll provide a free rental valuation based on comparable properties and market trends. We review rents annually and advise on any potential increases."
      },
      {
        question: "What's the difference between your service levels?",
        answer: "Tenant Find: We find and reference tenants, you manage. Rent Collection: We find tenants and collect rent, you handle maintenance. Full Management: We handle everything from finding tenants to maintenance, giving you a completely hands-off experience. See our Fees page for full details."
      },
      {
        question: "How often do you inspect the property?",
        answer: "With full management, we conduct inspections every 3-6 months, depending on the tenancy. We provide written reports with photos, highlighting any maintenance issues or concerns. This helps protect your investment and ensures the tenancy runs smoothly."
      },
      {
        question: "Can I visit my property during the tenancy?",
        answer: "Yes, but you must give at least 24 hours' written notice and gain the tenant's consent (except in emergencies). We handle all property visits for our managed properties, ensuring proper notice is given and access is arranged at convenient times."
      }
    ]
  },
  {
    id: "other",
    name: "Other Questions",
    icon: FileText,
    questions: [
      {
        question: "Are you members of any professional bodies?",
        answer: "Yes, we're proud members of The Guild of Property Professionals, which gives our clients access to a national network of over 800 independent agents. We're also members of Propertymark and The Property Ombudsman redress scheme."
      },
      {
        question: "Do you handle commercial properties?",
        answer: "Our focus is on residential sales and lettings. For commercial property enquiries, we can refer you to specialist commercial agents in our network."
      },
      {
        question: "What is The Guild of Property Professionals?",
        answer: "The Guild is a network of over 800 independent estate agents across the UK. Membership gives us national reach while maintaining our local expertise. It includes training, marketing support, and access to a wider pool of buyers and sellers."
      },
      {
        question: "How do I make a complaint?",
        answer: "We take all complaints seriously. In the first instance, please contact your dedicated negotiator or our office manager. If you're not satisfied, you can escalate to our directors. Full details of our complaints procedure are available on our Complaints page."
      },
      {
        question: "Do you offer property valuations for probate?",
        answer: "Yes, we provide probate valuations. These are formal valuations required for inheritance tax purposes and need to meet specific criteria. Please contact us to discuss your requirements."
      }
    ]
  }
];

export default function FAQPage() {
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
        
        <div className="relative mx-auto max-w-4xl px-6 lg:px-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <HelpCircle className="h-4 w-4 text-[#4AC8E8]" />
            <span className="text-sm font-medium text-white/80">Help Centre</span>
          </div>
          
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="mt-6 text-xl text-white/70 leading-relaxed">
            Find answers to common questions about buying, selling, letting, and renting with Banc Property Group.
          </p>
          
          {/* Search bar */}
          <div className="mt-10 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8A8880]" />
              <Input 
                placeholder="Search for answers..."
                className="h-14 pl-12 pr-4 rounded-xl border-0 bg-white text-[#1A1917] placeholder:text-[#8A8880] focus:ring-2 focus:ring-[#4AC8E8]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Category Navigation - Desktop */}
            <div className="hidden lg:block">
              <div className="sticky top-32">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8A8880] mb-4">
                  Categories
                </h3>
                <nav className="space-y-1">
                  {faqCategories.map((category) => (
                    <a
                      key={category.id}
                      href={`#${category.id}`}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#3D3B37] hover:bg-white hover:shadow-sm transition-all group"
                    >
                      <category.icon className="h-5 w-5 text-[#8A8880] group-hover:text-[#4AC8E8] transition-colors" />
                      <span className="font-medium">{category.name}</span>
                    </a>
                  ))}
                </nav>
              </div>
            </div>
            
            {/* FAQ Accordions */}
            <div className="lg:col-span-3 space-y-16">
              {faqCategories.map((category) => (
                <div key={category.id} id={category.id}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#4AC8E8]/10 flex items-center justify-center">
                      <category.icon className="h-6 w-6 text-[#4AC8E8]" />
                    </div>
                    <h2 className="text-2xl font-semibold text-[#1A1917]">{category.name}</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <FAQAccordion items={category.questions} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Still Have Questions Section */}
      <section className="py-20 lg:py-28 bg-[#1A1917]">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <MessageCircle className="h-4 w-4 text-[#4AC8E8]" />
              <span className="text-sm font-medium text-white/80">Need More Help?</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-semibold text-white">
              Still Have Questions?
            </h2>
            <p className="mt-4 text-lg text-white/60">
              Can't find what you're looking for? Our friendly team is here to help.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Phone */}
            <a href="tel:01707877781" className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-[#4AC8E8]/50 transition-colors group">
              <div className="w-14 h-14 rounded-xl bg-[#4AC8E8]/20 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-7 w-7 text-[#4AC8E8]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Call Us</h3>
              <p className="text-white/60 text-sm mb-3">Speak to our team directly</p>
              <p className="text-[#4AC8E8] font-semibold group-hover:underline">01707 877781</p>
            </a>
            
            {/* Email */}
            <a href="mailto:info@bancproperty.com" className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-[#4AC8E8]/50 transition-colors group">
              <div className="w-14 h-14 rounded-xl bg-[#4AC8E8]/20 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-7 w-7 text-[#4AC8E8]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Email Us</h3>
              <p className="text-white/60 text-sm mb-3">We'll respond within 24 hours</p>
              <p className="text-[#4AC8E8] font-semibold group-hover:underline">info@bancproperty.com</p>
            </a>
            
            {/* Visit */}
            <Link href="/contact" className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-[#4AC8E8]/50 transition-colors group">
              <div className="w-14 h-14 rounded-xl bg-[#4AC8E8]/20 flex items-center justify-center mx-auto mb-4">
                <Building className="h-7 w-7 text-[#4AC8E8]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Visit Us</h3>
              <p className="text-white/60 text-sm mb-3">Come and see us in person</p>
              <p className="text-[#4AC8E8] font-semibold group-hover:underline">Find Our Office</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-[#1A1917]">Popular Resources</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Property Search", desc: "Browse our listings", link: "/sales/properties", icon: Home },
              { title: "Book Valuation", desc: "Free property valuation", link: "/valuation", icon: Key },
              { title: "Lettings Fees", desc: "Transparent pricing", link: "/lettings/fees", icon: FileText },
              { title: "Contact Us", desc: "Get in touch", link: "/contact", icon: Phone },
            ].map((item) => (
              <Link 
                key={item.title}
                href={item.link}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#E0DFDC]/30 hover:border-[#4AC8E8]/50 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-[#4AC8E8]/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-5 w-5 text-[#4AC8E8]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#1A1917] group-hover:text-[#4AC8E8] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#8A8880]">{item.desc}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-[#E0DFDC] group-hover:text-[#4AC8E8] group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
