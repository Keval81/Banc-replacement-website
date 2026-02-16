"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Sales", href: "#sales" },
  { name: "Lettings", href: "#lettings" },
  { name: "Premier Homes", href: "#premier" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" },
];

const dropdowns = {
  Sales: [
    {
      title: "Sell with Confidence",
      description: "Bespoke marketing, expert pricing, and a full-service sales journey.",
      href: "#sales",
    },
    {
      title: "Book a Valuation",
      description: "Accurate, local market intelligence to guide your next move.",
      href: "#valuation",
    },
  ],
  Lettings: [
    {
      title: "Find the Right Tenant",
      description: "Rigorous vetting and premium presentation for standout homes.",
      href: "#lettings",
    },
    {
      title: "Managed Lettings",
      description: "End-to-end property management with transparent reporting.",
      href: "#management",
    },
  ],
} as const;

export default function Header() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-[#C8C9CB]/50 bg-white/90 backdrop-blur-xl"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" aria-label="Banc Property Group" className="flex items-center">
          <Image
            src="/banc-logo-blue.png"
            alt="Banc Property Group"
            width={280}
            height={80}
            className="h-[72px] w-auto object-contain"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[#2C2F33] font-heading lg:flex">
          {navItems.map((item) => {
            const hasDropdown = item.name === "Sales" || item.name === "Lettings";
            return (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => hasDropdown && setActiveDropdown(item.name)}
                onMouseLeave={() => hasDropdown && setActiveDropdown(null)}
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
                {hasDropdown && (
                  <AnimatePresence>
                    {activeDropdown === item.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 mt-4 w-72 rounded-2xl border border-[#C8C9CB] bg-white p-4 shadow-xl"
                      >
                        <div className="grid gap-4">
                          {dropdowns[item.name as keyof typeof dropdowns].map((link) => (
                            <Link
                              key={link.title}
                              href={link.href}
                              className="rounded-lg p-3 transition-colors hover:bg-[#F0F0ED]"
                            >
                              <p className="text-sm font-semibold text-[#2C2F33] font-heading">
                                {link.title}
                              </p>
                              <p className="text-xs text-[#6B6E72]">
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
          <Button size="lg">Request Valuation</Button>
        </div>

        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-full border border-[#C8C9CB] p-2 text-[#2C2F33] lg:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-[#C8C9CB] bg-white lg:hidden"
          >
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-base font-medium text-[#2C2F33] font-heading"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Button className="w-full">Request Valuation</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
