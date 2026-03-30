'use client';

import Link from "next/link";
import Image from "next/image";
import { Instagram, Linkedin, Facebook, Phone, Mail, MapPin, Loader2, Check } from "lucide-react";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const footerLinks = {
  about: [
    { name: "Why Us", href: "/why-us" },
    { name: "Our Team", href: "/the-team" },
    { name: "Track Record", href: "/track-record" },
    { name: "The Guild", href: "/the-guild" },
    { name: "Reviews", href: "/reviews" },
    { name: "Area Guides", href: "/area-guides" },
    { name: "Our Offices", href: "/offices" },
    { name: "Careers", href: "/careers" },
  ],
  services: [
    { name: "Sell Your Home", href: "/sales/sellers-guide" },
    { name: "Free Valuation", href: "/tools/valuation" },
    { name: "Property Search", href: "/sales/properties" },
    { name: "Lettings", href: "/lettings" },
    { name: "Property Management", href: "/lettings/landlords-guide" },
    { name: "Premier Homes", href: "/premier-homes" },
    { name: "New Homes", href: "/new-homes" },
    { name: "Land & Development", href: "/land-development" },
  ],
  resources: [
    { name: "Stamp Duty Calculator", href: "/tools/stamp-duty" },
    { name: "Mortgage Calculator", href: "/tools/mortgage-calculator" },
    { name: "Yield Calculator", href: "/tools/yield-calculator" },
    { name: "Affordability Calculator", href: "/tools/affordability" },
    { name: "Catchment Checker", href: "/tools/catchment-checker" },
    { name: "Buying Guide", href: "/sales/buyers-guide" },
    { name: "Selling Guide", href: "/sales/sellers-guide" },
    { name: "Lettings Guide", href: "/lettings/landlords-guide" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Use", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "Complaints Procedure", href: "/complaints" },
    { name: "Modern Slavery Statement", href: "/modern-slavery" },
  ],
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStatus('success');
    setEmail('');
    
    // Reset after 3 seconds
    setTimeout(() => setStatus('idle'), 3000);
  };

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
              Award-winning estate agents serving Hertfordshire and North London. 
              Exceptional service, exceptional results.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a href="tel:01707877781" className="flex items-center gap-3 text-banc-grey hover:text-banc-sky transition-colors">
                <Phone className="h-4 w-4" />
                <span>01707 877781</span>
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
                href="https://facebook.com/bancproperty"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-banc-sky transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/bancproperty"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-banc-sky transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com/company/bancproperty"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-banc-sky transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* About Links */}
          <div>
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
          </div>

          {/* Services Links */}
          <div>
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
          </div>

          {/* Resources Links */}
          <div>
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
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <p className="text-banc-grey text-sm mb-4">
              Get the latest properties and market news delivered to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-banc-grey"
                />
                <Button 
                  type="submit" 
                  disabled={status === 'loading' || status === 'success'}
                  className="bg-banc-sky hover:bg-banc-sky/90 whitespace-nowrap"
                >
                  {status === 'loading' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : status === 'success' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    'Subscribe'
                  )}
                </Button>
              </div>
              {status === 'success' && (
                <p className="text-green-400 text-sm">Thanks for subscribing!</p>
              )}
            </form>
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
