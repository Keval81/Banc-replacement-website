"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Facebook, Instagram, Phone, User, Heart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getLandingUi } from "@/lib/landing-ui";
import { useSession, signOut } from "next-auth/react";

const landingUi = getLandingUi("aker");

const navItems = [
  { name: "Sales", href: "/sales" },
  { name: "Lettings", href: "/lettings" },
  { name: "About", href: "/why-us" },
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

const mobileAdditionalLinks = [
  { title: "Premier Homes", href: "/premier-homes" },
  { title: "Reviews", href: "/reviews" },
  { title: "Land & New Homes", href: "/land-new-homes" },
  { title: "Become a Partner", href: "/become-partner" },
];

export default function Header({ transparent = false }: { transparent?: boolean } = {}) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = React.useState<string | null>(null);

  // Lock body scroll when mobile menu is open
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    
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
    
    return () => {
      const scrollY = document.body.dataset.scrollY || '0';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0'));
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "safe-area-header fixed left-0 right-0 top-0 z-50",
          transparent
            ? "bg-transparent"
            : "banc-dark-surface border-b border-white/10 bg-banc-dark-deep backdrop-blur-none"
        )}
      >
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 lg:h-[72px] lg:px-8">
          {/* Logo (hidden on the transparent hero header — the hero carries the lockup) */}
          {transparent && !landingUi.showLandingHeaderLogo ? (
            <div className="flex items-center gap-1 lg:hidden" aria-label="Banc Property Group social media">
              {landingUi.mobileSocialActions.map((action) => {
                const SocialIcon = action.brand === "facebook" ? Facebook : Instagram;

                return (
                  <a
                    key={action.brand}
                    href={action.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={action.label}
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-white transition-colors duration-200 hover:bg-white/10 hover:text-banc-sky-mid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-sky"
                  >
                    <SocialIcon className="h-5 w-5" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          ) : (
            <Link href="/" aria-label="Banc Property Group" className="flex items-center">
              <Image
                src="/banc-logo-blue.png"
                alt="Banc Property Group"
                width={200}
                height={60}
                className="h-8 w-auto object-contain lg:h-12"
                priority
              />
            </Link>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 text-sm font-medium text-white/90 lg:flex">
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
                      "flex items-center gap-1 py-2 transition-colors hover:text-banc-sky",
                      activeDropdown === item.name && "text-banc-sky"
                    )}
                  >
                    {item.name}
                    {hasDropdown && <ChevronDown className="h-3.5 w-3.5" />}
                  </Link>
                  
                  {/* Desktop Dropdown */}
                  {hasDropdown && (
                    <AnimatePresence>
                      {activeDropdown === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="absolute left-0 top-full mt-2 w-60 rounded-xl border border-white/10 bg-banc-dark-deep p-2 shadow-2xl z-50 overflow-hidden"
                          style={{ transformOrigin: "top left" }}
                        >
                          {dropdowns[item.name as keyof typeof dropdowns].map((link, index) => (
                            <Link
                              key={link.title}
                              href={link.href}
                              className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-white/80 transition-all duration-200 hover:bg-banc-sky/10 hover:text-white min-h-[44px]"
                              style={{ animationDelay: `${index * 25}ms` }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-banc-sky opacity-0 group-hover:opacity-100 transition-opacity" />
                              {link.title}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 lg:flex">
            {/* Phone */}
            <a
              href={landingUi.phoneAction.href}
              aria-label={landingUi.phoneAction.label}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-banc-sky transition-colors duration-200 hover:bg-white/5 hover:text-banc-sky-mid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-sky"
            >
              <Phone className="h-5 w-5" aria-hidden="true" />
            </a>
            
            {/* Favorites */}
            <Link 
              href="/favorites" 
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:text-banc-sky transition-colors"
              aria-label="Favorites"
            >
              <Heart className="h-5 w-5" />
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href="/account">
                  <Button variant="ghost" size="sm" className="text-white/80 hover:bg-white/5 hover:text-white">
                    <User className="mr-2 h-4 w-4" />
                    {session.user?.name?.split(" ")[0] || "Account"}
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-white/60 hover:bg-white/5 hover:text-red-400"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-white/80 hover:bg-white/5 hover:text-white">
                  <User className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}

            {/* CTA */}
            <Link href={landingUi.valuationAction.href}>
              <Button size="sm" className="bg-banc-sky text-banc-dark hover:bg-banc-sky-mid">
                {landingUi.valuationAction.label}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white active:bg-white/10 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="banc-dark-surface safe-area-drawer fixed bottom-0 right-0 top-0 z-50 flex w-[85%] max-w-[340px] flex-col bg-banc-dark-deep shadow-2xl lg:hidden"
            >
              {/* Mobile Header */}
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4">
                <span className="text-lg font-semibold text-white">Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-white/70"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-24">
                <div className="my-4 flex items-center gap-2">
                  <Link
                    href={landingUi.valuationAction.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex-1"
                  >
                    <Button className="h-11 w-full bg-banc-sky text-sm text-banc-dark hover:bg-banc-sky-mid">
                      {landingUi.valuationAction.label}
                    </Button>
                  </Link>
                  <a
                    href={landingUi.phoneAction.href}
                    aria-label={landingUi.phoneAction.label}
                    className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-banc-sky/40 text-banc-sky transition-colors duration-200 hover:border-banc-sky hover:bg-banc-sky/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-sky"
                  >
                    <Phone className="h-5 w-5" aria-hidden="true" />
                  </a>
                </div>

                {/* Mobile Auth */}
                {isAuthenticated ? (
                  <div className="my-4 flex items-center gap-3">
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        width={40}
                        height={40}
                        unoptimized
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-banc-sky/20">
                        <User className="h-5 w-5 text-banc-sky" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-white">{session.user?.name}</p>
                      <button 
                        onClick={() => signOut()}
                        className="text-xs text-white/50 hover:text-white"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="my-4 flex gap-2">
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1">
                      <Button variant="outline" className="w-full border-white/20 bg-transparent text-white hover:bg-white/5">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1">
                      <Button className="w-full bg-banc-sky text-banc-dark hover:bg-banc-sky-mid">
                        Register
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Mobile Nav */}
                <nav className="flex flex-col">
                  {navItems.map((item) => {
                    const hasDropdown = item.name in dropdowns;
                    const isExpanded = mobileExpanded === item.name;
                    
                    return (
                      <div key={item.name} className="border-b border-white/10">
                        <div className="flex items-center justify-between">
                          <Link
                            href={item.href}
                            className="flex-1 py-4 text-base text-white font-medium min-h-[56px] flex items-center"
                            onClick={() => !hasDropdown && setMobileOpen(false)}
                          >
                            {item.name}
                          </Link>
                          {hasDropdown && (
                            <button
                              onClick={() => setMobileExpanded(isExpanded ? null : item.name)}
                              className="flex h-11 w-11 items-center justify-center rounded-lg text-white/60 hover:bg-white/5 active:bg-white/10 transition-colors"
                              aria-label={isExpanded ? "Collapse menu" : "Expand menu"}
                            >
                              <ChevronDown 
                                className={cn(
                                  "h-5 w-5 transition-transform duration-200",
                                  isExpanded && "rotate-180"
                                )} 
                              />
                            </button>
                          )}
                        </div>
                        
                        {hasDropdown && isExpanded && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pb-3 pl-4 overflow-hidden"
                          >
                            {dropdowns[item.name as keyof typeof dropdowns].map((link, index) => (
                              <Link
                                key={link.title}
                                href={link.href}
                                className="flex items-center gap-3 py-3.5 text-sm text-white/70 hover:text-white transition-colors min-h-[48px]"
                                onClick={() => setMobileOpen(false)}
                                style={{ animationDelay: `${index * 50}ms` }}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-banc-sky" />
                                {link.title}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Additional Links */}
                  {mobileAdditionalLinks.map((link) => (
                    <Link
                      key={link.title}
                      href={link.href}
                      className="border-b border-white/10 py-3.5 text-base text-white/80"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.title}
                    </Link>
                  ))}
                </nav>

                {/* Address */}
                <div className="mt-6 border-t border-white/10 pt-6 text-center text-xs text-white/40">
                  <p>1 Station Road, Cuffley, EN6 4HU</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header Spacer */}
      {/* Spacer only when the header has a bar — transparent mode floats over the hero */}
      {!transparent && <div className="safe-area-header-spacer bg-banc-dark-deep" />}
    </>
  );
}
