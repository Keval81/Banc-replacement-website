import assert from "node:assert/strict";
import test from "node:test";

import { getLandingUi } from "../landing-ui.ts";

test("keeps both landing variants focused on sales and lettings", () => {
  for (const variant of ["classic", "aker"] as const) {
    const ui = getLandingUi(variant);

    assert.deepEqual(ui.heroActions, [
      { label: "Sales", href: "/sales/properties" },
      { label: "Lettings", href: "/lettings/properties" },
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
    },
    {
      brand: "instagram",
      label: "Banc Property Group on Instagram",
      href: "https://www.instagram.com/bancproperty",
    },
  ]);
});

test("keeps reviews desktop-only and removes the redundant mobile bottom navigation", () => {
  for (const variant of ["classic", "aker"] as const) {
    const ui = getLandingUi(variant);

    assert.deepEqual(ui.showGoogleReview, { mobile: false, desktop: true });
    assert.equal(ui.showMobileBottomNavigation, false);
  }
});
