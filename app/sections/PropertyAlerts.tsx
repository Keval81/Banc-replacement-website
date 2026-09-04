"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";
import { LIFE_MAGAZINE_URL } from "@/lib/banc-contact";

const AREAS = [
  "Cuffley",
  "Goffs Oak",
  "Cheshunt",
  "Brookmans Park",
  "Northaw",
  "Potters Bar",
  "Somewhere else",
] as const;

const PROPERTY_TYPES = ["House", "Bungalow", "Flat or apartment", "Land or new build"] as const;
const BEDROOMS = ["1+", "2+", "3+", "4+", "5+"] as const;
const BUDGETS = [
  "Up to £500,000",
  "£500,000 – £750,000",
  "£750,000 – £1m",
  "£1m – £1.5m",
  "Over £1.5m",
] as const;

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Public property-alert sign-up, paired with Life Magazine.
 *
 * Registering used to mean creating an account, which is a lot to ask of
 * someone who only wants to hear about new homes. This captures what they are
 * looking for and how to reach them, and sends it to the team — the same route
 * every other enquiry takes. Criteria-matched alerts get automated when Banc
 * move to Street; until then a person reads these.
 */
export default function PropertyAlerts() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const looking = String(form.get("looking") ?? "buy");
    const criteria = [
      `Looking to: ${looking === "rent" ? "rent" : "buy"}`,
      `Area: ${form.get("area")}`,
      `Property type: ${form.get("propertyType")}`,
      `Bedrooms: ${form.get("bedrooms")}`,
      `Budget: ${form.get("budget")}`,
    ];

    setStatus("sending");
    setError(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(form.get("name") ?? "").trim(),
          email: String(form.get("email") ?? "").trim(),
          phone: String(form.get("phone") ?? "").trim() || undefined,
          subject: "Property alert sign-up",
          message: ["Please add me to your property alerts.", "", ...criteria].join("\n"),
          consent: true,
          website: "",
          department: looking === "rent" ? "lettings" : "sales",
        }),
      });
      if (!response.ok) throw new Error("That didn't send. Please try again, or call the office.");
      setStatus("sent");
    } catch (cause) {
      setStatus("error");
      setError(cause instanceof Error ? cause.message : "That didn't send. Please try again.");
    }
  };

  const field =
    "h-11 w-full rounded-[var(--radius-md)] border border-banc-line bg-white px-3 text-sm text-banc-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus";
  const label = "block text-[11px] uppercase tracking-[0.18em] text-banc-muted-readable mb-2";

  return (
    <section id="alerts" className="scroll-mt-24 bg-banc-grey-pale py-20 lg:py-28">
      <div className="mx-auto w-full max-w-[1400px] px-5 lg:px-10">
        <SectionHeader number="05" label="Stay updated" title="Hear about homes first" />

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
          <div>
            <p className="max-w-[60ch] text-lg text-banc-muted-readable">
              Tell us what you are looking for and we will be in touch when something
              matching comes to the market — often before it reaches the portals.
            </p>

            {status === "sent" ? (
              <div
                role="status"
                className="mt-8 rounded-[10px] border border-banc-line bg-white p-8"
              >
                <p className="font-serif text-2xl text-banc-dark">You&apos;re on the list.</p>
                <p className="mt-2 text-banc-muted-readable">
                  One of the team will be in touch, and we will let you know as soon as
                  something matching comes up.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
                <fieldset className="grid gap-2">
                  <legend className={label}>I&apos;m looking to</legend>
                  <div className="flex gap-6">
                    {(["buy", "rent"] as const).map((option, index) => (
                      <label key={option} className="flex items-center gap-2 text-sm text-banc-dark">
                        <input
                          type="radio"
                          name="looking"
                          value={option}
                          defaultChecked={index === 0}
                          className="h-4 w-4 accent-banc-focus"
                        />
                        {option === "buy" ? "Buy" : "Rent"}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={label} htmlFor="alert-area">Area</label>
                    <select id="alert-area" name="area" className={field} defaultValue={AREAS[0]}>
                      {AREAS.map((area) => <option key={area}>{area}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={label} htmlFor="alert-type">Property type</label>
                    <select id="alert-type" name="propertyType" className={field} defaultValue={PROPERTY_TYPES[0]}>
                      {PROPERTY_TYPES.map((type) => <option key={type}>{type}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={label} htmlFor="alert-beds">Bedrooms</label>
                    <select id="alert-beds" name="bedrooms" className={field} defaultValue={BEDROOMS[2]}>
                      {BEDROOMS.map((beds) => <option key={beds}>{beds}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={label} htmlFor="alert-budget">Budget</label>
                    <select id="alert-budget" name="budget" className={field} defaultValue={BUDGETS[1]}>
                      {BUDGETS.map((budget) => <option key={budget}>{budget}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <div>
                    <label className={label} htmlFor="alert-name">Your name</label>
                    <input id="alert-name" name="name" required minLength={2} className={field} />
                  </div>
                  <div>
                    <label className={label} htmlFor="alert-email">Email</label>
                    <input id="alert-email" name="email" type="email" required className={field} />
                  </div>
                  <div>
                    <label className={label} htmlFor="alert-phone">Phone (optional)</label>
                    <input id="alert-phone" name="phone" type="tel" className={field} />
                  </div>
                </div>

                {error && (
                  <p role="alert" className="text-sm text-[#9B2C2C]">{error}</p>
                )}

                <div className="flex flex-wrap items-center gap-5">
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-banc-focus px-7 text-sm font-medium text-white transition-colors hover:bg-banc-focus-hover disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2"
                  >
                    {status === "sending" ? "Sending…" : "Subscribe to alerts"}
                  </button>
                  <p className="text-xs text-banc-muted-readable">
                    We will only use these details to contact you about property.{" "}
                    <Link href="/privacy" className="underline hover:text-banc-focus">
                      Privacy policy
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </div>

          <aside className="flex flex-col justify-between rounded-[10px] border border-banc-line bg-white p-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-banc-muted-readable">
                Life Magazine
              </p>
              <p className="mt-4 font-serif text-3xl font-light leading-snug text-banc-dark">
                Our property and lifestyle magazine, free to read
              </p>
              <p className="mt-4 text-banc-muted-readable">
                Homes across Hertfordshire and north London, local features and the
                market as we are seeing it — published through The Guild.
              </p>
            </div>
            <a
              href={LIFE_MAGAZINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex min-h-11 items-center gap-2 self-start border-b border-banc-dark text-sm font-semibold uppercase tracking-[0.14em] text-banc-dark transition-colors hover:text-banc-focus"
            >
              Read this issue
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}
