import type { ApprovedBancPage } from "./types.ts";

export interface LandlordFeature {
  title: string;
  description: string;
}

export const LANDLORD_TENANT_PASS_RATE = "30% of our applicants";

export const LANDLORD_BENEFITS = [
  { title: "Experienced Staff", description: "Experienced, attentive and very knowledgeable staff" },
  { title: "Flexible Service", description: "Flexible service options, competitively priced" },
  { title: "Transparent Fees", description: "Open and transparent fees with no hidden charges" },
  { title: "Legal Documents", description: "Up to date legal documents and advice on property rental matters" },
  { title: "Property Appraisals", description: "Property appraisals from experienced letting consultants" },
  { title: "Internet Advertising", description: "Extensive internet advertising on the UK's top property websites" },
  { title: "Pre-qualified Tenants", description: "A pre-qualified database of waiting tenants" },
  { title: "Tenant Referencing", description: "Comprehensive tenant referencing service with full credit check" },
  { title: "Inventories", description: "Professionally produced inventories, if required" },
  { title: "Money Protection", description: "Full client money protection" },
  { title: "Tenancy Deposit", description: "Registered with the government-backed Tenancy Deposit Scheme" },
  { title: "Expert Tradespeople", description: "Database of expert and reliable tradespeople on call" },
] as const satisfies readonly LandlordFeature[];

export const LANDLORD_MANAGEMENT_FEATURES = [
  {
    title: "Well-Maintained Homes",
    description: "The best quality tenants demand the best-maintained homes, expecting maximum value for their rent. Whether it is fridge failure or a leaking shower, you can be sure any tenant will want a swift repair.",
  },
  {
    title: "Prompt Repairs",
    description: "Hundreds of clients trust our award-winning property management team. We look after any repairs and tenancy issues for you promptly and professionally.",
  },
  {
    title: "Compliance Checks",
    description: "We visit the property and organise any maintenance and safety compliance checks, assuring you that your property remains in sound condition and your legal obligations are met.",
  },
] as const satisfies readonly LandlordFeature[];

export const LANDLORD_INSURANCE_PRODUCTS = [
  { title: "Landlord Comprehensive Buildings Insurance", description: "Complete protection for your property investment" },
  { title: "Landlord Low Cost Building Insurance", description: "Affordable coverage without compromising quality" },
  { title: "Landlord Full and Limited Contents Insurance", description: "Flexible options for furnished and unfurnished properties" },
  { title: "Landlords Emergency Assistance", description: "24/7 emergency support for urgent repairs" },
  { title: "Landlords Legal Expenses", description: "Protection against legal costs and disputes" },
] as const satisfies readonly LandlordFeature[];

export const LANDLORDS_GUIDE = {
  title: "Landlords Guide",
  href: "/lettings/landlords-guide",
  sections: [
    {
      id: "letting-services",
      title: "Expert Letting Services",
      body: [
        "Whether you are looking to let your home while away on business, or you need a long-term tenancy solution for your investment property, our lettings team offers the correct service to suit.",
        "We understand that becoming a landlord can be a daunting experience. It is easy to see why, when you consider there are hundreds of separate laws and regulations that landlords must abide by when letting a property!",
        "Our in-house property teams are experts in their field, on-hand to help throughout the entire process. We offer a comprehensive range of residential lettings services, including full property management.",
      ],
      aliases: ["landlord guide", "letting a property", "lettings services"],
    },
    {
      id: "quality-tenants",
      title: "Quality Tenants",
      body: [
        "Our number 1 priority is quality tenants. We're particularly fussy when it comes to finding quality tenants for your property.",
        `In fact only about ${LANDLORD_TENANT_PASS_RATE} actually make it through our strict referencing procedure which includes checking the applicants' credit and work history, salary and any references from any previous landlords before being approved.`,
        "We also encourage you to meet the tenants, so you can verify you're happy with the people we've found. If, for any reason, you would prefer us to keep looking, we will politely decline the tenants and continue marketing your property.",
      ],
      aliases: ["tenant referencing", "landlord credit checks", "quality tenant"],
    },
    {
      id: "property-management",
      title: "Property Management Service",
      body: LANDLORD_MANAGEMENT_FEATURES.flatMap((feature) => [
        feature.title,
        feature.description,
      ]),
      aliases: ["fully managed letting", "landlord repairs", "property manager"],
    },
    {
      id: "why-banc",
      title: "Why Choose Banc",
      body: LANDLORD_BENEFITS.flatMap((feature) => [
        feature.title,
        feature.description,
      ]),
      aliases: ["landlord services", "tenant checks", "landlord deposit protection"],
    },
    {
      id: "insurance",
      title: "Insurance Products Available",
      body: LANDLORD_INSURANCE_PRODUCTS.flatMap((product) => [
        product.title,
        product.description,
      ]),
      aliases: ["landlord insurance", "buildings insurance", "legal expenses"],
    },
  ],
} as const satisfies ApprovedBancPage;
