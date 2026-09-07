# Email to Cove — send today (7 Sep 2026)

**Context that shapes this draft:**

- The 6 Sep follow-up correcting *"adding the 2 new records"* was **never sent**.
  James still believes both records are additions. This email is therefore the
  **first** time he hears otherwise and must read as new information, not a
  reminder.
- The TTL is **86400 (24h)**, not the 21600 recorded in the earlier plan. That
  figure came from `dig @8.8.8.8` — a resolver's remaining countdown, not the
  configured value. All three authoritative nameservers return 86400.
- Go-live may move forward to **Tuesday 8 September**; confirmed at the 15:00
  call. The TTL drop is not date-dependent, so it is asked for today regardless.
- Every weekday/date pair in the earlier plan and in the sent email is
  self-contradictory (9 Sep is a Wednesday, not a Tuesday). The draft asks
  James to confirm both.

---

## Draft — from Nitesh to James at Cove Studios

**Subject:** bancproperty.com — one job for today, and a correction

Hi James,

Two things — the first would really help if it could be done today.

**1. Please lower the TTL on these two records today**

```
bancproperty.com        A       35.246.9.164
www.bancproperty.com    CNAME   live.webdadi.net
```

Set both to 300 seconds. The values stay exactly as they are, so nothing
changes for the website or email today. They're currently on a 24-hour TTL and
we need that to age out before changing anything — doing it today keeps both
Tuesday and Wednesday open to us.

**2. Both changes are edits to those same two records — nothing gets added**

I don't think I made this clear before.

```
apex   A       35.246.9.164      →  76.76.21.21     (edit the existing record)
www    CNAME   live.webdadi.net  →  A  76.76.21.21  (delete the CNAME)
```

If a second `A` record is added and the old one left in place, resolvers
alternate between them and roughly half of visitors land on the old address,
which no longer responds — an intermittent fault, and a difficult one to
diagnose. And `www` can't hold a `CNAME` and an `A` at the same time.

So: two records changed, none added. Please leave the `MX` records, the SPF
`TXT` record and the `autoconfig` / `imap` / `pop3` entries untouched — those
are all email.

**3. Could you confirm the date?**

The date and the day together, please — my earlier email said "Tuesday 9th"
and the 9th is a Wednesday. We may need to move to **Tuesday 8 September**;
I'll confirm this afternoon.

Thanks very much,

Nitesh
Banc Property Group

---

## After the 15:00 call

Send a one-line follow-up confirming the agreed date, e.g.:

> Confirming we'd like the record change on **Tuesday 8 September**, in the
> morning if that suits. Thanks again.

*Last updated: 2026-09-07*
