"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Phone, User, Heart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SocialIconLink } from "@/components/ui/social-icon";
import { cn } from "@/lib/utils";
import { getLandingUi } from "@/lib/landing-ui";
import { BANC_PHONE_LINES } from "@/lib/banc-contact";
import {
  MODAL_FOCUSABLE_SELECTOR,
  startModalFocusLifecycle,
} from "@/lib/property-search/modal-focus-lifecycle";
import { useSession, signOut } from "next-auth/react";

const MOBILE_MENU_ID = "banc-mobile-menu";
const PHONE_MENU_ID = "banc-phone-menu";

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
    { title: "Community", href: "/community" },
    { title: "Blog", href: "/blog" },
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
  const [phoneMenuOpen, setPhoneMenuOpen] = React.useState(false);
  const mobileMenuRef = React.useRef<HTMLDivElement>(null);
  const mobileToggleRef = React.useRef<HTMLButtonElement>(null);
  const phoneMenuRef = React.useRef<HTMLDivElement>(null);

  // Escape or a click outside dismisses the area-phone menu.
  React.useEffect(() => {
    if (!phoneMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPhoneMenuOpen(false);
    };
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Node && phoneMenuRef.current?.contains(target)) return;
      setPhoneMenuOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [phoneMenuOpen]);

  // Escape closes the mobile menu, Tab stays inside it, and focus returns to
  // the toggle on close (same lifecycle as the filter drawer and chatbot).
  React.useEffect(() => {
    if (!mobileOpen) return;

    const getFocusableElements = () =>
      Array.from(
        mobileMenuRef.current?.querySelectorAll<HTMLElement>(MODAL_FOCUSABLE_SELECTOR) ?? [],
      );
    return startModalFocusLifecycle({
      getActiveElement: () => document.activeElement,
      getBodyOverflow: () => document.body.style.overflow,
      setBodyOverflow: (value) => { document.body.style.overflow = value; },
      getFocusableElements,
      containerContains: (element) =>
        element instanceof Node && Boolean(mobileMenuRef.current?.contains(element)),
      addKeydownListener: (listener) =>
        document.addEventListener("keydown", listener as (event: KeyboardEvent) => void),
      removeKeydownListener: (listener) =>
        document.removeEventListener("keydown", listener as (event: KeyboardEvent) => void),
      requestFrame: (callback) => requestAnimationFrame(callback),
      cancelFrame: (frame) => cancelAnimationFrame(frame as number),
      onClose: () => setMobileOpen(false),
      restoreFocus: () => mobileToggleRef.current?.focus(),
    });
  }, [mobileOpen]);

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
          {/* Brand lockup in Banc blue, on every header including the
              transparent one over the hero film. On mobile the landing
              header keeps its social icons beside the lockup. */}
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" aria-label="Banc Property Group" className="flex shrink-0 items-center">
              <Image
                src="/banc-logo-blue.png"
                alt="Banc Property Group"
                width={200}
                height={60}
                className={cn(
                  "h-8 w-auto object-contain lg:h-12",
                  transparent && "drop-shadow-[0_1px_6px_rgba(0,0,0,0.55)]"
                )}
                priority
              />
            </Link>
            {transparent && landingUi.mobileSocialActions.length > 0 && (
              <div
                className="flex items-center gap-1 lg:hidden"
                aria-label="Banc Property Group social media"
              >
                {landingUi.mobileSocialActions.map((action) => (
                  <SocialIconLink
                    key={action.brand}
                    href={action.href}
                    label={action.label}
                    iconSrc={action.iconSrc}
                    imageLoading={action.imageLoading}
                    presentation={landingUi.mobileSocialPresentation}
                  />
                ))}
              </div>
            )}
          </div>

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
                    {hasDropdown && <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />}
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
            {/* Phone — one line per area */}
            <div className="relative" ref={phoneMenuRef}>
              <button
                type="button"
                onClick={() => setPhoneMenuOpen((open) => !open)}
                aria-label={landingUi.phoneAction.label}
                aria-haspopup="menu"
                aria-expanded={phoneMenuOpen}
                aria-controls={PHONE_MENU_ID}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-banc-sky transition-colors duration-200 hover:bg-white/5 hover:text-banc-sky-mid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-sky"
              >
                <Phone className="h-5 w-5" aria-hidden="true" />
              </button>

              <AnimatePresence>
                {phoneMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    id={PHONE_MENU_ID}
                    role="menu"
                    aria-label="Call a Banc office"
                    className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-banc-dark-deep p-2 shadow-2xl"
                    style={{ transformOrigin: "top right" }}
                  >
                    {BANC_PHONE_LINES.map((line) => (
                      <a
                        key={line.area}
                        role="menuitem"
                        href={line.callHref}
                        onClick={() => setPhoneMenuOpen(false)}
                        className="flex min-h-[44px] flex-col justify-center rounded-lg px-4 py-2 transition-colors duration-200 hover:bg-banc-sky/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-sky"
                      >
                        <span className="text-sm font-medium text-white">{line.area}</span>
                        <span className="text-xs text-white/60">{line.displayPhone}</span>
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Favorites */}
            <Link 
              href="/favorites" 
              className="flex h-11 w-11 items-center justify-center rounded-full text-white/70 hover:text-banc-sky transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2 focus-visible:ring-offset-banc-dark-deep"
              aria-label="Favorites"
            >
              <Heart className="h-5 w-5" aria-hidden="true" />
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
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
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
            ref={mobileToggleRef}
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] border border-white/10 bg-white/5 text-white active:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2 focus-visible:ring-offset-banc-dark-deep lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls={MOBILE_MENU_ID}
            aria-haspopup="dialog"
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
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
              aria-hidden="true"
            />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              ref={mobileMenuRef}
              id={MOBILE_MENU_ID}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`${MOBILE_MENU_ID}-title`}
              className="banc-dark-surface safe-area-drawer fixed bottom-0 right-0 top-0 z-50 flex w-[85%] max-w-[340px] flex-col bg-banc-dark-deep shadow-2xl lg:hidden"
            >
              {/* Mobile Header */}
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4">
                <span id={`${MOBILE_MENU_ID}-title`} className="text-lg font-semibold text-white">Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2 focus-visible:ring-offset-banc-dark-deep"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
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
                </div>

                {/* Area phone lines — a drawer has room to list them outright */}
                <ul className="my-4 space-y-2" aria-label="Call a Banc office">
                  {BANC_PHONE_LINES.map((line) => (
                    <li key={line.area}>
                      <a
                        href={line.callHref}
                        className="flex min-h-11 items-center gap-3 rounded-lg border border-banc-sky/40 px-3 py-2 text-banc-sky transition-colors duration-200 hover:border-banc-sky hover:bg-banc-sky/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-sky"
                      >
                        <Phone className="h-5 w-5 shrink-0" aria-hidden="true" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-white">{line.area}</span>
                          <span className="block text-xs text-white/60">{line.displayPhone}</span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>

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
                        type="button"
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
                              type="button"
                              onClick={() => setMobileExpanded(isExpanded ? null : item.name)}
                              className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] text-white/60 hover:bg-white/5 active:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2 focus-visible:ring-offset-banc-dark-deep"
                              aria-label={isExpanded ? `Collapse ${item.name} menu` : `Expand ${item.name} menu`}
                              aria-expanded={isExpanded}
                              aria-controls={`${MOBILE_MENU_ID}-${item.name.toLowerCase()}`}
                            >
                              <ChevronDown 
                                aria-hidden="true"
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
                            id={`${MOBILE_MENU_ID}-${item.name.toLowerCase()}`}
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
