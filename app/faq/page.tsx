import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { 
  Search,
  ArrowRight,
  HelpCircle,
  Phone,
  Home,
  Key,
  Users,
  Building,
  FileText
} from "lucide-react";
import Link from "next/link";
import FAQAccordion from "./FAQAccordion";
import { PageBand } from "@/components/PageBand";
import {
  actionPrimaryOnDark,
  actionSecondaryOnDark,
  eyebrow,
  eyebrowOnDark,
  fieldControlOnDark,
  sectionHeading,
  sectionHeadingOnDark,
  sectionPadding,
} from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";
import { JsonLd } from "@/components/JsonLd";
import { faqCategories, getAllFaqItems, type FaqIconId } from "@/lib/faq-content";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/schema-org";
import type { LucideIcon } from "lucide-react";
import { BANC_CONTACT } from "@/lib/banc-contact";

export const revalidate = 3600;

export const metadata: Metadata = withPageDefaults("/faq", {
  title: "FAQ | Banc Property Group",
  description: "Find answers to frequently asked questions about selling, buying, letting, and renting properties with Banc Property Group.",
  keywords: "property FAQ, estate agent questions, selling property FAQ, renting FAQ, letting questions",
});

const FAQ_ICONS: Record<FaqIconId, LucideIcon> = {
  "building": Building,
  "file-text": FileText,
  "help-circle": HelpCircle,
  "home": Home,
  "key": Key,
  "users": Users,
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-banc-grey-pale">
      <JsonLd
        data={[
          faqPageJsonLd(getAllFaqItems()),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]),
        ]}
      />
      <Header />
      
      <PageBand
        eyebrow="Help Centre"
        title="Frequently Asked Questions"
        lede="Find answers to common questions about buying, selling, letting, and renting with Banc Property Group."
        image={{
          src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1920&q=80",
          alt: "",
          priority: true,
        }}
      >
        {/* Search bar */}
        <div className="relative max-w-2xl">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-banc-muted-readable" />
          <Input
            placeholder="Search for answers..."
            className={cn(fieldControlOnDark, "pl-11 focus-visible:ring-[var(--banc-focus-dark)] focus-visible:ring-offset-0")}
          />
        </div>
      </PageBand>

      {/* FAQ Content */}
      <section className={sectionPadding}>
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Category Navigation - Desktop */}
            <div className="hidden lg:block">
              <div className="sticky top-32">
                <h3 className={cn(eyebrow, "mb-4")}>
                  Categories
                </h3>
                <nav className="border-t border-banc-dark/15">
                  {faqCategories.map((category) => {
                    const CategoryIcon = FAQ_ICONS[category.icon];
                    return (
                    <a
                      key={category.id}
                      href={`#${category.id}`}
                      className="group flex min-h-11 items-center gap-3 border-b border-banc-dark/15 py-3 text-banc-dark-mid transition-colors hover:text-banc-focus"
                    >
                      <CategoryIcon className="h-5 w-5 text-banc-muted-readable transition-colors group-hover:text-banc-focus" />
                      <span className="font-medium">{category.name}</span>
                    </a>
                    );
                  })}
                </nav>
              </div>
            </div>
            
            {/* FAQ Accordions */}
            <div className="space-y-12 lg:col-span-3 lg:space-y-16">
              {faqCategories.map((category) => {
                return (
                <div key={category.id} id={category.id} className="scroll-mt-28">
                  <h2 className={cn(sectionHeading, "mb-6")}>{category.name}</h2>

                  <FAQAccordion items={category.questions} />
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className={cn(sectionPadding, "pt-0 lg:pt-0")}>
        <div className="mx-auto max-w-7xl border-t border-banc-dark/15 pt-12">
          <h2 className={cn(sectionHeading, "mb-6")}>Popular Resources</h2>

          <div className="grid gap-x-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Property Search", desc: "Browse our listings", link: "/sales/properties", icon: Home },
              { title: "Book Valuation", desc: "Free property valuation", link: "/valuation", icon: Key },
              { title: "Lettings Fees", desc: "Transparent pricing", link: "/lettings/fees", icon: FileText },
              { title: "Contact Us", desc: "Get in touch", link: "/contact", icon: Phone },
            ].map((item) => (
              <Link 
                key={item.title}
                href={item.link}
                className="group flex min-h-11 items-center gap-4 border-t border-banc-dark/15 py-4"
              >
                <item.icon className="h-5 w-5 shrink-0 text-banc-focus" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-banc-dark-deep transition-colors group-hover:text-banc-focus">
                    {item.title}
                  </h3>
                  <p className="text-sm text-banc-muted-readable">{item.desc}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-banc-muted-readable transition-all group-hover:translate-x-1 group-hover:text-banc-focus motion-reduce:transition-none" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions Section */}
      <section className={cn(sectionPadding, "banc-dark-surface bg-banc-dark-deep text-white")}>
        <div className="mx-auto max-w-7xl">
          <p className={eyebrowOnDark}>Need More Help?</p>
          <h2 className={cn(sectionHeadingOnDark, "mt-3")}>
            Still Have Questions?
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 lg:text-lg">
            Can&apos;t find what you&apos;re looking for? Our friendly team is here to help.
          </p>

          <div className="mt-7 grid gap-x-8 md:grid-cols-3">
            {/* Phone */}
            <a href={BANC_CONTACT.callHref} className="block border-t border-white/15 py-6">
              <h3 className="text-lg font-semibold text-white">Call Us</h3>
              <p className="mb-4 mt-1 text-sm text-white/70">Speak to our team directly</p>
              <span className={actionPrimaryOnDark}>{BANC_CONTACT.displayPhone}</span>
            </a>
            
            {/* Email */}
            <a href="mailto:info@bancproperty.com" className="block border-t border-white/15 py-6">
              <h3 className="text-lg font-semibold text-white">Email Us</h3>
              <p className="mb-4 mt-1 text-sm text-white/70">We&apos;ll respond within 24 hours</p>
              <span className={actionSecondaryOnDark}>info@bancproperty.com</span>
            </a>
            
            {/* Visit */}
            <Link href="/offices" className="block border-t border-white/15 py-6">
              <h3 className="text-lg font-semibold text-white">Visit Us</h3>
              <p className="mb-4 mt-1 text-sm text-white/70">Come and see us in person</p>
              <span className={actionSecondaryOnDark}>Find Our Office</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
