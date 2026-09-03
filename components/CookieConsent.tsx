"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, ChevronDown, ChevronUp, Shield, BarChart3, Megaphone } from "lucide-react";
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
          className="fixed bottom-0 left-0 right-0 z-50 max-h-[100dvh] overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pl-[calc(env(safe-area-inset-left)+0.75rem)] pr-[calc(env(safe-area-inset-right)+0.75rem)] pt-3 md:pb-[calc(env(safe-area-inset-bottom)+1.5rem)] md:pl-[calc(env(safe-area-inset-left)+1.5rem)] md:pr-[calc(env(safe-area-inset-right)+1.5rem)] md:pt-[calc(env(safe-area-inset-top)+1.5rem)]"
        >
          <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
            {/* Header */}
            <div className="flex items-start gap-3 p-4 sm:p-5">
              <div className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-banc-sky/10 sm:flex">
                <Cookie className="h-5 w-5 text-banc-focus" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-banc-dark-deep sm:text-lg">
                  We value your privacy
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-banc-muted-readable">
                  We use cookies to improve your experience and understand how the website is used.
                  <a href="/cookies" className="ml-1 text-banc-focus hover:underline">
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
                    <div className="flex items-start gap-4 rounded-xl bg-banc-grey-pale p-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-banc-dark-deep">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-banc-dark-deep">Essential Cookies</h4>
                          <span className="rounded-full bg-banc-dark-deep px-3 py-1 text-xs font-medium text-white">
                            Always On
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-banc-muted-readable">
                          These cookies are necessary for the website to function and cannot be switched off. 
                          They are usually only set in response to actions you make such as logging in or filling in forms.
                        </p>
                      </div>
                    </div>

                    {/* Analytics Cookies */}
                    <div className="flex items-start gap-4 rounded-xl border border-[#E5E5E5] p-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-banc-sky/10">
                        <BarChart3 className="h-5 w-5 text-banc-focus" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-banc-dark-deep">Analytics Cookies</h4>
                          <button
                            onClick={() => togglePreference("analytics")}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              localPrefs.analytics ? "bg-banc-sky" : "bg-banc-line"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                localPrefs.analytics ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                        <p className="mt-1 text-sm text-banc-muted-readable">
                          These cookies allow us to count visits and traffic sources so we can measure and improve the 
                          performance of our site. They help us know which pages are the most and least popular.
                        </p>
                      </div>
                    </div>

                    {/* Marketing Cookies */}
                    <div className="flex items-start gap-4 rounded-xl border border-[#E5E5E5] p-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-banc-sky/10">
                        <Megaphone className="h-5 w-5 text-banc-focus" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-banc-dark-deep">Marketing Cookies</h4>
                          <button
                            onClick={() => togglePreference("marketing")}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              localPrefs.marketing ? "bg-banc-sky" : "bg-banc-line"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                localPrefs.marketing ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                        <p className="mt-1 text-sm text-banc-muted-readable">
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
            <div
              className={
                showDetails
                  ? "flex flex-col gap-2 border-t border-[#E5E5E5] p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4"
                  : "grid grid-cols-[auto_1fr] items-center gap-2 border-t border-[#E5E5E5] p-3 sm:flex sm:justify-between sm:gap-4 sm:p-4"
              }
            >
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex min-h-11 cursor-pointer items-center gap-1 text-sm font-medium text-banc-muted-readable hover:text-banc-dark-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-sky"
              >
                {showDetails ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    <span className="sm:hidden">Settings</span>
                    <span className="hidden sm:inline">Manage Preferences</span>
                  </>
                )}
              </button>

              <div className={showDetails ? "w-full sm:w-auto" : "grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center"}>
                {showDetails ? (
                  <Button
                    onClick={handleSavePreferences}
                    className="min-h-11 w-full bg-banc-sky text-banc-dark hover:bg-banc-sky-mid sm:w-auto"
                  >
                    Save Preferences
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={rejectAll}
                      className="min-h-11 border-banc-line text-banc-muted-readable hover:bg-banc-grey-pale hover:text-banc-dark-deep"
                    >
                      Reject All
                    </Button>
                    <Button
                      onClick={acceptAll}
                      className="min-h-11 bg-banc-dark-deep text-white hover:bg-banc-dark"
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
