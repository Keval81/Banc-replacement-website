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
  | "right-action-rail";

interface HeroVideo {
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
  heroVideo: HeroVideo;
  valuationAction: LandingAction;
  phoneAction: LandingAction;
  reviewLogoSurface: "transparent";
  showLandingHeaderLogo: boolean;
  mobileSocialActions: readonly SocialAction[];
  mobileSocialPresentation: MobileSocialPresentation;
  mobileHeroActionPlacement: "lower-right-action-rail";
  showGoogleReview: {
    mobile: boolean;
    desktop: boolean;
  };
  showMobileBottomNavigation: boolean;
}

export interface LandingOverlayPolicy {
  showMobileBottomNavigation: boolean;
  showProactiveChatPrompt: boolean;
  mobileContactControlPlacement: MobileContactControlPlacement;
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
  heroVideo: {
    desktop: {
      src: "/videos/hero-first-day.mp4",
      width: 1440,
      height: 810,
    },
    mobile: {
      src: "/videos/hero-first-day-mobile-safe.mp4",
      width: 608,
      height: 1316,
      preserveFullComposition: true,
    },
  },
  valuationAction: {
    label: "Request a valuation",
    href: "/valuation",
  },
  phoneAction: {
    label: "Call Banc Property Group",
    href: "tel:01707877781",
  },
  mobileSocialPresentation: {
    surface: "transparent",
    iconSize: 32,
    touchTargetSize: 48,
  },
  mobileHeroActionPlacement: "lower-right-action-rail",
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
        href: "https://www.facebook.com/bancproperty",
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

  return {
    showMobileBottomNavigation: !isLandingPage,
    showProactiveChatPrompt: !isLandingPage,
    mobileContactControlPlacement: isLandingPage
      ? "right-action-rail"
      : "standard",
  };
}
