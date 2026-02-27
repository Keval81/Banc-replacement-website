"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type CookieCategory = "essential" | "analytics" | "marketing";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface CookieContextType {
  preferences: CookiePreferences;
  hasConsented: boolean;
  updatePreferences: (prefs: Partial<CookiePreferences>) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  resetConsent: () => void;
  isCategoryAllowed: (category: CookieCategory) => boolean;
}

const defaultPreferences: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
};

const CookieContext = createContext<CookieContextType | undefined>(undefined);

const COOKIE_CONSENT_KEY = "banc-cookie-consent";
const COOKIE_PREFERENCES_KEY = "banc-cookie-preferences";

export function CookieProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [hasConsented, setHasConsented] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
      const storedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);

      if (storedConsent) {
        setHasConsented(JSON.parse(storedConsent));
      }

      if (storedPrefs) {
        const parsed = JSON.parse(storedPrefs);
        setPreferences({
          ...defaultPreferences,
          ...parsed,
          essential: true,
        });
      }
    } catch (error) {
      console.error("Error loading cookie preferences:", error);
    }
    setIsLoaded(true);
  }, []);

  const savePreferences = (prefs: CookiePreferences, consented: boolean) => {
    try {
      localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consented));
      document.cookie = `${COOKIE_PREFERENCES_KEY}=${JSON.stringify(prefs)}; path=/; max-age=${60 * 60 * 24 * 365}`;
    } catch (error) {
      console.error("Error saving cookie preferences:", error);
    }
  };

  const updatePreferences = (prefs: Partial<CookiePreferences>) => {
    const newPrefs = { ...preferences, ...prefs, essential: true };
    setPreferences(newPrefs);
    setHasConsented(true);
    savePreferences(newPrefs, true);
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    setHasConsented(true);
    savePreferences(allAccepted, true);
  };

  const rejectAll = () => {
    const onlyEssential: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(onlyEssential);
    setHasConsented(true);
    savePreferences(onlyEssential, true);
  };

  const resetConsent = () => {
    setHasConsented(false);
    setPreferences(defaultPreferences);
    try {
      localStorage.removeItem(COOKIE_CONSENT_KEY);
      localStorage.removeItem(COOKIE_PREFERENCES_KEY);
      document.cookie = `${COOKIE_PREFERENCES_KEY}=; path=/; max-age=0`;
    } catch (error) {
      console.error("Error resetting consent:", error);
    }
  };

  const isCategoryAllowed = (category: CookieCategory): boolean => {
    return preferences[category] === true;
  };

  return (
    <CookieContext.Provider
      value={{
        preferences,
        hasConsented: isLoaded ? hasConsented : true,
        updatePreferences,
        acceptAll,
        rejectAll,
        resetConsent,
        isCategoryAllowed,
      }}
    >
      {children}
    </CookieContext.Provider>
  );
}

export function useCookies() {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error("useCookies must be used within a CookieProvider");
  }
  return context;
}

export function useAnalytics() {
  const { isCategoryAllowed } = useCookies();
  return {
    isAllowed: isCategoryAllowed("analytics"),
  };
}

export function useMarketing() {
  const { isCategoryAllowed } = useCookies();
  return {
    isAllowed: isCategoryAllowed("marketing"),
  };
}
