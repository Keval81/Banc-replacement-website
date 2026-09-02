import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
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
    assert.equal(ui.heroActionPresentation, "editorial-paired-actions");
  }
});

test("keeps homepage Buy and Rent selection accessible and submits only through Search", () => {
  const source = readFileSync(
    join(import.meta.dirname, "..", "..", "app", "sections", "PropertySearch.tsx"),
    "utf8",
  );

  assert.match(source, />\s*Buy\s*</);
  assert.match(source, />\s*Rent\s*</);
  assert.equal((source.match(/aria-pressed=/g) ?? []).length, 2);
  assert.match(source, /onSearch=\{handleSearch\}/);
  assert.doesNotMatch(source, /useEffect\([\s\S]*?router\.push/);
});

test("keeps the valuation and labelled phone actions available outside the hero", () => {
  const ui = getLandingUi("aker");

  assert.deepEqual(ui.valuationAction, {
    label: "Request an instant valuation",
    href: "/valuation",
  });
  assert.deepEqual(ui.phoneAction, {
    label: "Call Banc Property Group",
    href: "tel:01707877781",
  });
});

test("keeps valuation in the menu without duplicating it as a homepage hero tile", () => {
  const heroSource = readFileSync(
    join(import.meta.dirname, "..", "..", "app", "sections", "Hero.tsx"),
    "utf8",
  );
  const headerSource = readFileSync(
    join(import.meta.dirname, "..", "..", "components", "Header.tsx"),
    "utf8",
  );

  assert.equal((heroSource.match(/href="\/valuation"/g) ?? []).length, 0);
  assert.equal(
    (headerSource.match(/landingUi\.valuationAction\.href/g) ?? []).length,
    2,
  );
  assert.equal(
    (headerSource.match(/landingUi\.valuationAction\.label/g) ?? []).length,
    2,
  );
});

test("uses social actions instead of a duplicate logo in the Aker mobile header", () => {
  const ui = getLandingUi("aker");

  // The hero carries the brand lockup; repeating it in the header over the
  // same frame reads as two logos.
  assert.equal(ui.showLandingHeaderLogo, false);
  assert.deepEqual(ui.mobileSocialActions, [
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

test("places mobile property actions in a centered in-layout row", () => {
  const ui = getLandingUi("aker");

  assert.equal(ui.mobileHeroActionPlacement, "centered-action-row");
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

test("carries the brand lockup and tagline in the hero, in Banc blue", () => {
  const heroSource = readFileSync(
    join(import.meta.dirname, "..", "..", "app", "sections", "Hero.tsx"),
    "utf8",
  );
  const headerSource = readFileSync(
    join(import.meta.dirname, "..", "..", "components", "Header.tsx"),
    "utf8",
  );

  assert.match(heroSource, /src="\/banc-logo-blue\.png"/);
  assert.doesNotMatch(heroSource, /banc-logo-white-clear\.png/);
  assert.match(heroSource, /Local independent property specialists/);
  // The site's label voice: a tracked uppercase eyebrow at the same scale
  // SectionHeader uses, not body copy.
  const tagline = heroSource.match(
    /className="([^"]+)"\s*>\s*Local independent property specialists/,
  );
  assert.ok(tagline, "the hero must render the site tagline under the lockup");
  const classes = tagline[1]?.split(/\s+/) ?? [];
  for (const token of [
    "uppercase",
    "font-medium",
    // One line from 320px up — below 360px the larger size orphans the last
    // word onto a second line.
    "text-[9px]",
    "min-[360px]:text-[10px]",
    "sm:text-[13px]",
  ]) {
    assert.ok(classes.includes(token), `the tagline must carry the ${token} class`);
  }
  assert.ok(
    !classes.includes("font-serif"),
    "the tagline is a label, not serif body copy",
  );
  // Tracking settles once the lockup has landed.
  assert.match(
    heroSource,
    /animate=\{\{ opacity: 1, letterSpacing: "0\.2em", filter: "blur\(0px\)" \}\}/,
  );
  // The tagline belongs to the hero lockup, not to the header bar.
  assert.doesNotMatch(headerSource, /Local independent property specialists/);
});

test("names the conversational agent Banc Bot everywhere a visitor sees it", () => {
  const chatbotSource = readFileSync(
    join(import.meta.dirname, "..", "..", "components", "ai", "PropertyChatbot.tsx"),
    "utf8",
  );

  assert.doesNotMatch(chatbotSource, /AI assistant/i);
  assert.doesNotMatch(chatbotSource, /property assistant/i);
  assert.match(chatbotSource, /I'm Banc Bot/);
  for (const label of [
    "Talk to Banc Bot about any current property",
    "Open Banc Bot",
    "Conversation with Banc Bot",
    "Message Banc Bot",
    "Banc Bot is typing",
  ]) {
    assert.ok(
      chatbotSource.includes(label),
      `PropertyChatbot must use the label ${JSON.stringify(label)}`,
    );
  }
});

test("points the footer valuation link at the one valuation flow", () => {
  const footerSource = readFileSync(
    join(import.meta.dirname, "..", "..", "components", "Footer.tsx"),
    "utf8",
  );

  // /tools/valuation is a second, unstyled valuation form; the header CTA
  // and the footer must land on the same flow.
  assert.doesNotMatch(footerSource, /"\/tools\/valuation"/);
  assert.match(
    footerSource,
    /\{ name: "Request a Valuation", href: "\/valuation" \}/,
  );
  assert.equal(getLandingUi("aker").valuationAction.href, "/valuation");
});

test("does not run a rotating review ticker under every page", () => {
  const layoutSource = readFileSync(
    join(import.meta.dirname, "..", "..", "app", "layout.tsx"),
    "utf8",
  );

  assert.doesNotMatch(layoutSource, /<LiveReviewFeed\s*\/>/);
  assert.doesNotMatch(layoutSource, /from "@\/components\/social\/LiveReviewFeed"/);
});

test("uses one help launcher instead of competing contact controls on the landing page", () => {
  assert.deepEqual(getLandingOverlayPolicy("/"), {
    showMobileBottomNavigation: false,
    showProactiveChatPrompt: false,
    showPushNotificationPrompt: false,
    showStandaloneWhatsapp: false,
    mobileContactControlPlacement: "unified-help",
    mobileWhatsappPanelPlacement: "above-trigger",
  });
});

test("offers assistant and WhatsApp choices from the landing-page help launcher", () => {
  assert.deepEqual(getLandingUi("aker").mobileContactLauncher, {
    label: "Help",
    assistantLabel: "Ask Banc Bot",
    assistantAvatar: {
      src: "/images/ai/banc-bot.png",
      alt: "",
    },
    whatsappLabel: "Chat on WhatsApp",
    whatsappHref:
      "https://wa.me/447707877781?text=Hi%2C%20I'm%20interested%20in%20a%20property%20I%20saw%20on%20your%20website.",
  });
});

test("renders the shared editorial property actions at both hero breakpoints", () => {
  const heroSource = readFileSync(
    join(import.meta.dirname, "..", "..", "app", "sections", "Hero.tsx"),
    "utf8",
  );
  const selectorSource = readFileSync(
    join(
      import.meta.dirname,
      "..",
      "..",
      "components",
      "PropertyJourneySelector.tsx",
    ),
    "utf8",
  );

  assert.equal((heroSource.match(/<PropertyJourneySelector/g) ?? []).length, 2);
  assert.match(selectorSource, /aria-label="Browse Banc properties"/);
  assert.match(selectorSource, /min-h-16/);
  assert.match(selectorSource, /gap-2/);
  assert.match(selectorSource, /text-banc-dark-deep\/70/);
  assert.doesNotMatch(selectorSource, /text-banc-dark-deep\/55/);
  assert.match(
    selectorSource,
    /data-presentation=\{landingUi\.heroActionPresentation\}/,
  );
});

test("keeps mobile navigation and proactive chat available on regular pages", () => {
  assert.deepEqual(getLandingOverlayPolicy("/sales/properties"), {
    showMobileBottomNavigation: true,
    showProactiveChatPrompt: true,
    showPushNotificationPrompt: true,
    showStandaloneWhatsapp: true,
    mobileContactControlPlacement: "standard",
    mobileWhatsappPanelPlacement: "above-trigger",
  });
});

test("retires legacy page caching while preserving the notification worker", () => {
  const layoutSource = readFileSync(
    join(import.meta.dirname, "..", "..", "app", "layout.tsx"),
    "utf8",
  );
  const serviceWorkerSource = readFileSync(
    join(import.meta.dirname, "..", "..", "public", "sw.js"),
    "utf8",
  );

  assert.match(layoutSource, /navigator\.serviceWorker\.register/);
  assert.match(serviceWorkerSource, /cacheName\.startsWith\(["']banc-pwa-["']\)/);
  // Activation must not force-reload open tabs.
  assert.doesNotMatch(serviceWorkerSource, /client\.navigate\(/);
  assert.match(serviceWorkerSource, /addEventListener\(["']push["']/);
  assert.match(serviceWorkerSource, /addEventListener\(["']notificationclick["']/);
  assert.doesNotMatch(serviceWorkerSource, /self\.registration\.unregister\(\)/);
  assert.doesNotMatch(serviceWorkerSource, /addEventListener\(["']fetch["']/);
});

test("keeps the Featured Listings section visible while data loads or is unavailable", () => {
  const source = readFileSync(
    join(import.meta.dirname, "..", "..", "app", "sections", "FeaturedListings.tsx"),
    "utf8",
  );
  const loaderSource = readFileSync(
    join(import.meta.dirname, "..", "featured-listings.ts"),
    "utf8",
  );

  assert.match(loaderSource, /status:\s*["']loading["']/);
  assert.match(source, /Loading featured homes/);
  assert.match(source, /No featured homes are available right now/);
  assert.match(source, /We couldn(?:&apos;|')t load featured homes right now/);
  assert.match(source, /href=["']\/sales\/properties["']/);
  assert.doesNotMatch(source, /catch\(\(\)\s*=>\s*\{\}\)/);
  assert.doesNotMatch(source, /if \(listings\.length === 0\) return null/);
});
