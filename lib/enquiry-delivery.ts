import {
  isMailConfigured as defaultIsMailConfigured,
  sendEmail as defaultSendEmail,
  type EmailMessage,
  type MailFailure,
  type MailResult,
} from "./email.ts";

export interface EnquiryMail {
  /** The lead itself. Reaching this inbox is what the submission is for. */
  team: EmailMessage;
  /** A courtesy to the enquirer. Never allowed to fail the request. */
  customer: EmailMessage;
}

export interface DeliveryOutcome {
  ok: boolean;
  reason?: MailFailure;
  /** False when the lead landed but the enquirer heard nothing back. */
  confirmationSent: boolean;
}

type Sender = (message: EmailMessage) => Promise<MailResult>;

/**
 * Delivers one enquiry, team first.
 *
 * Nothing here reports success it cannot back up. If there is no mailer the
 * request is refused outright rather than swallowed, and if the lead does not
 * reach the team the caller is told — so the visitor can be shown the office
 * number instead of a confirmation that isn't true.
 */
export async function deliverEnquiry(
  mail: EnquiryMail,
  send: Sender = defaultSendEmail,
  isConfigured: () => boolean = defaultIsMailConfigured,
): Promise<DeliveryOutcome> {
  if (!isConfigured()) {
    return { ok: false, reason: "mail-not-configured", confirmationSent: false };
  }

  const lead = await send(mail.team);
  if (!lead.ok) {
    return { ok: false, reason: lead.reason, confirmationSent: false };
  }

  const confirmation = await send(mail.customer);
  return { ok: true, confirmationSent: confirmation.ok };
}
