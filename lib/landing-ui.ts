export type LandingVariant = "classic" | "aker";

interface LandingAction {
  label: string;
  href: string;
}

interface SocialAction extends LandingAction {
  brand: "facebook" | "instagram";
}

export interface LandingUi {
  heroActions: readonly LandingAction[];
  valuationAction: LandingAction;
  phoneAction: LandingAction;
  showLandingHeaderLogo: boolean;
  mobileSocialActions: readonly SocialAction[];
  showGoogleReview: {
    mobile: boolean;
    desktop: boolean;
  };
  showMobileBottomNavigation: boolean;
}

const sharedActions = {
  heroActions: [
    { label: "Sales", href: "/sales/properties" },
    { label: "Lettings", href: "/lettings/properties" },
  ],
  valuationAction: {
    label: "Request a valuation",
    href: "/valuation",
  },
  phoneAction: {
    label: "Call Banc Property Group",
    href: "tel:01707877781",
  },
} as const;

const landingUiByVariant: Record<LandingVariant, LandingUi> = {
  classic: {
    ...sharedActions,
    showLandingHeaderLogo: true,
    mobileSocialActions: [],
    showGoogleReview: { mobile: false, desktop: true },
    showMobileBottomNavigation: false,
  },
  aker: {
    ...sharedActions,
    showLandingHeaderLogo: false,
    mobileSocialActions: [
      {
        brand: "facebook",
        label: "Banc Property Group on Facebook",
        href: "https://www.facebook.com/bancproperty",
      },
      {
        brand: "instagram",
        label: "Banc Property Group on Instagram",
        href: "https://www.instagram.com/bancproperty",
      },
    ],
    showGoogleReview: { mobile: false, desktop: true },
    showMobileBottomNavigation: false,
  },
};

export function getLandingUi(variant: LandingVariant): LandingUi {
  return landingUiByVariant[variant];
}
