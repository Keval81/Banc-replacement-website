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
  MessageCircle,
  Home,
  Key,
  Users,
  Building,
  FileText
} from "lucide-react";
import Link from "next/link";
import FAQAccordion from "./FAQAccordion";
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
      
      {/* Hero Section */}
      <section className="relative bg-banc-dark-deep py-24 lg:py-32 overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-banc-dark-deep/80 via-banc-dark-deep/60 to-banc-dark-deep/40" />
        </div>
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-banc-sky rounded-full blur-[128px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-banc-sky rounded-full blur-[128px]" />
        </div>
        
        <div className="relative mx-auto max-w-4xl px-6 lg:px-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <HelpCircle className="h-4 w-4 text-banc-sky" />
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
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-banc-grey" />
              <Input 
                placeholder="Search for answers..."
                className="h-14 pl-12 pr-4 rounded-xl border-0 bg-white text-banc-dark-deep placeholder:text-banc-grey focus:ring-2 focus:ring-banc-sky"
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
                <h3 className="text-sm font-semibold uppercase tracking-wider text-banc-muted-readable mb-4">
                  Categories
                </h3>
                <nav className="space-y-1">
                  {faqCategories.map((category) => {
                    const CategoryIcon = FAQ_ICONS[category.icon];
                    return (
                    <a
                      key={category.id}
                      href={`#${category.id}`}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-banc-dark-mid hover:bg-white hover:shadow-sm transition-all group"
                    >
                      <CategoryIcon className="h-5 w-5 text-banc-muted-readable group-hover:text-banc-sky transition-colors" />
                      <span className="font-medium">{category.name}</span>
                    </a>
                    );
                  })}
                </nav>
              </div>
            </div>
            
            {/* FAQ Accordions */}
            <div className="lg:col-span-3 space-y-16">
              {faqCategories.map((category) => {
                const CategoryIcon = FAQ_ICONS[category.icon];
                return (
                <div key={category.id} id={category.id}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-banc-sky/10 flex items-center justify-center">
                      <CategoryIcon className="h-6 w-6 text-banc-focus" />
                    </div>
                    <h2 className="text-2xl font-semibold text-banc-dark-deep">{category.name}</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <FAQAccordion items={category.questions} />
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Still Have Questions Section */}
      <section className="py-20 lg:py-28 bg-banc-dark-deep">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <MessageCircle className="h-4 w-4 text-banc-sky" />
              <span className="text-sm font-medium text-white/80">Need More Help?</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-semibold text-white">
              Still Have Questions?
            </h2>
            <p className="mt-4 text-lg text-white/60">
              Can&apos;t find what you&apos;re looking for? Our friendly team is here to help.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Phone */}
            <a href={BANC_CONTACT.callHref} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-banc-sky/50 transition-colors group">
              <div className="w-14 h-14 rounded-xl bg-banc-sky/20 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-7 w-7 text-banc-sky" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Call Us</h3>
              <p className="text-white/60 text-sm mb-3">Speak to our team directly</p>
              <p className="text-banc-sky font-semibold group-hover:underline">{BANC_CONTACT.displayPhone}</p>
            </a>
            
            {/* Email */}
            <a href="mailto:info@bancproperty.com" className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-banc-sky/50 transition-colors group">
              <div className="w-14 h-14 rounded-xl bg-banc-sky/20 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-7 w-7 text-banc-sky" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Email Us</h3>
              <p className="text-white/60 text-sm mb-3">We&apos;ll respond within 24 hours</p>
              <p className="text-banc-sky font-semibold group-hover:underline">info@bancproperty.com</p>
            </a>
            
            {/* Visit */}
            <Link href="/contact" className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-banc-sky/50 transition-colors group">
              <div className="w-14 h-14 rounded-xl bg-banc-sky/20 flex items-center justify-center mx-auto mb-4">
                <Building className="h-7 w-7 text-banc-sky" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Visit Us</h3>
              <p className="text-white/60 text-sm mb-3">Come and see us in person</p>
              <p className="text-banc-sky font-semibold group-hover:underline">Find Our Office</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-banc-dark-deep">Popular Resources</h2>
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
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-banc-line/30 hover:border-banc-sky/50 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-banc-sky/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-5 w-5 text-banc-focus" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-banc-dark-deep group-hover:text-banc-sky transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-banc-muted-readable">{item.desc}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-banc-line group-hover:text-banc-sky group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
