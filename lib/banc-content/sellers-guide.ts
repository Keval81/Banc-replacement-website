import type { ApprovedBancPage, ApprovedBancSection } from "./types.ts";

export interface SellerGuideItem {
  text: string;
  highlight?: string;
}

export interface SellerGuideSection extends ApprovedBancSection {
  description: string;
  items: readonly SellerGuideItem[];
  topTips?: readonly string[];
  quote?: string;
}

function sellerSection(input: {
  id: string;
  title: string;
  description: string;
  items: readonly SellerGuideItem[];
  aliases: readonly string[];
  topTips?: readonly string[];
  quote?: string;
}): SellerGuideSection {
  const topTips = input.topTips ?? [];
  const quote = input.quote ? [input.quote] : [];

  return {
    ...input,
    body: [
      input.description,
      ...input.items.map((item) => item.text),
      ...topTips,
      ...quote,
    ],
  };
}

export const SELLERS_GUIDE_SECTIONS = [
  sellerSection({
    id: "market-appraisal",
    title: "Book a Market Appraisal",
    description: "The first step in your selling journey begins with understanding your property's true market value.",
    items: [
      { text: "Complimentary, no obligation valuation conducted by our experts" },
      { text: "Comprehensive market analysis using resources, data and recent comparable sales" },
      { text: "Flexible appointment times including evenings and weekends to suit your schedule" },
      { text: "Strategic marketing advice tailored to maximise your property's appeal" },
    ],
    topTips: ["Instruct a solicitor as soon as you place your property on the market to save valuable time once a buyer is found."],
    aliases: ["selling valuation", "market appraisal", "value my home"],
  }),
  sellerSection({
    id: "seller-checklist",
    title: "The Sellers Checklist",
    description: "Preparation is key. Ensure you have all necessary documentation ready before marketing begins.",
    items: [
      { text: "Energy Performance Certificate (EPC) required by legislation – we can arrange an independent assessment" },
      { text: "Professional floorplans are essential and can be completed alongside your EPC" },
      { text: "Valid photo ID required for compliance with money laundering legislation" },
    ],
    aliases: ["selling documents", "seller EPC", "seller identification"],
  }),
  sellerSection({
    id: "marketing-preparation",
    title: "Getting Ready For Marketing",
    description: "First impressions are everything. We'll help showcase your property at its absolute best.",
    items: [
      { text: "Expert professional photography and copywriting that brings your home to life" },
      { text: "Seller's Secret: A personal testimonial about why you loved living here", highlight: "Seller's Secret:" },
      { text: "Beautifully designed marketing materials that bring your property to life" },
      { text: "Full team briefing – every consultant visits your property before viewings begin" },
      { text: "Detailed brief sheet ensures all staff are informed on every unique feature", highlight: "Brief sheet" },
    ],
    topTips: ["Make sure your property is tidy, clutter-free and filled with natural light before the photographer and viewers arrive."],
    aliases: ["market my home", "property photography", "selling preparation"],
  }),
  sellerSection({
    id: "reach-buyers",
    title: "Reaching Potential Buyers",
    description: "We employ a comprehensive, multi-channel marketing strategy to ensure maximum exposure.",
    items: [
      { text: "Multi-channel approach: major property portals, website, database mailshots, targeted email campaigns, local letter drops, and strategic social media promotion" },
      { text: "Premium 'For Sale' boards positioned for maximum visibility" },
      { text: "Access to our extensive register of motivated, ready-to-move buyers" },
      { text: "Exclusive sneak previews for registered clients before public launch" },
    ],
    aliases: ["selling marketing", "property portals", "find buyers"],
  }),
  sellerSection({
    id: "viewings",
    title: "The Viewings",
    description: "Your home takes centre stage. We ensure every viewing is conducted professionally and securely.",
    items: [
      { text: "First impressions are paramount – we guide you on presentation" },
      { text: "Fully accompanied viewings for security and to highlight every benefit" },
      { text: "Open house events when appropriate – professionally supervised 2-3 hour sessions" },
    ],
    quote: "Your home steals the show!!",
    topTips: [
      "If you receive letters from other agents claiming to have interested buyers, simply redirect them to us – we handle everything.",
      "Provide us with secure keys and keep us briefed on alarm codes and any pets on the premises.",
    ],
    aliases: ["seller viewings", "open house", "accompanied viewing"],
  }),
  sellerSection({
    id: "viewing-feedback",
    title: "Viewing Verdict",
    description: "Communication is crucial. We believe in transparent, honest feedback after every viewing.",
    items: [
      { text: "Prompt follow-up calls to applicants immediately after viewings" },
      { text: "Bi-monthly consultation reviews to assess progress on all properties" },
      { text: "Comprehensive feedback delivered via email or phone by the next working day" },
    ],
    topTips: ["Feedback, whether positive or constructive, is invaluable. Some agents only share good news, but we believe all feedback should be given. Silence is never golden!!"],
    aliases: ["viewing feedback", "seller update", "applicant feedback"],
  }),
  sellerSection({
    id: "offer-made",
    title: "When An Offer Is Made",
    description: "Our skilled negotiators work tirelessly to secure the best possible outcome for you.",
    items: [
      { text: "Highly skilled negotiators personally contact you with every offer detail" },
      { text: "Full transparency: applicant's timescales, financial position, and chain details provided" },
      { text: "Dedicated effort to negotiate the optimum price on your behalf" },
    ],
    aliases: ["seller offer", "offer negotiation", "buyer chain"],
  }),
  sellerSection({
    id: "offer-agreed",
    title: "Offers Agreed",
    description: "Once an offer is accepted, we coordinate all parties to ensure a smooth progression.",
    items: [
      { text: "Sales memorandum promptly dispatched to both parties' solicitors" },
      { text: "Constant communication with all parties is paramount to success" },
    ],
    topTips: ["Maintain regular contact with your solicitor. As a general rule: aim to exchange contracts within 6 weeks, with completion typically following a couple of weeks later."],
    aliases: ["accepted offer", "sales memorandum", "sale progression"],
  }),
  sellerSection({
    id: "exchange",
    title: "Exchange",
    description: "The legally binding milestone. Contracts are signed and completion dates are set.",
    items: [
      { text: "Contracts signed by all parties with 10% deposit secured" },
      { text: "Contracts officially exchanged – the transaction is now legally binding" },
      { text: "Completion date formally agreed and confirmed" },
    ],
    aliases: ["seller exchange", "exchange contracts", "completion date"],
  }),
  sellerSection({
    id: "completion",
    title: "Completion",
    description: "The exciting finale – moving day has arrived. Time to begin your next chapter.",
    items: [
      { text: "Moving day! Your solicitor confirms funds have cleared successfully" },
      { text: "We release keys to the new owners, marking a successful sale" },
    ],
    aliases: ["sale completion", "moving day", "release keys"],
  }),
] as const;

export const SELLERS_GUIDE = {
  title: "Sellers Guide",
  href: "/sales/sellers-guide",
  sections: SELLERS_GUIDE_SECTIONS,
} as const satisfies ApprovedBancPage;
