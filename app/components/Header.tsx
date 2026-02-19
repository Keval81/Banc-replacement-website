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

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 border-b border-white/10 bg-[#2C2F33] backdrop-blur-xl"
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 lg:px-10">
          {/* Logo */}
          <Link href="/" aria-label="Banc Property Group" className="flex items-center">
            <Image
              src="/banc-logo-blue.png"
              alt="Banc Property Group"
              width={280}
              height={84}
              className="h-14 w-auto object-contain lg:h-[84px]"
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
                          className="absolute left-0 mt-4 w-72 rounded-2xl border border-white/20 bg-[#2C2F33] p-4 shadow-xl"
                        >
                          <div className="grid gap-2">
                            {dropdowns[item.name as keyof typeof dropdowns].map((link) => (
                              <Link
                                key={link.title}
                                href={link.href}
                                className="rounded-lg p-3 transition-colors hover:bg-white/10"
                              >
                                <p className="text-sm font-semibold text-white">{link.title}</p>
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
            <Button className="bg-[#1DBFDD] text-white hover:bg-[#0E8CAB]">
              Request Valuation
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu - Full Screen Overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-[57px] z-40 bg-[#2C2F33] lg:hidden"
            >
              <div className="h-full overflow-y-auto px-4 pb-24 pt-4">
                {/* Mobile Navigation Links */}
                <nav className="flex flex-col gap-1">
                  {/* Main Items with Expandable Submenus */}
                  {navItems.map((item) => {
                    const hasDropdown = item.name in dropdowns;
                    const isExpanded = mobileExpanded === item.name;
                    
                    return (
                      <div key={item.name} className="border-b border-white/10">
                        <div className="flex items-center justify-between">
                          <Link
                            href={item.href}
                            className="flex-1 py-4 text-lg font-medium text-white"
                            onClick={() => !hasDropdown && setMobileOpen(false)}
                          >
                            {item.name}
                          </Link>
                          {hasDropdown && (
                            <button
                              onClick={() => setMobileExpanded(isExpanded ? null : item.name)}
                              className="p-2 text-white"
                              aria-label={isExpanded ? "Collapse" : "Expand"}
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
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-1 pb-4 pl-4">
                              {dropdowns[item.name as keyof typeof dropdowns].map((link) => (
                                <Link
                                  key={link.title}
                                  href={link.href}
                                  className="flex items-center gap-2 py-2 text-sm text-white/70 hover:text-[#1DBFDD]"
                                  onClick={() => setMobileOpen(false)}
                                >
                                  <ChevronRight className="h-4 w-4" />
                                  {link.title}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Additional Mobile Links */}
                  {mobileAdditionalLinks.map((link) => (
                    <Link
                      key={link.title}
                      href={link.href}
                      className="border-b border-white/10 py-4 text-lg font-medium text-white"
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
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 py-4 text-lg font-medium text-white hover:bg-white/10"
                  >
                    <Phone className="h-5 w-5" />
                    Call 01707 877781
                  </a>
                  <Button 
                    className="w-full bg-[#1DBFDD] py-6 text-lg font-medium text-white hover:bg-[#0E8CAB]"
                    onClick={() => setMobileOpen(false)}
                  >
                    Request Valuation
                  </Button>
                </div>

                {/* Contact Info */}
                <div className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-white/60">
                  <p>14 Mayfair Place, London W1</p>
                  <p className="mt-1">hello@bancproperty.co.uk</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Sticky Mobile CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#2C2F33] px-4 py-3 lg:hidden">
        <div className="mx-auto flex max-w-md gap-3">
          <a
            href="tel:01707877781"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/10 py-3 text-sm font-medium text-white active:bg-white/20"
          >
            <Phone className="h-4 w-4" />
            Call Now
          </a>
          <Button 
            className="flex-1 bg-[#1DBFDD] py-3 text-sm font-medium text-white hover:bg-[#0E8CAB]"
          >
            Valuation
          </Button>
        </div>
      </div>

      {/* Spacer for sticky bottom bar */}
      <div className="h-16 lg:hidden" />
    </>
  );
}
