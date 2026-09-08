'use client';

import Link from "next/link";
import Image from "next/image";
import { CMP_CERTIFICATE_URL } from "@/lib/banc-contact";
import { Instagram, Youtube, Facebook, Phone, Mail, MapPin } from "lucide-react";
import { BANC_CONTACT, LIFE_MAGAZINE_URL } from "@/lib/banc-contact";

const footerLinks = {
  about: [
    { name: "Why Us", href: "/why-us" },
    { name: "Our Team", href: "/the-team" },
    { name: "Track Record", href: "/track-record" },
    { name: "The Guild", href: "/the-guild" },
    { name: "Reviews", href: "/reviews" },
    { name: "Area Guides", href: "/area-guides" },
    { name: "Community", href: "/community" },
    { name: "Blog", href: "/blog" },
    { name: "Our Offices", href: "/offices" },
  ],
  services: [
    { name: "Sell Your Home", href: "/sales/sellers-guide" },
    { name: "Request a Valuation", href: "/valuation" },
    { name: "Property Search", href: "/sales/properties" },
    { name: "Lettings", href: "/lettings" },
    { name: "Property Management", href: "/lettings/landlords-guide" },
    { name: "Premier Homes", href: "/premier-homes" },
    { name: "Land & New Homes", href: "/land-new-homes" },
    { name: "Become a Partner", href: "/become-partner" },
  ],
  resources: [
    { name: "Stamp Duty Calculator", href: "/tools/stamp-duty" },
    { name: "Mortgage Calculator", href: "/tools/mortgage-calculator" },
    { name: "Yield Calculator", href: "/tools/yield-calculator" },
    { name: "Affordability Calculator", href: "/tools/affordability" },
    { name: "Catchment Checker", href: "/tools/catchment-checker" },
    { name: "Buying Guide", href: "/sales/buyers-guide" },
    { name: "Selling Guide", href: "/sales/sellers-guide" },
    { name: "Lettings Fees", href: "/lettings/fees" },
    { name: "Life Magazine", href: LIFE_MAGAZINE_URL },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Use", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "Complaints Procedure", href: "/complaints" },
  ],
};

export default function Footer() {

  return (
    <footer className="bg-banc-dark-deep text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/banc-logo-blue.png"
                alt="Banc Property Group"
                width={180}
                height={50}
                className="h-12 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-banc-grey mb-6 max-w-sm">
              Independent estate agents serving Hertfordshire and North London.
              Exceptional service, exceptional results.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a href={BANC_CONTACT.callHref} className="flex items-center gap-3 text-banc-grey hover:text-banc-sky transition-colors">
                <Phone className="h-4 w-4" />
                <span>{BANC_CONTACT.displayPhone}</span>
              </a>
              <a href="mailto:info@bancproperty.com" className="flex items-center gap-3 text-banc-grey hover:text-banc-sky transition-colors">
                <Mail className="h-4 w-4" />
                <span>info@bancproperty.com</span>
              </a>
              <div className="flex items-start gap-3 text-banc-grey">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>1 Station Road, Cuffley,<br />Hertfordshire, EN6 4HU</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://www.facebook.com/BANCpropertygroup"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-banc-sky transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2 focus-visible:ring-offset-banc-dark-deep"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/bancproperty"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-banc-sky transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2 focus-visible:ring-offset-banc-dark-deep"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/channel/UCuNRAhFmoSsDzyL6sFpOGtQ"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-banc-sky transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2 focus-visible:ring-offset-banc-dark-deep"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* About Links */}
          <nav aria-label="About Banc">
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-banc-grey hover:text-banc-sky transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Services Links */}
          <nav aria-label="Services">
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-banc-grey hover:text-banc-sky transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Resources Links */}
          <nav aria-label="Resources">
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-banc-grey hover:text-banc-sky transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Newsletter sign-up hidden until Banc are ready to send one. The
              form and its API are wired and tested; only the entry point is off. */}
        </div>
      </div>

      {/* Partner & Accreditation Logos — white strip */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-[10px] font-medium uppercase tracking-[0.25em] text-banc-grey/60 mb-6">
            Accredited &amp; Trusted Partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-14">
            {[
              { src: "/partners/rightmove.png", alt: "Rightmove", w: "w-[130px] md:w-[160px]" },
              { src: "/zoopla_logo-01.jpg", alt: "Zoopla", w: "w-[100px] md:w-[130px]" },
              { src: "/TheGuild_Logo_RGB.jpg", alt: "The Guild of Property Professionals", w: "w-[70px] md:w-[90px]" },
              { src: "/propertymark.jpg", alt: "The Property Ombudsman", w: "w-[110px] md:w-[140px]" },
              { src: "/9_long_member_rgb.png", alt: "OnTheMarket", w: "w-[130px] md:w-[160px]" },
              { src: "/tpo-tsi.jpg", alt: "TPO & TSI Approved", w: "w-[120px] md:w-[150px]" },
            ].map((logo) => (
              <Image
                key={logo.alt}
                src={logo.src}
                alt={logo.alt}
                width={200}
                height={80}
                className={`${logo.w} h-auto object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300`}
              />
            ))}
            {/* Client Money Protection — the certificate is the thing that
                matters for compliance, so it links straight to the PDF. The
                scheme's logo replaces this text chip once Nitesh sends it
                (due the morning of 8 Sep). */}
            <a
              href={CMP_CERTIFICATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-banc-line px-3 text-[11px] font-medium uppercase tracking-[0.14em] text-banc-muted-readable transition-colors hover:border-banc-focus hover:text-banc-focus"
            >
              <span className="text-banc-focus">CMP</span> Client Money Protected · certificate
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-banc-grey text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} Banc Property Group. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-banc-grey hover:text-banc-sky transition-colors text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
