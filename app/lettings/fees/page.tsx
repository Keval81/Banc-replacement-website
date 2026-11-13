import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageBand } from "@/components/PageBand";
import { cn } from "@/lib/utils";
import {
  actionPrimaryOnDark,
  actionSecondary,
  actionSecondaryOnDark,
  eyebrow,
  eyebrowOnDark,
  sectionHeading,
  sectionHeadingOnDark,
  sectionPadding,
} from "@/components/ui/form-styles";
import { ArrowRight, Phone } from "lucide-react";
import Link from "next/link";
import { BANC_CONTACT, FEES_TO_LANDLORDS_URL, FEES_TO_TENANTS_URL } from "@/lib/banc-contact";

export const metadata: Metadata = withPageDefaults("/lettings/fees", {
  title: "Lettings Fees | Banc Property Group",
  description: "Transparent fee information for tenants and landlords. Tenant fees banned under the Tenant Fees Act 2019. Full landlord service fees disclosed.",
  keywords: "lettings fees, tenant fees, landlord fees, property management fees, banc lettings",
});

export const revalidate = 3600;

// Tenant fees — Banc's published schedule (public/documents/fees-to-tenants.pdf),
// taken from the old site on 7 Sep 2026, within the Tenant Fees Act 2019.
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
      name: "Set-up, referencing and additional tenant",
      amount: "£0",
      description: "Referencing for up to two tenants, contract negotiation and arranging the tenancy. No charge to the tenant.",
      refundable: false
    },
    {
      name: "Inventory and Schedule of Condition",
      amount: "From £100 (inc VAT), if requested by the tenant",
      description: "Dependent on the size of the property and outbuildings.",
      refundable: false
    },
    {
      name: "Amendment Fee",
      amount: "£50 (inc VAT) per change, per person",
      description: "Amending terms and updating the tenancy agreement during the tenancy. Tenant-requested changes are capped at £50, or reasonable costs if higher.",
      refundable: false
    },
    {
      name: "Lost Keys or Security Devices",
      amount: "£20 admin (keys), £20 admin (fobs) + replacement cost",
      description: "Plus the cost of a locksmith should the locks need to be changed.",
      refundable: false
    },
    {
      name: "Call-outs caused by the tenant",
      amount: "£30 per hour (inc VAT) + costs",
      description: "Where the tenant's actions result in the agent or a contractor attending the property.",
      refundable: false
    },
    {
      name: "Late Rent",
      amount: "3% above Bank of England base rate",
      description: "Only where written into the tenancy agreement, on rent more than 14 days overdue.",
      refundable: false
    },
    {
      name: "Early Termination",
      amount: "Landlord's loss or agent's reasonable costs",
      description: "Where requested by the tenant; cannot exceed the landlord's financial loss or the agent's reasonable costs.",
      refundable: false
    },
  ],
  banned: [
    "Application/Administration fees",
    "Referencing fees",
    "Check-in/check-out fees",
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

const blockHeading = "text-xl font-semibold text-banc-dark-deep";

export default function LettingsFeesPage() {
  return (
    <div className="min-h-screen bg-banc-grey-pale">
      <Header />

      <PageBand
        eyebrow="Transparent Pricing"
        title="Lettings Fees"
        lede={
          <>
            Complete transparency on all fees and charges. We believe in being
            upfront about costs so there are no surprises.
          </>
        }
        image={{
          src: "https://images.unsplash.com/photo-1625225233840-695456021cde?auto=format&fit=crop&w=1920&q=80",
          alt: "",
          priority: true,
        }}
      >
        {/* The two published schedules, as on the old site. */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <a href={FEES_TO_LANDLORDS_URL} target="_blank" rel="noopener noreferrer" className={actionPrimaryOnDark}>
            Fees to landlords (PDF)
          </a>
          <a href={FEES_TO_TENANTS_URL} target="_blank" rel="noopener noreferrer" className={actionSecondaryOnDark}>
            Fees to tenants (PDF)
          </a>
        </div>
      </PageBand>

      {/* Tenant Fees Section */}
      <section className={sectionPadding}>
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2">
              <p className={eyebrow}>For Tenants</p>
              <h2 className={cn(sectionHeading, "mt-3")}>Tenant Fees Explained</h2>

              {/* Legal notice */}
              <div className="mt-7 rounded-[var(--radius-md)] border border-green-200 bg-green-50 p-5">
                <h3 className="mb-1 font-semibold text-green-800">Tenant Fees Act 2019 Compliant</h3>
                <p className="text-sm text-green-800">
                  Under the Tenant Fees Act 2019, most fees charged to tenants are now banned.
                  We only charge the permitted payments outlined below. Any landlord or agent
                  charging banned fees may be fined up to £5,000.
                </p>
              </div>

              <p className="mt-8 text-lg text-banc-muted-readable">
                Under current legislation, we are only permitted to charge the following payments to tenants:
              </p>

              {/* Permitted fees */}
              <div className="mt-6 border-b border-banc-dark/15">
                {tenantFees.permitted.map((fee) => (
                  <div key={fee.name} className="border-t border-banc-dark/15 py-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
                      <div>
                        <h3 className="text-lg font-semibold text-banc-dark-deep">{fee.name}</h3>
                        <p className="mt-1 text-banc-muted-readable">{fee.description}</p>
                      </div>
                      <p className="font-bold text-banc-dark-deep sm:max-w-[16rem] sm:shrink-0 sm:text-right">
                        {fee.amount}
                      </p>
                    </div>

                    {fee.conditions && (
                      <div className="mt-4">
                        <p className="mb-2 text-sm font-medium text-banc-dark-mid">Refund conditions:</p>
                        <ul className="space-y-1">
                          {fee.conditions.map((condition, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-banc-muted-readable">
                              <span className="mt-1 text-banc-focus">•</span>
                              {condition}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {fee.note && (
                      <p className="mt-4 text-sm text-banc-muted-readable">{fee.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Banned fees notice */}
              <div className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 p-5">
                <h3 className="mb-3 font-semibold text-red-800">Banned Fees</h3>
                <p className="mb-4 text-sm text-red-800">
                  We do NOT charge tenants any of the following:
                </p>
                <ul className="space-y-2">
                  {tenantFees.banned.map((fee) => (
                    <li key={fee} className="flex items-start gap-2 text-sm text-red-800">
                      <span aria-hidden="true">✕</span>
                      {fee}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Deposit protection info */}
              <div className="border-t border-banc-dark/15 pt-6">
                <h3 className="font-semibold text-banc-dark-deep">Deposit Protection</h3>
                <p className="mt-3 text-sm text-banc-muted-readable">
                  Your security deposit is protected in a government-approved scheme:
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-banc-muted-readable">
                  <li>Government-authorised tenancy deposit scheme</li>
                </ul>
                <p className="mt-4 text-sm text-banc-muted-readable">
                  You&apos;ll receive prescribed information within 30 days of payment.
                </p>
              </div>

              {/* CTA */}
              <div className="border-t border-banc-dark/15 pt-6">
                <h3 className="font-semibold text-banc-dark-deep">Looking to Rent?</h3>
                <p className="mt-2 text-sm text-banc-muted-readable">
                  Browse our available rental properties
                </p>
                <Link href="/lettings/properties" className={cn(actionSecondary, "mt-4")}>
                  View Properties
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Landlord Fees Section */}
      <section className={cn(sectionPadding, "banc-dark-surface bg-banc-dark-deep text-white")}>
        <div className="mx-auto max-w-7xl">
          <p className={eyebrowOnDark}>For Landlords</p>
          <h2 className={cn(sectionHeadingOnDark, "mt-3")}>Landlord Service Fees</h2>
          <p className="mt-4 max-w-2xl text-white/70 lg:text-lg">
            Choose the level of service that works for you. All fees are transparent
            with no hidden charges.
          </p>

          {/* Pricing */}
          <div className="mt-7 grid gap-x-10 md:grid-cols-3">
            {landlordFees.map((service) => (
              <div key={service.name} className="border-t border-white/15 py-6">
                {service.popular && <p className={cn(eyebrowOnDark, "mb-2")}>Most Popular</p>}
                <h3 className="text-xl font-semibold text-white">{service.name}</h3>
                <p className="mt-2 text-sm text-white/70">{service.description}</p>

                <p className="mt-5 text-3xl font-bold text-white">{service.pricing}</p>

                <ul className="mt-5 list-disc space-y-3 pl-5 text-sm text-white/75 marker:text-white/40">
                  {service.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Additional fees table */}
          <div className="mt-10 border-t border-white/15 pt-8">
            <h3 className="mb-4 text-xl font-semibold text-white">Additional Services & Fees</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/15">
                  <th className="py-3 pr-4 text-left text-sm font-medium text-white/70">Service</th>
                  <th className="py-3 pl-4 text-right text-sm font-medium text-white/70">Fee</th>
                </tr>
              </thead>
              <tbody>
                {additionalFees.map((item) => (
                  <tr key={item.service} className="border-b border-white/15">
                    <td className="py-3 pr-4 align-top text-white/85">{item.service}</td>
                    <td className="py-3 pl-4 text-right align-top font-bold text-white">{item.fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-6 text-sm text-white/70">
              * Fees are shown inclusive of VAT as published in our landlord fee schedule.
              Please contact us for a full written quotation tailored to your property.
            </p>
          </div>
        </div>
      </section>

      {/* Important Information Section */}
      <section className={sectionPadding}>
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Fee transparency */}
            <div className="border-t border-banc-dark/15 pt-6">
              <h3 className={blockHeading}>Fee Transparency</h3>

              <ul className="mt-5 list-disc space-y-3 pl-5 text-banc-muted-readable">
                {[
                  "Landlord fees are shown inclusive of VAT",
                  "We will provide a written quotation before any work begins",
                  "No hidden charges - all costs explained upfront",
                  "Landlord fees are deducted from rent collected",
                  "Setup fee (landlord's share): one week's rent (inc VAT), payable upon instruction"
                ].map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Cancellation policy */}
            <div className="border-t border-banc-dark/15 pt-6">
              <h3 className={blockHeading}>Cancellation Policy</h3>

              <div className="mt-5 space-y-4 text-banc-muted-readable">
                <p>
                  <strong className="text-banc-dark-deep">Tenants:</strong> Once a holding deposit
                  is paid, it becomes non-refundable if you withdraw from the tenancy
                  (subject to the conditions outlined above).
                </p>
                <p>
                  <strong className="text-banc-dark-deep">Tenancy Renewals:</strong> No fees are
                  charged to tenants for tenancy renewals. The landlord renewal fee is £180
                  (inc VAT).
                </p>
                <p>
                  <strong className="text-banc-dark-deep">Questions:</strong> Contact Andrew Crump
                  or Nitesh Bheda on{" "}
                  <a href={BANC_CONTACT.callHref} className="text-banc-focus hover:underline">{BANC_CONTACT.displayPhone}</a>, or email{" "}
                  <a href="mailto:andrew@bancproperty.com" className="text-banc-focus hover:underline">andrew@bancproperty.com</a> /{" "}
                  <a href="mailto:nitesh@bancproperty.com" className="text-banc-focus hover:underline">nitesh@bancproperty.com</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client Money Protection */}
      <section className={cn(sectionPadding, "border-t border-banc-dark/15")}>
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className={eyebrow}>Protection</p>
              <h2 className={cn(sectionHeading, "mt-3")}>Client Money Protection</h2>
              <p className="mt-4 text-banc-muted-readable lg:text-lg">
                Banc Property Group is a member of a Client Money Protection scheme,
                providing peace of mind that your money is protected.
              </p>

              <ul className="mt-7 border-t border-banc-dark/15">
                {[
                  { title: "Client Money Protected", text: "All client funds held in segregated accounts" },
                  { title: "Client Money Protect Member", text: "Client money protection for landlords and tenants" },
                  { title: "Redress Scheme", text: "Member of The Property Ombudsman" },
                ].map((item) => (
                  <li key={item.title} className="border-b border-banc-dark/15 py-4">
                    <h3 className="font-semibold text-banc-dark-deep">{item.title}</h3>
                    <p className="mt-1 text-sm text-banc-muted-readable">{item.text}</p>
                  </li>
                ))}
              </ul>
            </div>

            <dl className="grid grid-cols-1 self-start border-t border-banc-dark/15 sm:grid-cols-2 sm:gap-x-8">
              {[
                { title: "Client Money Protection", text: "Fully Protected" },
                { title: "Professional Membership", text: "The Guild of Professional Estate Agents" },
                { title: "Redress Scheme", text: "The Property Ombudsman" },
                { title: "Deposit Protection", text: "Government-authorised scheme" },
              ].map((item) => (
                <div key={item.title} className="border-b border-banc-dark/15 py-4">
                  <dt className="font-semibold text-banc-dark-deep">{item.title}</dt>
                  <dd className="mt-1 text-sm text-banc-muted-readable">{item.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={cn(sectionPadding, "banc-dark-surface bg-banc-dark-deep text-white")}>
        <div className="mx-auto max-w-7xl">
          <p className={eyebrowOnDark}>Get in touch</p>
          <h2 className={cn(sectionHeadingOnDark, "mt-3")}>Have Questions About Fees?</h2>
          <p className="mt-4 max-w-2xl text-white/70 lg:text-lg">
            Our team is happy to explain any aspect of our fee structure.
            Get in touch for a no-obligation chat.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a href={BANC_CONTACT.callHref} className={actionPrimaryOnDark}>
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call {BANC_CONTACT.displayPhone}
            </a>
            <Link href="/contact" className={actionSecondaryOnDark}>
              Contact Us
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
