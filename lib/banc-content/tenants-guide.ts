import type { ApprovedBancPage, ApprovedBancSection } from "./types.ts";

export interface TenantGuideSection extends ApprovedBancSection {
  number: string;
  intro?: string;
  content: readonly string[];
  checklist?: readonly string[];
  highlights?: readonly string[];
}

function tenantSection(input: {
  id: string;
  number: string;
  title: string;
  intro?: string;
  content: readonly string[];
  checklist?: readonly string[];
  highlights?: readonly string[];
  aliases: readonly string[];
}): TenantGuideSection {
  return {
    ...input,
    body: [
      ...(input.intro ? [input.intro] : []),
      ...input.content,
      ...(input.checklist ?? []),
      ...(input.highlights ?? []),
    ],
  };
}

export const TENANT_GUIDE_SECTIONS = [
  tenantSection({
    id: "budget",
    number: "01",
    title: "Fixing a Budget",
    content: [
      "Letting agents have strict affordability guidelines, usually based on a percentage of your yearly salary",
      "Commission and overtime are not generally counted, though savings can be considered in certain circumstances",
      "Contact us before making an offer to ensure your budget meets our criteria",
      "Remember to budget for bills as well as rent: council tax, contents insurance, utilities, cable, travel, and parking",
    ],
    highlights: ["Calculate total monthly outgoings", "Factor in commute costs", "Consider contents insurance"],
    aliases: ["tenant affordability", "rental budget", "renting costs"],
  }),
  tenantSection({
    id: "requirements",
    number: "02",
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
      "Credit history — do you have any adverse credit history to declare?",
    ],
    highlights: ["Research neighbourhoods thoroughly", "List must-haves vs nice-to-haves", "Confirm who will be on the tenancy"],
    aliases: ["rental requirements", "tenant property search", "rent with pets"],
  }),
  tenantSection({
    id: "viewing",
    number: "03",
    title: "Viewing Properties",
    content: [
      "Take a notepad and prepare questions in advance",
      "Ask about fixtures, fittings, the neighbourhood, and the landlords",
      "The rental market moves quickly — make viewing times a priority and arrive promptly",
      "Stay in the neighbourhood afterwards to soak up the atmosphere and explore local amenities",
      "Do a dummy-run of your commute if the area is unfamiliar to you",
    ],
    highlights: ["Test mobile signal in the property", "Visit at different times of day", "Check local transport connections"],
    aliases: ["tenant viewing", "rental viewing", "viewing questions"],
  }),
  tenantSection({
    id: "applying",
    number: "04",
    title: "Applying for a Tenancy",
    content: [
      "All offers must be submitted through the letting agent",
      "Provide full details of all prospective tenants",
      "Specify any fixtures or fittings you would like included",
      "State your proposed moving date and preferred tenancy length",
      "Disclose details of any children and pets",
      "Provide two forms of ID for all tenants and guarantors (passport plus a utility bill or bank statement less than 3 months old)",
      "Complete Banc tenancy application forms and provide references",
      "Remember that all offers are subject to satisfactory references and agreement of the tenancy agreement",
    ],
    highlights: ["Have documents ready in advance", "Be transparent about all occupants", "Respond quickly to requests"],
    aliases: ["tenancy application", "tenant documents", "rental references"],
  }),
  tenantSection({
    id: "signing",
    number: "05",
    title: "Signing the Tenancy Agreement",
    content: [
      "Three identical copies of the tenancy agreement will be provided",
      "Read the agreement carefully, sign all copies, and return them promptly",
      "Ask questions before signing if anything is unclear — the agreement is legally binding once signed",
      "Transfer your first rental payment and security deposit at least 48 hours before moving",
      "Arrange a convenient time to take possession of the property",
      "Moving day is when most agreements are signed and keys are released",
    ],
    checklist: [
      "Book removals company",
      "Redirect your post",
      "Tell friends and family your new address",
      "Read utility meters on moving day",
      "Cancel old services and set up new ones",
      "Change your TV Licence address",
      "Inform council tax authority",
    ],
    highlights: ["Keep copies of all documents", "Arrange key collection in advance", "Photograph meter readings"],
    aliases: ["tenancy agreement", "tenant moving day", "security deposit"],
  }),
  tenantSection({
    id: "utilities",
    number: "06",
    title: "Utilities",
    content: [
      "Please note that rent does NOT include utilities. You will be responsible for setting up and paying for:",
      "Gas and electricity supply and usage",
      "Water rates and sewerage charges",
      "Council tax (determined by your local authority)",
      "TV Licence",
      "Telephone line rental and call charges",
      "Internet and broadband services",
    ],
    highlights: ["Compare energy providers early", "Set up utilities before move-in", "Budget £150-250/month for bills"],
    aliases: ["tenant utilities", "bills included", "rental bills"],
  }),
] as const;

export interface TenantFee {
  title: string;
  amount: string;
  description: string;
}

// Mirrors Banc's published "Fees to Tenants" schedule (public/documents/fees-to-tenants.pdf),
// taken from the old site on 7 Sep 2026. The figures that were here before — £100
// variation, £15/hr, £100 change of sharer — were not Banc's and are gone.
export const TENANT_FEES = [
  { title: "Holding Deposit", amount: "One week's rent", description: "Holds the property for 14 days. Withheld if you withdraw, fail Right to Rent checks, give false or misleading information, or do not sign the tenancy agreement in time." },
  { title: "Security Deposit", amount: "Up to five weeks' rent", description: "Six weeks where the annual rent is over £50,000. Protected in a government-authorised scheme and returned at the end of the tenancy, subject to the condition of the property." },
  { title: "Set-up, referencing and additional tenant", amount: "£0", description: "Referencing for up to two tenants — identity, immigration and visa checks, credit checks, employer and landlord references — plus negotiating and arranging the tenancy agreement. No charge to the tenant." },
  { title: "Inventory and Schedule of Condition", amount: "From £100 (inc VAT), if requested by you", description: "Preparing the inventory, explaining how appliances work and taking meter readings. Dependent on the size of the property." },
  { title: "Amendment Fee", amount: "£50 (inc VAT) per change, per person", description: "Contract negotiation, amending terms and updating your tenancy agreement during the tenancy. Changes you request are capped at £50, or reasonable costs if higher." },
  { title: "Early Termination", amount: "Landlord's loss or agent's reasonable costs", description: "Where you ask to leave early. This cannot exceed the financial loss the landlord suffers or the reasonable costs the agent has incurred in agreeing it." },
  { title: "Lost Keys or Security Devices", amount: "£20 admin (keys), £20 admin (fobs) + replacement cost", description: "Plus the cost of a locksmith should the locks need to be changed." },
  { title: "Call-outs caused by the tenant", amount: "£30 per hour (inc VAT) + costs", description: "Where your actions result in the agent or a nominated contractor attending the property, time to put it right is charged at the prevailing rate plus any actual costs." },
  { title: "Late Rent", amount: "3% above Bank of England base rate", description: "Only where written into the tenancy agreement, and only on rent more than 14 days overdue, for each day it stays outstanding." },
] as const satisfies readonly TenantFee[];

export const TENANTS_GUIDE = {
  title: "Tenants Guide",
  href: "/lettings/tenants-guide",
  sections: [
    ...TENANT_GUIDE_SECTIONS,
    {
      id: "fees",
      title: "Tenant Fees",
      body: TENANT_FEES.flatMap((fee) => [fee.title, fee.amount, fee.description]),
      aliases: ["tenant fees", "holding deposit", "security deposit"],
    },
  ],
} as const satisfies ApprovedBancPage;
