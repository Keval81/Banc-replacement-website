import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SimpleEnquiryForm } from "@/components/forms/SimpleEnquiryForm";
import type { SimpleEnquiryField } from "@/lib/simple-enquiry";
import { 
  Clock,
  FileText,
  Check,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { PageBand } from "@/components/PageBand";
import { eyebrow, formPanel, sectionHeading } from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";
import { BANC_CONTACT, COMPLAINTS_PROCEDURE_URL } from "@/lib/banc-contact";

const COMPLAINT_FIELDS: SimpleEnquiryField[] = [
  { name: "firstName", label: "First Name", type: "text", placeholder: "John", required: true, span: "half" },
  { name: "lastName", label: "Last Name", type: "text", placeholder: "Smith", required: true, span: "half" },
  { name: "email", label: "Email Address", type: "email", placeholder: "john@example.com", required: true, span: "half" },
  { name: "phone", label: "Phone Number", type: "tel", placeholder: BANC_CONTACT.displayPhone, span: "half" },
  { name: "propertyAddress", label: "Property Address (if applicable)", type: "text", placeholder: "1 Station Road, Cuffley, EN6 4HU" },
  {
    name: "nature",
    label: "Nature of Complaint",
    type: "select",
    placeholder: "Select...",
    required: true,
    options: ["Quality of Service", "Communication Issues", "Fees or Charges", "Maintenance/Repairs", "Staff Conduct", "Other"],
  },
  {
    name: "details",
    label: "Details of Complaint",
    type: "textarea",
    rows: 5,
    placeholder: "Please provide as much detail as possible about your complaint...",
    required: true,
  },
  {
    name: "resolution",
    label: "What would you like us to do?",
    type: "textarea",
    rows: 3,
    placeholder: "How would you like us to resolve this matter?",
  },
];

export const metadata: Metadata = withPageDefaults("/complaints", {
  title: "Complaints Procedure | Banc Property Group",
  description: "Our complaints procedure. We take all complaints seriously and are committed to resolving issues promptly and fairly.",
  keywords: "complaints procedure, estate agent complaints, property ombudsman, banc complaints",
});

export const revalidate = 3600;

// Complaints process steps
const complaintSteps = [
  {
    step: "1",
    title: "Informal Resolution",
    description: "In the first instance, please speak to your dedicated negotiator or property manager. Many issues can be resolved quickly at this stage.",
    timeframe: "Within 24 hours",
    icon: MessageSquare
  },
  {
    step: "2",
    title: "Formal Complaint",
    description: "If informal resolution doesn't work, you can make a formal complaint in writing to our Office Manager.",
    timeframe: "Acknowledged within 3 working days",
    icon: FileText
  },
  {
    step: "3",
    title: "Investigation",
    description: "We will thoroughly investigate your complaint, speaking to all relevant parties and reviewing all documentation.",
    timeframe: "Within 15 working days",
    icon: Clock
  },
  {
    step: "4",
    title: "Final Response",
    description: "You will receive our final written response, including details of our decision and any actions we will take.",
    timeframe: "Within 8 weeks of receipt",
    icon: Check
  }
];

// Redress information
const redressSchemes = [
  {
    name: "The Property Ombudsman",
    description: "Independent redress scheme for consumers",
    website: "www.tpos.co.uk",
    phone: "01722 333306",
    email: "admin@tpos.co.uk"
  },
  {
    name: "Propertymark",
    description: "Professional body for estate agents",
    website: "www.propertymark.co.uk",
    phone: "01926 417 796",
    email: "info@propertymark.co.uk"
  }
];

const SECTION = "border-t border-banc-dark/15 py-10 first:border-t-0 first:pt-0 last:pb-0";
const TEXT_LINK = "text-banc-focus underline underline-offset-4 hover:text-banc-focus-hover";

export default function ComplaintsPage() {
  return (
    <div className="min-h-screen bg-banc-grey-pale">
      <Header />
      
      <main>
        <PageBand
          eyebrow="Our Commitment"
          title="Complaints Procedure"
          lede="At Banc Property Group, we pride ourselves on delivering excellent service. However, if something goes wrong, we want to know about it so we can put it right."
          image={{
            src: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1920&q=80",
            alt: "",
            priority: true,
          }}
        />

        {/* One left-aligned reading column, sections separated by hairlines */}
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-20">
          <div className="max-w-3xl">
            {/* Our Commitment Section */}
            <section className={SECTION}>
              <p className={eyebrow}>Our Promise</p>
              <h2 className={cn(sectionHeading, "mt-3")}>
                We&apos;re Committed to Fairness
              </h2>

              <p className="mt-6 text-lg text-banc-muted-readable">
                We take all complaints seriously and are committed to dealing with them promptly, 
                fairly, and confidentially. Our complaints procedure is designed to be simple 
                and straightforward.{" "}
                <a href={COMPLAINTS_PROCEDURE_URL} target="_blank" rel="noopener noreferrer" className={TEXT_LINK}>
                  Download the full procedure (PDF)
                </a>
                .
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "We will acknowledge your complaint within 3 working days",
                  "We will treat your complaint confidentially",
                  "We will investigate thoroughly and impartially",
                  "We will keep you informed throughout the process",
                  "We aim to resolve complaints within 8 weeks",
                  "If you're not satisfied, you can escalate to The Property Ombudsman"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="mt-1 h-4 w-4 flex-shrink-0 text-banc-focus" />
                    <span className="text-banc-dark-mid">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Important notice */}
            <section className={SECTION}>
              <h3 className="text-xl font-semibold text-banc-dark-deep">Before You Complain</h3>

              <p className="mt-4 text-banc-muted-readable">
                If you have an issue, we recommend trying to resolve it informally first. 
                Often, a quick conversation can sort things out without needing a formal complaint.
              </p>

              <h4 className="mb-3 mt-6 font-semibold text-banc-dark-deep">Try These First:</h4>
              <ul className="space-y-2 text-banc-muted-readable">
                <li className="flex items-start gap-2">
                  <span className="text-banc-focus">1.</span>
                  Speak to your dedicated negotiator
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-banc-focus">2.</span>
                  Call our office on {BANC_CONTACT.displayPhone}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-banc-focus">3.</span>
                  Email your property manager directly
                </li>
              </ul>
            </section>

            {/* Complaints Process Section */}
            <section className={SECTION}>
              <p className={eyebrow}>The Process</p>
              <h2 className={cn(sectionHeading, "mt-3")}>
                How to Make a Complaint
              </h2>
              <p className="mt-4 text-lg text-banc-muted-readable">
                Our four-step process is designed to resolve your complaint as quickly as possible.
              </p>

              <div className="mt-7">
                {complaintSteps.map((step) => (
                  <div key={step.step} className="flex gap-5 border-t border-banc-dark/15 py-5">
                    <span className="w-6 flex-shrink-0 font-display text-2xl font-light leading-none text-banc-focus">{step.step}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-banc-dark-deep">{step.title}</h3>
                      <p className="mt-1 text-sm text-banc-muted-readable">{step.description}</p>
                      <p className="mt-3 text-sm font-medium text-banc-dark-deep">{step.timeframe}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* How to Complain Section */}
            <section className={SECTION}>
              <p className={eyebrow}>Contact Us</p>
              <h2 className={cn(sectionHeading, "mt-3")}>
                How to Contact Us
              </h2>

              <p className="mt-6 text-banc-muted-readable">
                You can make a complaint using any of the following methods. Please provide 
                as much detail as possible to help us investigate effectively.
              </p>

              <div className="mt-7">
                <a href="mailto:complaints@bancproperty.com" className="group block border-t border-banc-dark/15 py-4">
                  <h3 className="font-semibold text-banc-dark-deep">Email</h3>
                  <p className="text-sm text-banc-focus underline-offset-4 group-hover:underline">complaints@bancproperty.com</p>
                </a>

                <a href={BANC_CONTACT.callHref} className="group block border-t border-banc-dark/15 py-4">
                  <h3 className="font-semibold text-banc-dark-deep">Phone</h3>
                  <p className="text-sm text-banc-focus underline-offset-4 group-hover:underline">{BANC_CONTACT.displayPhone}</p>
                </a>

                <div className="border-t border-banc-dark/15 py-4">
                  <h3 className="font-semibold text-banc-dark-deep">Post</h3>
                  <p className="text-sm text-banc-muted-readable">
                    Complaints Department<br />
                    Banc Property Group<br />
                    1 Station Road<br />
                    Cuffley, EN6 4HU
                  </p>
                </div>
              </div>

              {/* What to include */}
              <div className="border-t border-banc-dark/15 pt-6">
                <h4 className="font-semibold text-banc-dark-deep mb-3">Please Include:</h4>
                <ul className="space-y-2 text-sm text-banc-muted-readable">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 flex-shrink-0 text-banc-focus mt-0.5" />
                    Your full name and contact details
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 flex-shrink-0 text-banc-focus mt-0.5" />
                    Property address (if applicable)
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 flex-shrink-0 text-banc-focus mt-0.5" />
                    Details of what went wrong
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 flex-shrink-0 text-banc-focus mt-0.5" />
                    What you&apos;d like us to do to put it right
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 flex-shrink-0 text-banc-focus mt-0.5" />
                    Any relevant reference numbers
                  </li>
                </ul>
              </div>
            </section>

            {/* Complaint form */}
            <section className={SECTION}>
              <div className={formPanel}>
                <h3 className="text-xl font-semibold text-banc-dark-deep mb-2">Make a Complaint</h3>
                <p className="text-sm text-banc-muted-readable mb-6">
                  Use this form to submit your complaint. We&apos;ll respond within 3 working days.
                </p>

                <SimpleEnquiryForm
                  fields={COMPLAINT_FIELDS}
                  subject="Complaint — {nature}"
                  intro="Complaint submitted through the website complaints form."
                  submitLabel="Submit Complaint"
                  successTitle="Complaint received"
                  successBody="Thank you. We take every complaint seriously and will respond within 3 working days."
                  consentLabel={
                    <>
                      I understand that my personal information will be used to investigate this complaint
                      in accordance with our <Link href="/privacy" className="text-banc-focus underline underline-offset-2">Privacy Policy</Link>.
                    </>
                  }
                />
              </div>
            </section>

            {/* Redress Section */}
            <section className={SECTION}>
              <p className={eyebrow}>Independent Redress</p>
              <h2 className={cn(sectionHeading, "mt-3")}>
                Independent Redress
              </h2>
              <p className="mt-4 text-lg text-banc-muted-readable">
                If you&apos;re not satisfied with our final response, you can escalate your complaint 
                to an independent redress scheme.
              </p>

              <div className="mt-7">
                {redressSchemes.map((scheme) => (
                  <div key={scheme.name} className="border-t border-banc-dark/15 py-6">
                    <h3 className="text-xl font-semibold text-banc-dark-deep">{scheme.name}</h3>
                    <p className="mt-1 text-banc-muted-readable">{scheme.description}</p>

                    <div className="mt-3 flex flex-col text-sm">
                      <a 
                        href={`https://${scheme.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center text-banc-focus underline underline-offset-4"
                      >
                        {scheme.website}
                      </a>
                      <a href={`tel:${scheme.phone.replace(/\s/g, '')}`} className="inline-flex min-h-11 items-center text-banc-dark-mid">
                        {scheme.phone}
                      </a>
                      <a href={`mailto:${scheme.email}`} className="inline-flex min-h-11 items-center text-banc-dark-mid">
                        {scheme.email}
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-banc-dark/15 pt-6">
                <h4 className="font-semibold text-banc-dark-deep mb-2">Important Note</h4>
                <p className="text-sm text-banc-dark-mid">
                  You must wait until you receive our final written response (or 8 weeks from 
                  the date of your complaint if we haven&apos;t responded) before escalating to 
                  The Property Ombudsman. Their service is free for consumers.
                </p>
              </div>
            </section>

            {/* Regulatory Info Section */}
            <section className={SECTION}>
              <h2 className={sectionHeading}>
                Regulatory Information
              </h2>
              <p className="mt-6 text-banc-muted-readable">
                Banc Property Group is committed to maintaining the highest professional standards. 
                We are members of professional bodies and subject to regulatory oversight.
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 text-banc-focus mt-0.5" />
                  <div>
                    <p className="font-medium text-banc-dark-deep">Member of The Property Ombudsman</p>
                    <p className="text-sm text-banc-muted-readable">Redress scheme membership</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 text-banc-focus mt-0.5" />
                  <div>
                    <p className="font-medium text-banc-dark-deep">Propertymark Member</p>
                    <p className="text-sm text-banc-muted-readable">Professional body membership</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 text-banc-focus mt-0.5" />
                  <div>
                    <p className="font-medium text-banc-dark-deep">Client Money Protection</p>
                    <p className="text-sm text-banc-muted-readable">All client funds fully protected</p>
                  </div>
                </div>
              </div>

              <h3 className="mb-2 mt-8 font-semibold text-banc-dark-deep">Our Registration Details</h3>
              <div className="text-sm">
                <div className="flex justify-between gap-6 border-b border-banc-dark/15 py-3">
                  <span className="text-banc-muted-readable">Company Name</span>
                  <span className="text-right font-medium text-banc-dark-deep">Banc Property Group Ltd</span>
                </div>
                <div className="flex justify-between gap-6 border-b border-banc-dark/15 py-3">
                  <span className="text-banc-muted-readable">Registered Address</span>
                  <span className="text-right font-medium text-banc-dark-deep">1 Station Road, Cuffley, EN6 4HU</span>
                </div>
                <div className="flex justify-between gap-6 border-b border-banc-dark/15 py-3">
                  <span className="text-banc-muted-readable">Phone</span>
                  <span className="text-right font-medium text-banc-dark-deep">{BANC_CONTACT.displayPhone}</span>
                </div>
                <div className="flex justify-between gap-6 py-3">
                  <span className="text-banc-muted-readable">Email</span>
                  <span className="text-right font-medium text-banc-dark-deep">info@bancproperty.com</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
