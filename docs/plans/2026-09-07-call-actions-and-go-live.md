# 7 Sep call — actions, and the go-live plan for Tuesday 8 September

**Source:** Gemini transcript, "Banc Website - 2026/09/07 14:59 BST" (Google Drive).
**Live tracker:** https://claude.ai/code/artifact/66333ec5-c1d1-4adf-a850-21c644611526
**Call pack that was used:** https://claude.ai/code/artifact/a6e0bfd2-7c46-41f4-8c9c-a0a87226caa0

## The switch

- **Tuesday 8 September, ~2pm.** James at Cove edits two records; Keval verifies from 3pm.
  Nitesh asked James for 2pm; James replied "I'll let you know once it's done
  tomorrow afternoon" — time not yet confirmed (00:13, 00:58).
- Old site's last day is **Wednesday 9th** — that is the rollback window (00:14, 01:07).
- Expect 5–10 minutes of HTTPS errors after the change while the certificate issues (01:07).
- TTL on both records is **3600** (measured 16:05), so a change shows within the hour.
- **www → apex 308 set in Vercel** 16:05 via the API, verified.

```
Row 1   @      A      35.246.9.164       →   A   76.76.21.21       (edit the existing record)
Row 6   www    CNAME  live.webdadi.net   →   A   76.76.21.21       (delete the CNAME, add the A)
```
MX, SPF TXT, autoconfig, imap, pop3, ftp, NS: untouched.

## Nitesh — tonight / tomorrow morning

- Confirm 2pm with James.
- Send the three inbox addresses: **sales, lettings, info** (00:33). Routing agreed:
  viewing → sales or lettings by listing; contact + alerts + newsletter → info;
  valuation + offers → sales (lettings for a rental).
- Send the area landlines with area names (Brookmans Park + one more) (00:23).
- Forward the preview link to the team for feedback; changes come after go-live (01:16).
- Morning: CMP logo + certificate PDF; WhatsApp mobile if he got one (00:34, 01:15).

## Keval — done tonight (commit `091b335`, deployed 17:00)

| Agreed on the call | Done |
|---|---|
| Office hours 9–5:30 in customer emails; drop the "Property Group" footer line (00:54) | ✅ |
| Newsletter sign-up → office inbox like alerts (00:58) | ✅ honest failure if the send fails |
| CRM sync twice a day, lunchtime + end of day (00:27) | ✅ 11:30Z / 17:30Z |
| "Make an offer" on every listing (00:57) | ✅ desktop panel + 3-up mobile rail |
| Radius on the main search bar, not in Filters (00:29) | ✅ |
| Magazine cover behind "Read this issue" (00:30) | ✅ cover from the Guild page-turner |
| Hide WhatsApp until there is a mobile (00:35) | ✅ `NEXT_PUBLIC_BANC_WHATSAPP_NUMBER` turns it on |
| Valuation: online estimate for sales + sell/let split + caveat in emails (00:18, 00:55, 01:06) | ✅ see below |
| EPC under "About this property" (00:25) | Renders and loads in a real browser for every listing that has one. **7 live listings have no EPC in Expert Agent** — BPGC1721/1722/1723, 1732, 1897, 1994, 2019. Nothing to show until it is attached in the CRM. |
| Final QA (01:06) | ✅ 14 routes × 2 viewports on the deployed build: all 200, no overflow, no console errors |
| Maintenance clip "two doors" (00:31) | Regenerating (Kling 3.0 from a clean start frame) |

### The valuation estimate — how it works, so nobody has to rediscover it

- `lib/valuation-estimate.ts`: middle half (Q1–Q3) of the last 24 months' sales
  of the same register type in the **postcode sector**, rounded to £5,000; falls
  back to every type in the sector; refuses below 3 sales. Never a single figure.
- `fetchSoldPricesBySector(sector, district)` in `lib/api/landRegistry.ts`.
  **The district constraint is not optional**: `STRSTARTS` over the whole
  register takes 21s and times out; with `lrcommon:district "WELWYN HATFIELD"`
  the same query answers in ~350ms. District comes from postcodes.io
  (`admin_district`, uppercased). The sector prefix must have **no trailing
  space** — postcodes are stored `EN6 4BG`.
- Live: EN6 4 detached, 111 sales, £745,000–£1,200,000, whole request 1.5s.
- Lettings requests get no figure (no public rent comparables) and route to the
  lettings inbox as a rental appraisal.

## Nitesh's inputs — received 17:45, wired the same evening (`a630a9a`)

| Input | Value | Where it went |
|---|---|---|
| Inboxes | sales@ · lettings@ · info@bancproperty.com | Vercel prod env: `BANC_SALES_INBOX`, `BANC_LETTINGS_INBOX`, `BANC_OFFICE_INBOX`, `BANC_VALUATIONS_INBOX`=sales@ |
| Area lines | Cuffley & Northaw 01707 877781 · Brookmans Park & Potters Bar 01707 907186 · Goffs Oak & Cheshunt 01992 919085 | `BANC_PHONE_LINES` — header menu |
| CMP certificate | `public/documents/cmp-membership-certificate.pdf` | Footer accreditation strip, text chip → PDF. **Logo due 8 Sep morning** — swap the chip for the image |
| Contact page | Clay shopfront on the hero, map first on mobile | `app/contact/ContactPageClient.tsx` |

**Routing as it stands** — viewing → sales@ or lettings@ by the listing's department ·
contact form → info@ · alerts block → sales@/lettings@ by buy/rent · valuation → sales@ ·
rental valuation → lettings@ · offer → sales@/lettings@ by listing · newsletter → info@.

**Tested 18:13 on production, one of each** — Resend reports every one `delivered`
to the Banc mailboxes (hermes/athena.hosts.co.uk accepted them). The very first
contact-form test landed on the old address because a warm function still held the
previous env; the re-send went to info@. Nitesh to confirm they are visible in the
mailboxes.

**A real lead arrived at 16:20** ("7 Mount Drive, AL2 2NP", valuation, within 1
month) while the forms still pointed at Keval's inbox — forward it to Nitesh.

## Fees — caught by SanSan at 19:50 (`7dfce24`)

The old site carried two PDFs, "Fees to Landlords" and "Fees to Tenants" (plus the
complaints procedure and the CMP certificate). The new tenants' guide had **invented
figures** — £100 variation, £100 change of sharer, £15/hr. The published schedule says
£50 per change per person, £20 admin for keys/fobs + cost, £30/hr call-outs, 3% over
base on rent 14+ days late, inventory from £100 only if the tenant requests it. Both
pages now say that; `lib/__tests__/cmp-certificate.test.ts` refuses the old figures.
All four PDFs live in `public/documents/` and are linked from `/lettings/fees` (hero),
both guides and `/complaints`. `/valuation?intent=let` opens on the lettings option.

**For Nitesh:** the schedule charges an inventory "if requested by the tenant" — a
Tenant Fees Act grey area; the page mirrors the schedule and no longer lists inventory
fees as banned, but someone should check that line with the Guild.

## Keval — tomorrow morning

1. ~~Inboxes~~ done tonight. ~~Forms tested~~ done tonight — get Nitesh's confirmation.
2. CMP logo → replace the footer text chip with the image (same PDF link).
3. WhatsApp mobile, if it comes → `NEXT_PUBLIC_BANC_WHATSAPP_NUMBER` in Vercel, redeploy.
4. `dig` the TTL; confirm production is the final build.

## Tuesday 2pm–3pm

James edits rows 1 and 6 → Nitesh forwards "done" → verify: dig both hosts →
https apex answers, www 308s → certificate → homepage film → a listing → viewing
→ sales inbox → valuation → sales inbox → Banc Bot → sitemap.xml → an old URL
301s → submit sitemap in Search Console → call Nitesh.

## Agreed for after go-live (00:42: "once we're happy that we're live")

- **Sold properties = Banc's own.** Sold STC moves to the sold page automatically;
  sold homes stay on the search for a year (00:26, 00:38–00:41). The feed carries
  only `instructedDate` — add a `status_since` stamp in the sync; listing date as
  the fallback for the 237 historic rows (16 inside a year today).
- **Land Registry checker → Resources**, beside yield and stamp duty (00:42).
- **Let-agreed shown for 3 months from the change**, retrospectively (00:22, 00:37).
  4 of 59 inside three months by listing date today.
- **Landlords' guide:** fees for landlords and tenants on the page (two buttons);
  "Book free valuation" → the form with the rental option; add Brookmans Park to
  areas covered (00:32, 01:01–01:05).
- Email templates: tweak with whoever reads them most (00:57).
- Team portraits when ready; clay figures are the holding position (00:37).
- Later: Guild-fed blog + automated monthly newsletter (00:59); machine-readable
  pages for AI (01:08); CRM move to Street after the site settles (01:10–01:14).
- Nitesh to ask Expert Agent whether the export can carry the status-change date.

## Decisions on the record

Enquiries by email until Street · Banc Bot stays on Keval's OpenAI, monitored
(~28p over four heavy days) · valuation estimate for sales only · changes from
team feedback wait until live.

*Last updated: 2026-09-07*
