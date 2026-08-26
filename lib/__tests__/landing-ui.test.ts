import assert from "node:assert/strict";
import test from "node:test";

import { getLandingOverlayPolicy, getLandingUi } from "../landing-ui.ts";

test("keeps both landing variants focused on sales and lettings", () => {
  for (const variant of ["classic", "aker"] as const) {
    const ui = getLandingUi(variant);

    assert.deepEqual(ui.heroActions, [
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
    ]);
  }
});

test("keeps the valuation and labelled phone actions available outside the hero", () => {
  const ui = getLandingUi("aker");

  assert.deepEqual(ui.valuationAction, {
    label: "Request a valuation",
    href: "/valuation",
  });
  assert.deepEqual(ui.phoneAction, {
    label: "Call Banc Property Group",
    href: "tel:01707877781",
  });
});

test("uses social actions instead of a duplicate logo in the Aker mobile header", () => {
  const ui = getLandingUi("aker");

  assert.equal(ui.showLandingHeaderLogo, false);
  assert.deepEqual(ui.mobileSocialActions, [
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
  ]);
});

test("presents Aker mobile social links as prominent icons on a clear surface", () => {
  const ui = getLandingUi("aker");

  assert.deepEqual(ui.mobileSocialPresentation, {
    surface: "transparent",
    iconSize: 32,
    touchTargetSize: 48,
  });
});

test("places mobile property actions in the lower-right action rail", () => {
  const ui = getLandingUi("aker");

  assert.equal(ui.mobileHeroActionPlacement, "lower-right-action-rail");
});

test("keeps the Google wordmark on a transparent review surface", () => {
  for (const variant of ["classic", "aker"] as const) {
    assert.equal(getLandingUi(variant).reviewLogoSurface, "transparent");
  }
});

test("uses a full-composition mobile film that does not crop a tall phone viewport", () => {
  for (const variant of ["classic", "aker"] as const) {
    const ui = getLandingUi(variant);
    assert.ok(ui.heroVideo, "landing UI must define mobile film framing");
    const mobileVideo = ui.heroVideo.mobile;

    assert.equal(mobileVideo.src, "/videos/hero-first-day-mobile-safe.mp4");
    assert.equal(mobileVideo.preserveFullComposition, true);
    assert.ok(
      mobileVideo.width / mobileVideo.height <= 390 / 844,
      "mobile film must be at least as tall as the target phone viewport",
    );
  }
});

test("keeps reviews desktop-only and removes the redundant mobile bottom navigation", () => {
  for (const variant of ["classic", "aker"] as const) {
    const ui = getLandingUi(variant);

    assert.deepEqual(ui.showGoogleReview, { mobile: false, desktop: true });
    assert.equal(ui.showMobileBottomNavigation, false);
  }
});

test("keeps automated overlays clear of the landing-page brand lockup", () => {
  assert.deepEqual(getLandingOverlayPolicy("/"), {
    showMobileBottomNavigation: false,
    showProactiveChatPrompt: false,
    mobileContactControlPlacement: "right-action-rail",
  });
});

test("keeps mobile navigation and proactive chat available on regular pages", () => {
  assert.deepEqual(getLandingOverlayPolicy("/sales/properties"), {
    showMobileBottomNavigation: true,
    showProactiveChatPrompt: true,
    mobileContactControlPlacement: "standard",
  });
});
