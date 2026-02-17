"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
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
    {
      title: "Our Properties",
      description: "Browse our portfolio of premium properties for sale.",
      href: "/sales/properties",
    },
    {
      title: "Buyers Guide",
      description: "Everything you need to know about buying a property.",
      href: "/sales/buyers-guide",
    },
    {
      title: "Sellers Guide",
      description: "Expert advice on preparing and selling your home.",
      href: "/sales/sellers-guide",
    },
  ],
  Lettings: [
    {
      title: "Rental Properties",
      description: "Browse our available properties to rent.",
      href: "/lettings/properties",
    },
    {
      title: "Tenants Guide",
      description: "Everything tenants need to know about renting.",
      href: "/lettings/tenants-guide",
    },
    {
      title: "Landlords Guide",
      description: "Expert advice for landlords on letting your property.",
      href: "/lettings/landlords-guide",
    },
  ],
  About: [
    {
      title: "Why Us",
      description: "Discover what makes Banc Property Group different.",
      href: "/why-us",
    },
    {
      title: "Our Team",
      description: "Meet the dedicated team behind our success.",
      href: "/the-team",
    },
    {
      title: "Track Record",
      description: "See our impressive results and statistics.",
      href: "/track-record",
    },
    {
      title: "The Guild",
      description: "Learn about our national network membership.",
      href: "/the-guild",
    },
  ],
} as const;

export default function Header() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 border-b border-white/10 bg-[#2C2F33] backdrop-blur-xl"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" aria-label="Banc Property Group" className="flex items-center">
          <Image
            src="/banc-logo-blue.png"
            alt="Banc Property Group"
            width={350}
            height={105}
            className="h-[84px] w-auto object-contain"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-white font-heading lg:flex">
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
                    "flex items-center gap-1 transition-colors hover:text-[#4DD4F0]",
                    activeDropdown === item.name && "text-[#4DD4F0]"
                  )}
                >
                  {item.name}
                  {hasDropdown && <ChevronDown className="h-4 w-4" />}
                </Link>
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
                        <div className="grid gap-4">
                          {dropdowns[item.name as keyof typeof dropdowns].map((link) => (
                            <Link
                              key={link.title}
                              href={link.href}
                              className="rounded-lg p-3 transition-colors hover:bg-[#0E8CAB]"
                            >
                              <p className="text-sm font-semibold text-white font-heading">
                                {link.title}
                              </p>
                              <p className="text-xs text-white/70">
                                {link.description}
                              </p>
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

        <div className="hidden items-center gap-4 lg:flex">
          <Button className="bg-white text-[#2C2F33] hover:bg-[#1DBFDD] hover:text-white">Request Valuation</Button>
        </div>

        <button
          className="rounded-full border border-white/20 p-2 text-white lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10 bg-[#2C2F33] lg:hidden"
          >
            <nav className="flex flex-col gap-4 p-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-base font-medium text-white hover:text-[#4DD4F0]"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Button className="mt-4 w-full bg-white text-[#2C2F33] hover:bg-[#1DBFDD] hover:text-white">
                Request Valuation
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
