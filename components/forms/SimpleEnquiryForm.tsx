"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BANC_CONTACT } from "@/lib/banc-contact";
import { describeSubmitError } from "@/lib/lead-form-rules";
import {
  buildSimpleEnquiryPayload,
  type SimpleEnquiryField,
  type SimpleEnquirySubject,
  type SimpleEnquiryValues,
} from "@/lib/simple-enquiry";
import { actionPrimary, fieldControl, fieldLabel, fieldTextarea } from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "sent" | "error";

interface SimpleEnquiryFormProps {
  fields: readonly SimpleEnquiryField[];
  /** Template like "Career enquiry — {name}"; see `SimpleEnquirySubject`. */
  subject: SimpleEnquirySubject;
  submitLabel: string;
  successTitle: string;
  successBody: string;
  /** First line of the email, so the office knows which page it came from. */
  intro?: string;
  /** Defaults to the wording used on /contact. */
  consentLabel?: ReactNode;
  classNames?: {
    form?: string;
    input?: string;
    textarea?: string;
    select?: string;
    consent?: string;
    submit?: string;
  };
}

const LABEL_CLASS = fieldLabel;
const INPUT_CLASS = fieldControl;
const TEXTAREA_CLASS = cn(fieldControl, fieldTextarea, "h-auto resize-none");
const SELECT_CLASS = cn(fieldControl, "cursor-pointer appearance-none pr-11");
const CONSENT_CLASS = "flex items-start gap-3 border-t border-banc-dark/15 pt-5";
const SUBMIT_CLASS = cn(actionPrimary, "shadow-none");

const FALLBACK_ERROR = `That didn't send. Please try again, or call us on ${BANC_CONTACT.displayPhone}.`;

/** Pairs consecutive "half" fields into one two-column row. */
function groupRows(fields: readonly SimpleEnquiryField[]): SimpleEnquiryField[][] {
  const rows: SimpleEnquiryField[][] = [];
  let pending: SimpleEnquiryField[] = [];
  for (const field of fields) {
    if (field.span === "half") {
      pending.push(field);
      if (pending.length === 2) {
        rows.push(pending);
        pending = [];
      }
      continue;
    }
    if (pending.length) {
      rows.push(pending);
      pending = [];
    }
    rows.push([field]);
  }
  if (pending.length) rows.push(pending);
  return rows;
}

/** The server explains delivery failures itself (with the office number); validation issues list their own messages. */
async function readServerError(response: Response): Promise<string> {
  const data: unknown = await response.json().catch(() => null);
  return describeSubmitError(data, FALLBACK_ERROR);
}

/**
 * A small enquiry form that posts to /api/contact — the same route every other
 * lead takes — and only shows a confirmation once the server says the email
 * reached the office. Pages configure the fields; the payload shape is built
 * by `lib/simple-enquiry`.
 */
export function SimpleEnquiryForm({
  fields,
  subject,
  submitLabel,
  successTitle,
  successBody,
  intro,
  consentLabel,
  classNames,
}: SimpleEnquiryFormProps) {
  const baseId = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!consent) {
      setStatus("error");
      setError("Please tick the box to confirm we may contact you.");
      return;
    }

    const values: SimpleEnquiryValues = {};
    new FormData(event.currentTarget).forEach((value, key) => {
      if (typeof value === "string") values[key] = value;
    });
    const payload = buildSimpleEnquiryPayload({ fields, values, subject, intro });

    setStatus("sending");
    setError(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await readServerError(response));
      setStatus("sent");
    } catch (cause) {
      setStatus("error");
      setError(cause instanceof Error && cause.message ? cause.message : FALLBACK_ERROR);
    }
  };

  if (status === "sent") {
    return (
      <div role="status" className="rounded-[var(--radius-md)] border border-banc-line bg-banc-grey-pale p-5 sm:p-6">
        <p className="text-lg font-semibold text-banc-dark-deep">{successTitle}</p>
        <p className="mt-2 text-sm leading-relaxed text-banc-muted-readable">{successBody}</p>
      </div>
    );
  }

  const renderField = (field: SimpleEnquiryField) => {
    const id = `${baseId}-${field.name}`;
    const label = (
      <label htmlFor={id} className={LABEL_CLASS}>
        {field.label}
        {field.required ? " *" : ""}
      </label>
    );

    if (field.type === "textarea") {
      return (
        <div key={field.name}>
          {label}
          <Textarea
            id={id}
            name={field.name}
            placeholder={field.placeholder}
            rows={field.rows ?? 4}
            required={field.required}
            className={cn(TEXTAREA_CLASS, classNames?.textarea)}
          />
        </div>
      );
    }

    if (field.type === "select") {
      return (
        <div key={field.name}>
          {label}
          <div className="relative">
          <select
            id={id}
            name={field.name}
            required={field.required}
            defaultValue=""
            className={cn(SELECT_CLASS, classNames?.select)}
          >
            <option value="">{field.placeholder ?? "Select..."}</option>
            {(field.options ?? []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-banc-muted-readable"
            aria-hidden="true"
          />
          </div>
        </div>
      );
    }

    return (
      <div key={field.name}>
        {label}
        <Input
          id={id}
          name={field.name}
          type={field.type}
          placeholder={field.placeholder}
          required={field.required}
          className={cn(INPUT_CLASS, classNames?.input)}
        />
      </div>
    );
  };

  const consentId = `${baseId}-consent`;
  const honeypotId = `${baseId}-website`;

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-5", classNames?.form)}>
      {groupRows(fields).map((row) =>
        row.length === 2 ? (
          <div key={row.map((field) => field.name).join("+")} className="grid gap-5 sm:grid-cols-2 sm:gap-4">
            {row.map(renderField)}
          </div>
        ) : (
          renderField(row[0])
        )
      )}

      {/* Honeypot: humans never see it; a filled value makes the server discard the post. */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden">
        <label htmlFor={honeypotId}>Website</label>
        <input id={honeypotId} name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className={cn(CONSENT_CLASS, classNames?.consent)}>
        <Checkbox
          id={consentId}
          name="consent"
          required
          checked={consent}
          onCheckedChange={(checked) => setConsent(checked === true)}
          className="mt-0.5 h-5 w-5 border-banc-muted-readable data-[state=checked]:border-banc-focus data-[state=checked]:bg-banc-focus data-[state=checked]:text-white"
        />
        <label htmlFor={consentId} className="text-sm text-banc-muted-readable leading-relaxed cursor-pointer">
          {consentLabel ?? (
            <>
              Please tick this box if you are happy for us to contact you via phone and email. You can view
              our full{" "}
              <Link href="/privacy" className="text-banc-focus underline underline-offset-4 hover:text-banc-focus-hover">
                privacy policy
              </Link>{" "}
              on our website.
            </>
          )}
        </label>
      </div>

      {error && (
        <div role="alert" className="rounded-[var(--radius-md)] border border-[#9B2C2C]/30 bg-[#9B2C2C]/5 p-4 text-sm text-[#9B2C2C]">
          {error}
        </div>
      )}

      <Button type="submit" disabled={status === "sending"} className={cn(SUBMIT_CLASS, classNames?.submit)}>
        {status === "sending" ? "Sending…" : submitLabel}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </form>
  );
}
