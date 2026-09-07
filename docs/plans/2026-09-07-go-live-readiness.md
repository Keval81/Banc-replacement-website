# Go-live readiness — Banc, cut-over Wed 10 September

**Checked live on the morning of Mon 7 Sep 2026.** Everything below is
measured, not recalled. Prepared for the 15:00 call with Nitesh.

---

## Green, and confirmed green today

| Check | Result |
|---|---|
| Test suite | **547 pass, 0 fail** (`node --test lib/__tests__/*.test.ts`) |
| Types | `tsc --noEmit` clean |
| Production build | Compiles from a clean `.next`, 41 routes |
| Deployed SHA | `29d5069` — production is level with `origin/main` |
| Canonical origin | `NEXT_PUBLIC_SITE_URL=https://bancproperty.com` ✅ (pulled from Vercel prod) |
| Expert Agent sync | Last 8 scheduled runs **all `success`** — K1 stayed fixed |
| DNS, as expected | apex `A 35.246.9.164`, `www CNAME live.webdadi.net`, both **TTL 21600** — James has not dropped TTLs yet, and is not due to until Tuesday morning |
| Mail records | `MX hermes/athena.hosts.co.uk` present and untouched |
| Both domains on Vercel | verified ✅ |

So the build is not the risk. The risk is in two places: one defect nobody
has looked at, and one dashboard click.

---

## 🔴 P0 — every lead the site captures is silently discarded

**This is the launch blocker.** Not a polish item, not a nice-to-have. If we
cut over on Wednesday as things stand, an estate agency's website will take
viewing requests and valuation leads from real buyers, tell them
*"Your message has been sent successfully"*, and deliver them to nobody, with
no record kept anywhere.

### The evidence, in three links

**1. The email provider defaults to mock, and mock is what production runs.**

```ts
// lib/email.ts:19
const provider = process.env.EMAIL_PROVIDER as EmailConfig["provider"] || "mock";
```

`EMAIL_PROVIDER` is **not set in Vercel** — not in Production, not in Preview,
not anywhere. Checked with `vercel env ls` and confirmed against a pulled
production env file. Neither is `EMAIL_API_KEY`, `ADMIN_EMAIL`, `FROM_EMAIL`
or `CRM_WEBHOOK_URL`.

**2. Mock mode reports success.**

```ts
// lib/email.ts:35-41
if (config.provider === "mock" || process.env.NODE_ENV === "development") {
  console.log("[EMAIL MOCK] Would send email:");
  ...
  return { success: true, messageId: `mock-${Date.now()}` };
}
```

It logs to a serverless console nobody reads and returns `success: true`.

**3. The "database" the lead is stored in is an array in memory.**

```ts
// lib/db.ts:13-14
// In-memory storage for form submissions (until database is fully migrated)
const contactSubmissions: ContactSubmission[] = [];
```

`db.contact.create()` pushes onto that array inside a Vercel serverless
function. The array dies with the invocation. There is no table, no file, no
webhook — `CRM_WEBHOOK_URL` is unset too, so even the CRM fallback is off.

**And then the route tells the visitor it worked:**

```ts
// app/api/contact/route.ts
return NextResponse.json({ success: true, message: "Your message has been sent successfully", ... });
```

### What is affected

Everything that captures a lead. All of it funnels into `/api/contact` or
`/api/valuation`, and both behave the same way:

- **Book a viewing** (`/book-viewing/[propertyId]` → `submitContactEnquiry`)
- **Property enquiry** from any listing page
- **Valuation** (`/valuation` and the `ValuationTool` component)
- **Homepage "Property Alerts"** block — the Batch 4 work
- **Contact form** (`/contact`)

Signed-in alerts (`/api/alerts` → `alertsStore`) are the same in-memory
pattern, though they are behind a login and lower stakes.

### Why the pre-launch QA passed it

From the 4 Sep QA notes: *"every form POST intercepted in Playwright so no
test enquiry reached a client inbox."* The interception was the right
instinct — we did not want test leads landing on Nitesh's desk — but it means
the send path was never once exercised end to end. The suite proved the form
posts and the UI confirms. It could not prove anything arrives.

Same class as the invented sold prices: a silent fallback that returns a
plausible success. Third one on this project.

### The fix — needs your call, it adds a paid dependency

Three parts. Do them in this order, because the first one alone means nothing
is ever lost again:

| | Work | Time |
|---|---|---|
| **a** | **Persist every lead to Supabase before any send attempt.** A `leads` table, written first. Supabase is already wired, service-role key already in prod env. Even with email broken, every enquiry is recoverable. | 60–90 min |
| **b** | **A real sender.** Resend or SendGrid on a **single verified sender address** — deliberately *not* domain authentication, because DKIM/SPF would mean a third record change on bancproperty.com and I do not want to widen Wednesday's DNS blast radius. Domain auth is a clean post-launch job. | ~45 min |
| **c** | **Stop lying.** If neither the store nor the send succeeds, return an honest failure and show the visitor the office phone number instead of a fake confirmation. | ~20 min |

**~2.5 hours total.** If time gets tight, (a) and (c) are the ones that
matter — leads land in a table Nitesh can be sent a daily export of, and
nobody is ever told a message went through when it did not.

**Decision needed from you:** Resend or SendGrid, and whose account carries
it. Both have a free tier that covers Banc's volume comfortably. This is the
same commercial question as K3 (the OpenAI key for Banc Bot) and worth
settling both in one go on the call.

**Also worth knowing:** `lib/resend.ts` exists, is fully written, and is
imported by nothing. Dead code from an earlier attempt at the same job.
Delete it as part of this so there is one email path, not two.

---

## 🟠 P1 — must happen before Wednesday morning

### 1. Set the primary domain in Vercel — 30 seconds, dashboard only

Checked live this morning, both domains still read `redirect: null`:

```
www.bancproperty.com   redirect: null   verified: true
bancproperty.com       redirect: null   verified: true
```

Left like this, `www.bancproperty.com` serves a **full duplicate** of the site
instead of 308-ing to the apex, against the canonical in `lib/site.ts`. Two
indexable copies of an estate agency's entire listing set on launch day.

**Vercel → banc-website → Settings → Domains → edit `www.bancproperty.com`
→ Redirect to `bancproperty.com`, 308 Permanent.**

I cannot do this one. The API `PATCH` is refused by my permission classifier —
that is now twice, on two separate sessions, so it is not a fluke and there is
no CLI equivalent. It needs your hands on the dashboard.

### 2. Nitesh sends the Cove follow-up — today

The one that can actually break Wednesday. James wrote *"adding the 2 new
records"*; both are **replacements**. If he adds rather than replaces:

- Apex ends up with `A 35.246.9.164` **and** `A 76.76.21.21` side by side.
  Valid DNS, resolvers round-robin, so **roughly half of all visitors land on
  a host that does not answer.** Intermittent, which is the worst kind to
  diagnose under launch pressure.
- `www` cannot hold a `CNAME` and an `A`. The `live.webdadi.net` CNAME has to
  be deleted, not left alongside.

Draft is written and ready to send — `docs/plans/2026-09-02-banc-meeting-actions.md` §5.
It also asks him to drop the TTL on those two specific records, which matters:
both are still on **21600 (6h)** as of this morning.

### 3. Nitesh has still never seen the site

`ssoProtection: all_except_custom_domains` — every `.vercel.app` URL 302s to
the Vercel login. He physically cannot review the hero film, the team page,
the typography or the carousels until the domain cuts over.

**That is the wrong order.** He should approve it Monday and go live
Wednesday, not discover it live. Two ways to fix it before the call:

- A Vercel share link — works, but expires in 23 hours.
- Change deployment protection to "Standard" or off. The site goes public
  Wednesday anyway, so the exposure window is three days on an unlinked URL.

Recommend the second, so he can look at it as many times as he likes between
now and Wednesday.

### 4. Push the one local commit

`main` is 1 ahead of `origin/main` — `8b55cc0`, documentation only. No code
change, but keep the branch clean before launch week.

---

## 🟡 P2 — should be done before Wednesday, none of it blocking

**5. The hourly sync is not hourly.** `17 * * * *` is declared; GitHub
actually fires it every 2–5 hours at arbitrary minutes. Today's runs:

```
04:43Z  23:55Z  21:22Z  19:12Z  17:04Z  14:11Z  10:58Z  05:58Z
```

Never at `:17`, and a **five-hour gap** between 05:58 and 10:58. Listings can
be five hours stale on a site that promises live stock. The runs themselves
are healthy — this is the schedule, not the code. Fix: a Vercel Cron hitting
a route that `workflow_dispatch`es the existing workflow, leaving the FTP
code exactly where it already works. `app/api/cron/sync-properties/route.ts`
already exists to build on. **~30 min.**

**6. The last American photo on the homepage.** Card 1.4 "Property
Management" is still an Unsplash US kitchen (over-range microwave), now
sitting next to three pieces of Banc's own British footage. It is the one
card that gives the game away. **~20 min.**

**7. 70 Unsplash hotlinks site-wide**, across 26 files. Every one is an
external dependency on a third party's CDN on a client's commercial site, and
an unknown number are visibly American. Post-launch sweep, but worth Nitesh
knowing it is a known and planned item rather than something we missed.

**8. 51MB of unreferenced video in `public/videos`** — including 27MB of
`hero1/2/3.m4v` from March — shipped on every deploy. Deleting client footage
is Nitesh's call, which is why it is still there.

**9. Finish the QA sweep.** Console errors and failed requests were never
re-run against a clean build, and the journeys want re-driving now that the
hero film, team page and typography have all changed since. **~45 min.**

---

## The list for Nitesh — kept deliberately short

### He must do these

| | What | By when |
|---|---|---|
| **1** | **Send James at Cove the follow-up email** confirming both records are **changed, not added**, and asking him to drop the TTL on those two records specifically. Draft is written and ready. | **Today** |
| **2** | **Look at the site and approve it.** He has not seen any of the last week's work — the new hero film, the team page, the typography. | **Before Wednesday** |

### He must decide these

| | Question | Why it matters |
|---|---|---|
| **3** | **Lettings has exactly one available property.** Verified against the live feed this morning: **1 `to_let`, 59 already `let`.** Is that the truth, or are available properties sitting at "Let STC" in the CRM? | A one-property lettings page on launch day. **This is a CRM answer, not a website change** — we cannot fix it from our side. |
| **4** | **Does the site invite offers online?** `/make-offer/[propertyId]` is fully built and deliberately unlinked, waiting on him. | One-line change either way. |
| **5** | **Sold-price pages now show full addresses including house numbers** — that is the public HM Land Registry record. Live listings stay anonymised. Deliberately different; does he want them stripped? | Ten minutes to change, awkward to change after launch. |
| **6** | **The brand guide's primary button fails accessibility.** `#4AC8E8` with white text is 1.96:1, below the legal floor. The site uses `#0B657A` at 6.65:1 — effectively the guide's own Sky 800. Confirm he is happy. | It is a divergence from a document he signed off. |

### He still owes us these — none of them block Wednesday

| | Input | Effect if it never arrives |
|---|---|---|
| **N1** | The area phone numbers (Brookmans Park + the third area) | Header dropdown offers Cuffley and Mayfair only |
| **N2** | The real sales and lettings inbox addresses | Enquiries route to `sales@` / `lettings@bancproperty.com` — **worth confirming those mailboxes actually exist**, or the leads bounce |
| **N4** | CMP logo + certificate PDF | Footer says "Client Money Protected" in text with no badge or certificate. Compliance — wants to be right |
| **N6** | The maintenance WhatsApp number | No maintenance page, and the Lettings menu link stays out |

N5 (team photos + bios) is **closed** — the page has all four real bios and
the claymation portraits. N9 (drone footage) is **closed** — we generated it
from Banc's own listing photos rather than hiring an operator; the two clips
are banked and waiting on his view of the landing page.

---

## What Wednesday actually looks like

1. James edits the two records. Live in ~5 minutes on the lowered TTL.
2. **Expect a short window of HTTPS errors** while Vercel issues the
   certificate — it can only do that *after* the domain resolves to it.
   Minutes, not hours. Normal. Nobody should panic.
3. The `.vercel.app` SSO wall stops applying to the custom domain.
4. **Rollback is the two old values back in** — live in ~5 minutes. The old
   site stays up at `live.webdadi.net` until the 13th, so the fallback is
   real, not theoretical.

---

## Suggested order of work between now and Wednesday

**Today (Mon), before the call:** set the primary domain in Vercel; decide the
email provider so the P0 work can start straight after.

**Today, after the call:** P0 (a) and (c) — durable lead storage and honest
failures. Nothing is lost from that point on, whatever else happens.

**Tuesday:** P0 (b) — the real sender, verified end to end with a live test
enquiry to a real inbox. Then the sync cadence fix and card 1.4. James drops
the TTLs in the morning; confirm with `dig` that they have actually dropped
before the day ends.

**Tuesday evening:** full QA sweep on the final build, both viewports,
journeys re-driven — including, this time, a real enquiry that lands in a
real inbox.

**Wednesday morning:** James changes the records. Watch, verify, be ready to
roll back.

*Last updated: 2026-09-07*
