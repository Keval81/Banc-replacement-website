// FAQ content — single source for the /faq page UI and its FAQPage JSON-LD.

import type { FaqItem } from "./schema-org.ts";

export type FaqIconId = "building" | "file-text" | "help-circle" | "home" | "key" | "users";

export interface FaqCategory {
  id: string;
  name: string;
  icon: FaqIconId;
  questions: FaqItem[];
}

export const faqCategories: FaqCategory[] = [
  {
    id: "general",
    name: "General Questions",
    icon: "help-circle",
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
    icon: "home",
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
    icon: "key",
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
    icon: "users",
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
    icon: "building",
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
    icon: "file-text",
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

export function getAllFaqItems(): FaqItem[] {
  return faqCategories.flatMap((category) => category.questions);
}
