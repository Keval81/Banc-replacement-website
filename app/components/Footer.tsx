import Link from "next/link";
import Image from "next/image";
import { Instagram, Linkedin, Facebook, Phone, Mail, MapPin, ChevronDown } from "lucide-react";

const footerLinks = {
  about: [
    { name: "Why Us", href: "/why-us" },
    { name: "Our Team", href: "/the-team" },
    { name: "Track Record", href: "/track-record" },
    { name: "The Guild", href: "/the-guild" },
    { name: "Reviews", href: "/reviews" },
    { name: "Area Guides", href: "/area-guides" },
  ],
  services: [
    { name: "Sales", href: "/sales" },
    { name: "Lettings", href: "/lettings" },
    { name: "Premier Homes", href: "/premier-homes" },
    { name: "Land & New Homes", href: "/land-new-homes" },
    { name: "Become a Partner", href: "/become-partner" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#2C2F33] text-white pb-20 lg:pb-0">
      {/* Main Footer */}
      <div className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-10 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-4 lg:gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Image
              src="/banc-logo-blue.png"
              alt="Banc Property Group"
              width={210}
              height={60}
              className="h-12 w-auto object-contain brightness-0 invert lg:h-[60px]"
            />
            <p className="mt-4 text-sm text-white/70">
              Exceptional properties and bespoke service across Cuffley, Mayfair, and beyond.
            </p>
            
            {/* Social Links */}
            <div className="mt-6 flex items-center gap-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-[#1DBFDD] hover:text-white"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-[#1DBFDD] hover:text-white"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-[#1DBFDD] hover:text-white"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* About Links - Mobile: show inline, Desktop: column */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50 lg:text-sm">
              About Us
            </p>
            <ul className="mt-4 space-y-3">
              {footerLinks.about.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href} 
                    className="text-sm text-white/70 transition-colors hover:text-[#1DBFDD]"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50 lg:text-sm">
              Services
            </p>
            <ul className="mt-4 space-y-3">
              {footerLinks.services.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href} 
                    className="text-sm text-white/70 transition-colors hover:text-[#1DBFDD]"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50 lg:text-sm">
              Contact
            </p>
            <ul className="mt-4 space-y-4">
              <li>
                <a 
                  href="tel:01707877781" 
                  className="flex items-center gap-3 text-sm text-white/70 transition-colors hover:text-[#1DBFDD]"
                >
                  <Phone className="h-4 w-4 text-[#1DBFDD]" />
                  01707 877781
                </a>
              </li>
              <li>
                <a 
                  href="mailto:info@bancproperty.com" 
                  className="flex items-center gap-3 text-sm text-white/70 transition-colors hover:text-[#1DBFDD]"
                >
                  <Mail className="h-4 w-4 text-[#1DBFDD]" />
                  info@bancproperty.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/70">
                <MapPin className="h-4 w-4 flex-shrink-0 text-[#1DBFDD]" />
                <span>
                  1 Station Road<br />
                  Cuffley, EN6 4HU
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 border-t border-white/10 pt-6 lg:mt-12">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-xs text-white/50">
              © 2026 Banc Property Group. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-white/50">
              <Link href="/privacy" className="hover:text-white/70">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white/70">Terms of Use</Link>
              <Link href="/cookies" className="hover:text-white/70">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
