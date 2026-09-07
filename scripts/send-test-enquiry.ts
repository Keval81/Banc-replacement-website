/**
 * Proves the enquiry email chain end to end, through the real send path.
 *
 *   node --env-file=.env.local --experimental-strip-types \
 *     scripts/send-test-enquiry.ts you@example.com
 *
 * Add --preview to write the four emails to .preview/ and open them instead of
 * sending — useful for reviewing copy without filling anyone's inbox.
 *
 * Deliberately imports the same modules the API routes use, so a pass here
 * means the routes work. Nothing is stubbed.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { emailTemplates, isMailConfigured, mailFrom, sendEmail } from "../lib/email.ts";

const target = process.argv.find((a) => a.includes("@"));
const previewOnly = process.argv.includes("--preview");

if (!target) {
  console.error("Usage: send-test-enquiry.ts <address> [--preview]");
  process.exit(1);
}

const samples = [
  {
    name: "1-viewing-customer",
    label: "Viewing request → the customer",
    ...emailTemplates.contactConfirmation({
      name: "Sarah Whitfield",
      subject: "Viewing request — Hanyards Lane, Cuffley (BPGC1479)",
      message:
        "We're chain free and can be flexible on the day if the afternoon doesn't suit.\nIdeally we'd like to see the garden while it's light.",
    }),
  },
  {
    name: "2-viewing-team",
    label: "Viewing request → the Banc inbox",
    ...emailTemplates.contactNotification({
      name: "Sarah Whitfield",
      email: "sarah.whitfield@example.com",
      phone: "07700 900142",
      subject: "Viewing request — Hanyards Lane, Cuffley (BPGC1479), Tue 16 Sep 2:00pm",
      message:
        "We're chain free and can be flexible on the day if the afternoon doesn't suit.\nIdeally we'd like to see the garden while it's light.",
    }),
  },
  {
    name: "3-valuation-customer",
    label: "Valuation → the customer",
    ...emailTemplates.valuationConfirmation({
      firstName: "Daniel",
      address: "14 Tolmers Road, Cuffley",
    }),
  },
  {
    name: "4-valuation-team",
    label: "Valuation → the Banc inbox",
    ...emailTemplates.valuationNotification({
      firstName: "Daniel",
      lastName: "Okafor",
      email: "d.okafor@example.com",
      phone: "07700 900318",
      address: "14 Tolmers Road, Cuffley",
      postcode: "EN6 4DR",
      propertyType: "Semi-detached",
      bedrooms: "4",
      timeframe: "Within 3 months",
      message: "Extended at the back in 2021 with building regs sign-off.",
    }),
  },
];

if (previewOnly) {
  const dir = join(import.meta.dirname, "..", ".preview");
  mkdirSync(dir, { recursive: true });
  for (const sample of samples) {
    const file = join(dir, `${sample.name}.html`);
    writeFileSync(file, sample.html);
    console.log(`  ${sample.label}\n    ${file}`);
  }
  console.log("\nOpen them with:  open .preview/*.html");
  process.exit(0);
}

if (!isMailConfigured()) {
  console.error(
    "\n  RESEND_API_KEY is not set.\n" +
      "  Nothing was sent, which is the correct behaviour — the site would show\n" +
      "  the office number rather than a false confirmation.\n\n" +
      "  Add it to .env.local (local test) or Vercel (deployed test).\n",
  );
  process.exit(2);
}

console.log(`\n  Sending as: ${mailFrom()}`);
console.log(`  Sending to: ${target}\n`);

let failed = 0;
for (const sample of samples) {
  const result = await sendEmail({
    to: target,
    subject: `[TEST] ${sample.subject}`,
    html: sample.html,
    replyTo: "test-reply@example.com",
  });
  if (result.ok) {
    console.log(`  ✓ ${sample.label}  (${result.id ?? "sent"})`);
  } else {
    failed += 1;
    console.log(`  ✗ ${sample.label}  — ${result.reason}${result.detail ? `: ${result.detail}` : ""}`);
  }
}

console.log(
  failed === 0
    ? `\n  All four sent. Check ${target}, including the junk folder, and read one on a phone.\n`
    : `\n  ${failed} of ${samples.length} failed. Nothing above was silently swallowed.\n`,
);
process.exit(failed === 0 ? 0 : 1);
