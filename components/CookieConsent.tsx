"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cookie, ChevronDown, ChevronUp, Shield, BarChart3, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCookies } from "@/hooks/useCookies";

export default function CookieConsent() {
  const { hasConsented, acceptAll, rejectAll, updatePreferences, preferences } = useCookies();
  const [showDetails, setShowDetails] = useState(false);
  const [localPrefs, setLocalPrefs] = useState(preferences);

  // Don't show if user has already consented
  if (hasConsented) return null;

  const handleSavePreferences = () => {
    updatePreferences(localPrefs);
  };

  const togglePreference = (key: keyof typeof localPrefs) => {
    if (key === "essential") return; // Can't toggle essential
    setLocalPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AnimatePresence>
      {!hasConsented && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
            {/* Header */}
            <div className="flex items-start gap-4 p-6">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#1DBFDD]/10">
                <Cookie className="h-6 w-6 text-[#1DBFDD]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#2C2F33]">
                  We value your privacy
                </h3>
                <p className="mt-1 text-sm text-[#6B6E72]">
                  We use cookies to enhance your browsing experience, serve personalised content, and analyse our traffic. 
                  By clicking &ldquo;Accept All&rdquo;, you consent to our use of cookies. 
                  <a href="/cookies" className="ml-1 text-[#1DBFDD] hover:underline">
                    Learn more
                  </a>
                </p>
              </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden border-t border-[#E5E5E5]"
                >
                  <div className="space-y-4 p-6 pt-4">
                    {/* Essential Cookies */}
                    <div className="flex items-start gap-4 rounded-xl bg-[#F0F0ED] p-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#2C2F33]">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-[#2C2F33]">Essential Cookies</h4>
                          <span className="rounded-full bg-[#2C2F33] px-3 py-1 text-xs font-medium text-white">
                            Always On
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-[#6B6E72]">
                          These cookies are necessary for the website to function and cannot be switched off. 
                          They are usually only set in response to actions you make such as logging in or filling in forms.
                        </p>
                      </div>
                    </div>

                    {/* Analytics Cookies */}
                    <div className="flex items-start gap-4 rounded-xl border border-[#E5E5E5] p-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#1DBFDD]/10">
                        <BarChart3 className="h-5 w-5 text-[#1DBFDD]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-[#2C2F33]">Analytics Cookies</h4>
                          <button
                            onClick={() => togglePreference("analytics")}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              localPrefs.analytics ? "bg-[#1DBFDD]" : "bg-[#C8C9CB]"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                localPrefs.analytics ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                        <p className="mt-1 text-sm text-[#6B6E72]">
                          These cookies allow us to count visits and traffic sources so we can measure and improve the 
                          performance of our site. They help us know which pages are the most and least popular.
                        </p>
                      </div>
                    </div>

                    {/* Marketing Cookies */}
                    <div className="flex items-start gap-4 rounded-xl border border-[#E5E5E5] p-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#1DBFDD]/10">
                        <Megaphone className="h-5 w-5 text-[#1DBFDD]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-[#2C2F33]">Marketing Cookies</h4>
                          <button
                            onClick={() => togglePreference("marketing")}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              localPrefs.marketing ? "bg-[#1DBFDD]" : "bg-[#C8C9CB]"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                localPrefs.marketing ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                        <p className="mt-1 text-sm text-[#6B6E72]">
                          These cookies may be set through our site by our advertising partners. They may be used by 
                          those companies to build a profile of your interests and show you relevant adverts.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E5E5E5] p-4">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1 text-sm font-medium text-[#6B6E72] hover:text-[#2C2F33]"
              >
                {showDetails ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Manage Preferences
                  </>
                )}
              </button>

              <div className="flex flex-wrap items-center gap-3">
                {showDetails ? (
                  <Button
                    onClick={handleSavePreferences}
                    className="bg-[#1DBFDD] text-white hover:bg-[#0E8CAB]"
                  >
                    Save Preferences
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={rejectAll}
                      className="border-[#C8C9CB] text-[#6B6E72] hover:bg-[#F0F0ED] hover:text-[#2C2F33]"
                    >
                      Reject All
                    </Button>
                    <Button
                      onClick={acceptAll}
                      className="bg-[#2C2F33] text-white hover:bg-[#1DBFDD]"
                    >
                      Accept All
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
