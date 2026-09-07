import assert from "node:assert/strict";
import test from "node:test";

import { deliverEnquiry } from "../enquiry-delivery.ts";
import type { EmailMessage, MailResult } from "../email.ts";

/**
 * The order of operations matters more than it looks. Reaching the Banc inbox
 * is the job — that is the lead. The customer's confirmation is a courtesy, so
 * it must never be able to fail a request whose lead already landed, and its
 * failure must never be hidden either.
 */

function recorder(results: MailResult[]) {
  const sent: EmailMessage[] = [];
  let call = 0;
  const send = async (message: EmailMessage): Promise<MailResult> => {
    sent.push(message);
    return results[call++] ?? { ok: true };
  };
  return { sent, send };
}

const ok: MailResult = { ok: true };
const rejected: MailResult = { ok: false, reason: "mail-send-failed" };

const enquiry = {
  team: {
    to: "sales@bancproperty.com",
    subject: "Viewing — BPGC1479 Hanyards Lane — Tue 16 Sep, 2pm",
    html: "<p>details</p>",
    replyTo: "sarah.whitfield@gmail.com",
  },
  customer: {
    to: "sarah.whitfield@gmail.com",
    subject: "Your viewing request — Hanyards Lane, Cuffley",
    html: "<p>thanks</p>",
    replyTo: "sales@bancproperty.com",
  },
};

test("refuses to accept a lead it has no way of delivering", async () => {
  const { sent, send } = recorder([]);
  const outcome = await deliverEnquiry(enquiry, send, () => false);

  assert.equal(outcome.ok, false);
  assert.equal(outcome.reason, "mail-not-configured");
  assert.equal(sent.length, 0, "nothing should be attempted with no mailer");
});

test("the lead reaching the Banc inbox is what makes a submission successful", async () => {
  const { sent, send } = recorder([ok, ok]);
  const outcome = await deliverEnquiry(enquiry, send, () => true);

  assert.equal(outcome.ok, true);
  assert.equal(sent.length, 2);
  assert.equal(sent[0].to, "sales@bancproperty.com", "the team is mailed first");
  assert.equal(sent[1].to, "sarah.whitfield@gmail.com");
});

test("a lead that never reached the team is reported as a failure", async () => {
  const { send } = recorder([rejected]);
  const outcome = await deliverEnquiry(enquiry, send, () => true);

  assert.equal(
    outcome.ok,
    false,
    "the visitor must not be told a message was sent when the team never got it",
  );
  assert.equal(outcome.reason, "mail-send-failed");
});

test("no customer confirmation is attempted once the lead itself has failed", async () => {
  const { sent, send } = recorder([rejected]);
  await deliverEnquiry(enquiry, send, () => true);

  assert.equal(
    sent.length,
    1,
    "confirming to a customer that we received something we did not is worse than silence",
  );
});

test("a failed confirmation never loses a lead that already landed", async () => {
  const { send } = recorder([ok, rejected]);
  const outcome = await deliverEnquiry(enquiry, send, () => true);

  assert.equal(outcome.ok, true, "the lead is in the inbox; the request succeeded");
  assert.equal(
    outcome.confirmationSent,
    false,
    "but the caller can still see the customer heard nothing",
  );
});

test("a delivered enquiry says so on both counts", async () => {
  const { send } = recorder([ok, ok]);
  const outcome = await deliverEnquiry(enquiry, send, () => true);

  assert.equal(outcome.ok, true);
  assert.equal(outcome.confirmationSent, true);
});
