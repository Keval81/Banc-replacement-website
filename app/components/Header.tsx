"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, ChevronRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Sales", href: "/sales" },
  { name: "Lettings", href: "/lettings" },
  { name: "About", href: "/why-us" },
  { name: "Premier Homes", href: "/premier-homes" },
  { name: "Reviews", href: "/reviews" },
  { name: "Contact", href: "/contact" },
];

const dropdowns = {
  Sales: [
    { title: "Our Properties", href: "/sales/properties" },
    { title: "Buyers Guide", href: "/sales/buyers-guide" },
    { title: "Sellers Guide", href: "/sales/sellers-guide" },
  ],
  Lettings: [
    { title: "Rental Properties", href: "/lettings/properties" },
    { title: "Tenants Guide", href: "/lettings/tenants-guide" },
    { title: "Landlords Guide", href: "/lettings/landlords-guide" },
  ],
  About: [
    { title: "Why Us", href: "/why-us" },
    { title: "Our Team", href: "/the-team" },
    { title: "Track Record", href: "/track-record" },
    { title: "The Guild", href: "/the-guild" },
    { title: "Area Guides", href: "/area-guides" },
  ],
} as const;

// Additional mobile-only links
const mobileAdditionalLinks = [
  { title: "Land & New Homes", href: "/land-new-homes" },
  { title: "Become a Partner", href: "/become-partner" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = React.useState<string | null>(null);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileOpen(false);
    setMobileExpanded(null);
  }, []);

  // Close on escape key and lock body scroll
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setMobileExpanded(null);
      }
    };
    
    if (mobileOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.dataset.scrollY = String(scrollY);
    } else {
      const scrollY = document.body.dataset.scrollY || '0';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0'));
    }
    
    window.addEventListener("keydown", handleEscape);
    
    return () => {
      window.removeEventListener("keydown", handleEscape);
      const scrollY = document.body.dataset.scrollY || '0';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0'));
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] border-b border-white/10 bg-[#2C2F33]/95 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 lg:px-10">
          {/* Logo - Smaller on mobile */}
          <Link href="/" aria-label="Banc Property Group" className="flex items-center">
            <Image
              src="/banc-logo-blue.png"
              alt="Banc Property Group"
              width={280}
              height={84}
              className="h-10 w-auto object-contain lg:h-[70px]"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 text-sm font-medium text-white lg:flex">
            {navItems.map((item) => {
              const hasDropdown = item.name in dropdowns;
              return (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => hasDropdown && setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1 transition-colors hover:text-[#1DBFDD]",
                      activeDropdown === item.name && "text-[#1DBFDD]"
                    )}
                  >
                    {item.name}
                    {hasDropdown && <ChevronDown className="h-4 w-4" />}
                  </Link>
                  
                  {/* Desktop Dropdown */}
                  {hasDropdown && (
                    <AnimatePresence>
                      {activeDropdown === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-white/10 bg-[#2C2F33] p-3 shadow-2xl"
                        >
                          <div className="grid gap-1">
                            {dropdowns[item.name as keyof typeof dropdowns].map((link) => (
                              <Link
                                key={link.title}
                                href={link.href}
                                className="rounded-lg px-3 py-2.5 text-sm text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                              >
                                {link.title}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-4 lg:flex">
            <Link href="tel:01707877781" className="text-sm text-white/80 hover:text-[#1DBFDD]">
              01707 877781
            </Link>
            <Link href="/contact">
              <Button className="bg-[#1DBFDD] text-white hover:bg-[#0E8CAB]">
                Request Valuation
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white active:bg-white/10 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[90] bg-black/50 transition-opacity duration-300 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          
          {/* Menu Panel */}
          <div
            className="fixed right-0 top-0 bottom-0 z-[95] w-[85%] max-w-[320px] bg-[#2C2F33] shadow-2xl transition-transform duration-300 ease-out lg:hidden"
            style={{ 
              paddingTop: "73px",
              transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)'
            }}
          >
              <div className="h-full overflow-y-auto px-5 pb-32">
                {/* Mobile Navigation Links */}
                <nav className="flex flex-col">
                  {navItems.map((item) => {
                    const hasDropdown = item.name in dropdowns;
                    const isExpanded = mobileExpanded === item.name;
                    
                    return (
                      <div key={item.name} className="border-b border-white/10">
                        <div className="flex items-center justify-between">
                          <Link
                            href={item.href}
                            className="flex-1 py-4 text-base font-medium text-white"
                            onClick={() => !hasDropdown && setMobileOpen(false)}
                          >
                            {item.name}
                          </Link>
                          {hasDropdown && (
                            <button
                              onClick={() => setMobileExpanded(isExpanded ? null : item.name)}
                              className="flex h-10 w-10 items-center justify-center text-white"
                            >
                              <ChevronDown 
                                className={cn(
                                  "h-5 w-5 transition-transform",
                                  isExpanded && "rotate-180"
                                )} 
                              />
                            </button>
                          )}
                        </div>
                        
                        {/* Expanded Submenu */}
                        {hasDropdown && isExpanded && (
                          <div className="overflow-hidden pb-3 pl-4">
                            {dropdowns[item.name as keyof typeof dropdowns].map((link) => (
                              <Link
                                key={link.title}
                                href={link.href}
                                className="flex items-center gap-2 py-2.5 text-sm text-white/70"
                                onClick={() => setMobileOpen(false)}
                              >
                                <ChevronRight className="h-4 w-4 text-[#1DBFDD]" />
                                {link.title}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Additional Mobile Links */}
                  {mobileAdditionalLinks.map((link) => (
                    <Link
                      key={link.title}
                      href={link.href}
                      className="border-b border-white/10 py-4 text-base font-medium text-white"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.title}
                    </Link>
                  ))}
                </nav>

                {/* Mobile CTA Section */}
                <div className="mt-8 space-y-3">
                  <a
                    href="tel:01707877781"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 py-4 text-base font-medium text-white"
                  >
                    <Phone className="h-5 w-5" />
                    01707 877781
                  </a>
                  <Link href="/contact" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-[#1DBFDD] py-5 text-base font-medium text-white hover:bg-[#0E8CAB]">
                      Request Valuation
                    </Button>
                  </Link>
                </div>

                {/* Contact Info */}
                <div className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-white/50">
                  <p>1 Station Road</p>
                  <p>Cuffley, EN6 4HU</p>
                </div>
              </div>
            </div>
          </>
        )}

      {/* Header Spacer */}
      <div className="h-[57px] bg-[#2C2F33] lg:h-[94px]" />

      {/* Sticky Mobile CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[80] border-t border-white/10 bg-[#2C2F33] px-4 py-3 lg:hidden">
        <div className="mx-auto flex max-w-md gap-3">
          <a
            href="tel:01707877781"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 py-3.5 text-sm font-medium text-white"
          >
            <Phone className="h-4 w-4" />
            Call Now
          </a>
          <Link href="/contact" className="flex-1">
            <Button className="w-full bg-[#1DBFDD] py-3.5 text-sm font-medium text-white hover:bg-[#0E8CAB]">
              Valuation
            </Button>
          </Link>
        </div>
      </div>

      {/* Spacer for sticky bottom bar */}
      <div className="h-16 lg:hidden" />
    </>
  );
}
