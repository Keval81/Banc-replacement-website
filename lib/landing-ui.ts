import { BANC_CONTACT } from "./banc-contact.ts";
import { isPropertyDetailPath } from "./property-detail-view.ts";

export type LandingVariant = "classic" | "aker";

interface LandingAction {
  label: string;
  href: string;
}

interface HeroAction extends LandingAction {
  eyebrow: "Buy a home" | "Rent a home";
  tone: "primary" | "secondary";
}

interface SocialAction extends LandingAction {
  brand: "facebook" | "instagram";
  iconSrc: string;
  imageLoading: "eager";
}

export interface MobileSocialPresentation {
  surface: "transparent";
  iconSize: 32;
  touchTargetSize: 48;
}

export type MobileContactControlPlacement =
  | "standard"
  | "unified-help";

export type MobileWhatsappPanelPlacement =
  | "above-trigger"
  | "responsive-rail";

// How much room the chat launcher has to leave at the bottom of the page.
// A property page keeps a sticky enquiry bar there until lg.
export type ChatLauncherClearance = "standard" | "clears-sticky-actions";

interface HeroVideo {
  // The poster is the first thing anyone sees, before a byte of video has
  // decoded. It has to be a frame of the clip that actually plays — a stale
  // poster shows the previous cut and then jumps.
  poster: string;
  desktop: {
    src: string;
    width: number;
    height: number;
  };
  mobile: {
    src: string;
    width: number;
    height: number;
    preserveFullComposition: boolean;
  };
}

export interface LandingUi {
  heroActions: readonly HeroAction[];
  heroActionPresentation: "editorial-paired-actions";
  heroVideo: HeroVideo;
  valuationAction: LandingAction;
  phoneAction: LandingAction;
  reviewLogoSurface: "transparent";
  showLandingHeaderLogo: boolean;
  mobileSocialActions: readonly SocialAction[];
  mobileSocialPresentation: MobileSocialPresentation;
  mobileContactLauncher: {
    label: "Help";
    assistantLabel: "Ask Banc Bot";
    assistantAvatar: {
      src: "/images/ai/banc-bot.png";
      alt: "";
    };
    whatsappLabel: "Chat on WhatsApp";
    whatsappHref: string;
  };
  mobileHeroActionPlacement: "centered-action-row";
  showGoogleReview: {
    mobile: boolean;
    desktop: boolean;
  };
  showMobileBottomNavigation: boolean;
}

export interface LandingOverlayPolicy {
  showMobileBottomNavigation: boolean;
  showProactiveChatPrompt: boolean;
  showPushNotificationPrompt: boolean;
  showStandaloneWhatsapp: boolean;
  mobileContactControlPlacement: MobileContactControlPlacement;
  mobileWhatsappPanelPlacement: MobileWhatsappPanelPlacement;
  chatLauncherClearance: ChatLauncherClearance;
}

const sharedActions = {
  heroActions: [
    {
      label: "Sales",
      eyebrow: "Buy a home",
      href: "/sales/properties",
      tone: "primary",
    },
    {
      label: "Lettings",
      eyebrow: "Rent a home",
      href: "/lettings/properties",
      tone: "secondary",
    },
  ],
  heroActionPresentation: "editorial-paired-actions",
  // The film Nitesh asked to change: half of hero-first-day's eight shots
  // featured people. These are the same shots with only the property footage
  // kept — aerials, the houses, the pool at dusk — so nothing on the landing
  // page is a stock family.
  heroVideo: {
    poster: "/videos/hero-properties-poster.jpg",
    desktop: {
      src: "/videos/hero-properties.mp4",
      width: 1440,
      height: 810,
    },
    mobile: {
      src: "/videos/hero-properties-mobile.mp4",
      width: 608,
      height: 1316,
      preserveFullComposition: true,
    },
  },
  valuationAction: {
    label: "Request an instant valuation",
    href: "/valuation",
  },
  phoneAction: {
    label: "Call Banc Property Group",
    href: BANC_CONTACT.callHref,
  },
  mobileSocialPresentation: {
    surface: "transparent",
    iconSize: 32,
    touchTargetSize: 48,
  },
  mobileContactLauncher: {
    label: "Help",
    assistantLabel: "Ask Banc Bot",
    assistantAvatar: {
      src: "/images/ai/banc-bot.png",
      alt: "",
    },
    whatsappLabel: "Chat on WhatsApp",
    whatsappHref: BANC_CONTACT.whatsappHref,
  },
  mobileHeroActionPlacement: "centered-action-row",
} as const;

const landingUiByVariant: Record<LandingVariant, LandingUi> = {
  classic: {
    ...sharedActions,
    reviewLogoSurface: "transparent",
    showLandingHeaderLogo: true,
    mobileSocialActions: [],
    showGoogleReview: { mobile: false, desktop: true },
    showMobileBottomNavigation: false,
  },
  aker: {
    ...sharedActions,
    reviewLogoSurface: "transparent",
    showLandingHeaderLogo: false,
    mobileSocialActions: [
      {
        brand: "facebook",
        label: "Banc Property Group on Facebook",
        href: "https://www.facebook.com/BANCpropertygroup",
        iconSrc: "/icons/social/facebook.svg",
        imageLoading: "eager",
      },
      {
        brand: "instagram",
        label: "Banc Property Group on Instagram",
        href: "https://www.instagram.com/bancproperty",
        iconSrc: "/icons/social/instagram.svg",
        imageLoading: "eager",
      },
    ],
    showGoogleReview: { mobile: false, desktop: true },
    showMobileBottomNavigation: false,
  },
};

export function getLandingUi(variant: LandingVariant): LandingUi {
  return landingUiByVariant[variant];
}

export function getLandingOverlayPolicy(
  pathname: string,
): LandingOverlayPolicy {
  const isLandingPage = pathname === "/";

  // A property page has its own sticky enquiry bar along the bottom, so the
  // floating controls that would sit on top of it stay away. Banc Bot does
  // not: a visitor who followed a listing link out of the chat has to be
  // able to carry on the conversation from where they landed.
  if (isPropertyDetailPath(pathname)) {
    return {
      showMobileBottomNavigation: false,
      showProactiveChatPrompt: false,
      showPushNotificationPrompt: false,
      showStandaloneWhatsapp: false,
      mobileContactControlPlacement: "standard",
      mobileWhatsappPanelPlacement: "above-trigger",
      chatLauncherClearance: "clears-sticky-actions",
    };
  }

  return {
    showMobileBottomNavigation: !isLandingPage,
    showProactiveChatPrompt: !isLandingPage,
    showPushNotificationPrompt: !isLandingPage,
    showStandaloneWhatsapp: !isLandingPage,
    mobileContactControlPlacement: isLandingPage
      ? "unified-help"
      : "standard",
    mobileWhatsappPanelPlacement: "above-trigger",
    chatLauncherClearance: "standard",
  };
}
