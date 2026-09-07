import assert from "node:assert/strict";
import test from "node:test";

import { emailAssetBase, emailTemplates } from "../email.ts";

/**
 * The first send carried no branding at all: the logo pointed at
 * bancproperty.com, and until the cut-over that apex answers on a dead IP, so
 * every image timed out. Email images have to sit on a host that is reachable
 * TODAY, and the base has to move to the real domain with one env change.
 */

const customer = [
  emailTemplates.contactConfirmation({ name: "Sarah Whitfield", subject: "Viewing request" }),
  emailTemplates.valuationConfirmation({ firstName: "Daniel", address: "14 Tolmers Road" }),
];

const team = [
  emailTemplates.contactNotification({
    name: "Sarah Whitfield",
    email: "s@example.com",
    phone: "07700 900142",
    subject: "Viewing request",
    message: "Chain free.",
  }),
  emailTemplates.valuationNotification({
    firstName: "Daniel",
    lastName: "Okafor",
    email: "d@example.com",
    phone: "07700 900318",
    address: "14 Tolmers Road",
    postcode: "EN6 4DR",
    propertyType: "Semi-detached",
    bedrooms: "4",
    timeframe: "Within 3 months",
  }),
];

const all = [...customer, ...team];

function images(html: string): string[] {
  return html.match(/<img[^>]*>/g) ?? [];
}

test("every image is an absolute URL on a host that answers today", () => {
  for (const email of all) {
    const found = images(email.html);
    assert.ok(found.length > 0, `no images at all in: ${email.subject}`);
    for (const img of found) {
      const src = img.match(/src="([^"]+)"/)?.[1] ?? "";
      assert.match(src, /^https:\/\//, `relative or missing src: ${src}`);
      assert.doesNotMatch(
        src,
        /^https:\/\/bancproperty\.com/,
        "the apex is dead until the cut-over — an image there never loads",
      );
    }
  }
});

test("the asset host moves with one environment change", () => {
  const previous = process.env.EMAIL_ASSET_BASE;
  process.env.EMAIL_ASSET_BASE = "https://bancproperty.com";
  try {
    assert.equal(emailAssetBase(), "https://bancproperty.com");
    const after = emailTemplates.contactConfirmation({ name: "A", subject: "B" });
    assert.match(
      after.html,
      /src="https:\/\/bancproperty\.com\//,
      "after the cut-over the images should serve from Banc's own domain",
    );
  } finally {
    if (previous === undefined) delete process.env.EMAIL_ASSET_BASE;
    else process.env.EMAIL_ASSET_BASE = previous;
  }
});

test("a blocked image still leaves something branded to read", () => {
  for (const email of all) {
    for (const img of images(email.html)) {
      assert.match(img, /alt="[^"]+"/, `an image with no alt text: ${img.slice(0, 60)}`);
      assert.match(img, /width="\d+"/, "email clients need an explicit width");
    }
  }
});

test("the customer meets the team; the team do not meet themselves", () => {
  for (const email of customer) {
    assert.match(
      email.html,
      /banc-team-clay/,
      `${email.subject}: the customer should see who they are dealing with`,
    );
  }
  for (const email of team) {
    assert.doesNotMatch(
      email.html,
      /banc-team-clay/,
      `${email.subject}: an internal lead does not need a portrait of the office`,
    );
  }
});

test("the shopfront opens the email, before a word of copy", () => {
  // The picture is the header now: four people outside the Cuffley office does
  // more for a stranger than a wordmark does.
  for (const email of customer) {
    const photo = email.html.indexOf("banc-team-clay");
    const firstHeading = email.html.indexOf("<h1");
    assert.ok(photo > -1 && firstHeading > -1);
    assert.ok(
      photo < firstHeading,
      `${email.subject}: the portrait has to sit above the copy to be a header`,
    );
  }
});

test("the wordmark signs off at the foot of every email", () => {
  for (const email of all) {
    const logo = email.html.lastIndexOf("banc-logo");
    const lastHeading = email.html.lastIndexOf("<h1");
    assert.ok(logo > -1, `${email.subject}: no wordmark anywhere`);
    assert.ok(
      logo > lastHeading,
      `${email.subject}: the wordmark belongs at the bottom now, not the top`,
    );
  }
});

test("the footer wordmark sits on the ground it was drawn for", () => {
  // public/banc-logo.png is the Brand Kit's SECONDARY lockup — metallic teal
  // drawn for a LIGHT background. On Dark 900 its mid-tones sink and the mark
  // reads as a blur, which is what made it look wrong.
  for (const email of all) {
    const signOff = email.html.slice(email.html.lastIndexOf("banc-logo") - 400);
    assert.match(signOff, /background:#F4F3F1/, `${email.subject}: secondary lockup needs a light ground`);
    assert.doesNotMatch(
      signOff.slice(0, signOff.indexOf("<img")),
      /background:#1A1917/,
      `${email.subject}: the secondary lockup must not sit on Dark 900`,
    );
  }
});

test("the wordmark comes from the official logo pack", () => {
  // "Banc Property Group Logos/" holds the six approved variants. The metallic
  // 3D files loose in 02-Design are an older treatment and are NOT in that
  // pack — banc-logo.png is one of them, and it is not what Banc ship.
  const OFFICIAL = /banc-logo-(blue|white|white-clear|grey)\.png/;
  for (const email of all) {
    const img = (email.html.match(/<img[^>]*banc-logo[^>]*>/) ?? [""])[0];
    const src = img.match(/src="([^"]+)"/)?.[1] ?? "";
    assert.match(src, OFFICIAL, `${email.subject}: ${src} is not from the approved pack`);
  }
});

test("the wordmark clears the Brand Kit's digital minimum", () => {
  // "Digital minimum: 120px wide" — below that the 3D detail turns to mud.
  for (const email of all) {
    const img = (email.html.match(/<img[^>]*banc-logo[^>]*>/) ?? [""])[0];
    const width = Number(img.match(/width="(\d+)"/)?.[1] ?? 0);
    assert.ok(width >= 120, `${email.subject}: wordmark at ${width}px is below the 120px minimum`);
  }
});

test("Banc Sky carries the brand, not a hairline", () => {
  // The first draft used sky as a 2px rule and read as a generic dark email.
  for (const email of all) {
    const band = email.html.match(/height:\s*(\d+)px;background:#4AC8E8/i);
    assert.ok(band, `${email.subject}: no sky band at all`);
    assert.ok(
      Number(band[1]) >= 6,
      `${email.subject}: a ${band[1]}px sky rule is not branding`,
    );
  }
});
