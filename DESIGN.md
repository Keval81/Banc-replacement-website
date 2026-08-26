# Banc Property — DESIGN.md

Visual contract for the Aker restyle. Structure borrowed from
**akercompanies.com** (via styles.refero.design `4aa6d64c`); every value is
Banc's own. Attach before any UI pass; verify rendered against these rules
before calling a pass done.

## Product tone

A premium Cuffley & Hertfordshire estate agency that speaks quietly.
Museum-label restraint: monumental whisper-weight type, photography doing the
persuading, one accent at a time. Not luxury-Mayfair, not SaaS.

## Colors (unchanged Banc tokens — `app/globals.css`)

| Role | Token | Value | Rule |
|---|---|---|---|
| Canvas | `--banc-grey-pale` / white | `#F4F3F1` / `#FFFFFF` | page ground |
| Dark band | `--banc-dark-deep` | `#1A1917` | full-bleed section bands, hero scrim |
| Dark panel | `--banc-dark` / `--banc-dark-mid` | `#2C2A27` / `#3D3B37` | floating cards on photography |
| Ink | `--banc-dark` | `#2C2A27` | text on light |
| Muted | `--banc-grey` | `#8A8880` | eyebrows, metadata |
| **Accent** | `--banc-sky` | `#4AC8E8` | **one use per section maximum** — link arrows, active states, the single highlight |
| Premier | `--banc-gold` | `#D4AF37` | Premier Homes references ONLY; never a general accent |
| Hairline | | `rgba(44,42,39,.14)` light / `rgba(255,255,255,.16)` dark | the structural line; replaces all shadows |

## Typography

- **Display: Source Serif 4, weight 300.** Sections 56–88px, hero wordmark
  `clamp(96px, 16vw, 220px)`. Letter-spacing −0.02em, line-height ≤1.05.
  Never bold at display size — the system speaks at 300 even when shouting.
- **UI/body: DM Sans** 400/500. Body 16–18px, left-aligned, max-width 62ch.
- **Labels: DM Sans 500, 11–13px, uppercase, +0.12em tracking** — the
  museum-label voice (eyebrows, tags, metadata).
- Serif italic only for pull-quotes ≤20px.

## Shape & depth

- Buttons/pills/tags: **999px radius**. Cards/images: **10px** (`--radius-md`).
- **No box-shadows. No gradients.** Depth = photography + surface contrast +
  hairlines. (Scrims over photography are allowed — they're legibility, not
  decoration.)
- Default button = text + trailing → arrow, no fill. Filled sky button reserved
  for the single highest-emphasis action per view (Valuation).

## Layout

- Content max-width 1200px; photography bands full-bleed 100vw.
- Hero: full-viewport photography/video · small intro paragraph top-left ·
  monumental wordmark bottom-left · floating dark card cluster right.
- Sections numbered like exhibits (`1.1 · Sales`), opened by an eyebrow +
  giant light heading, separated by hairlines — never by background-colour
  stripes.
- Editorial copy strictly left-aligned; no centered stacks.

## Do not

- No sky-blue on prices, icon strokes, and headings simultaneously — one
  accent moment per section.
- No drop shadows, no gradients, no 4px-radius SaaS cards.
- No weight ≥600 display type.
- No empty-state cards on the public homepage (the "No Image / £0" AI section
  ships hidden until it has real data).

*Last updated: 2026-08-15*
