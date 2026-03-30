# Banc Property Group — Claude Code Build Instructions
**Version:** 2.0 | **Date:** March 2026 | **Status:** Active

---

## CRITICAL — READ FIRST

This is a **continuation build**, not a new project. A previous AI agent (OpenClaw) built approximately 60-70% of this Next.js website. Your job is to:

1. **Audit what exists** before touching anything
2. **Apply the brand design system** consistently across all existing pages and components — using Stitch as your visual reference
3. **Fix known bugs** in the existing build
4. **Complete the unfinished sections** using the same design system
5. **Use 21st.dev components** for polished, production-ready UI elements
6. **Wire up integrations** (Expert Agent CRM, Rightmove, Supabase)

**NEVER overwrite or delete existing working code without explicit confirmation.**
**ALWAYS check if a file/component exists before creating a new one.**
**ALWAYS commit and push to GitHub after completing each phase.**

---

## Project Context

**Site:** Banc Property Group — premium UK estate agency
**Live URL:** https://banc-website-kappa.vercel.app
**Locations:** Cuffley, Hertfordshire + Mayfair, London
**Competitors to exceed:** Savills, Knight Frank, Strutt & Parker
**Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Supabase, Sanity CMS, Algolia, Vercel

---

## Your Three Design Tools

### Tool 1: Stitch (Visual Reference — Use First)

Full-page designs have been pre-generated in Stitch showing exactly how the site should look. Always check Stitch before writing any UI code.

- **Stitch Project ID:** `3974286054584858030`
- **Design System Asset ID:** `10087854773533194260`

**Pre-built screens:**

| Page | Screen ID | URL |
|------|-----------|-----|
| Homepage | `3dc2b52e7d014fdfb25b31b99b98bec0` | `/` |
| Property Search | `de3a3f1bd71b48eda8867b1ce0117384` | `/sales/properties` |
| Vendor Portal | `a1aee91a233d49b193a5a580b3a35322` | `/portal` |

**Stitch workflow for each page:**
```
1. stitch:fetch_screen_image (screenId) — view the design
2. stitch:fetch_screen_code (screenId) — get the HTML reference code
3. Implement in Next.js/React matching the design
4. For pages without a Stitch screen yet:
   stitch:generate_screen_from_text (projectId: "3974286054584858030")
   — always reference design system "10087854773533194260"
```

### Tool 2: 21st.dev Magic (Component Library — Use for All UI Components)

Do not build common UI components from scratch. Use 21st Magic to source polished, production-ready React components and adapt them to the Banc brand.

**Use 21st.dev for these component types:**
- Property cards with image, tags, stats
- Navigation bar with dropdowns and mobile menu
- Search bar with autocomplete and filters
- Filter panels with checkboxes, sliders, pill buttons
- Modal dialogs (viewing request, contact, enquiry)
- Form inputs with validation (email, phone, postcode)
- Multi-step form/stepper (valuation tool)
- Data tables (portal documents, activity feed)
- Stat/metric cards (portal dashboard)
- Tab components (property detail sections)
- Accordion/expandable (features list, FAQ)
- Toast notifications (form success/error)
- Skeleton loaders (while properties load)
- Badge/tag components (New Listing, Price Reduced, etc.)
- Avatar components (agent cards, team page)
- Chart components (property views graph, EPC chart)

**21st.dev workflow:**
```
1. 21st_magic_component_inspiration (searchQuery: "property card") — browse options
2. 21st_magic_component_builder — build a component matching Banc brand
3. 21st_magic_component_refiner — refine existing components to match brand
```

Always specify when requesting components:
- Primary colour: Banc Sky `#4AC8E8`
- Font: DM Sans for UI, Source Serif 4 for display/price headings
- Border radius: 6px (small), 10px (cards), 16px (sections)
- Style: clean, minimal, premium estate agency

### Tool 3: Brand Design Tokens (CSS Source of Truth)

Implement these in `globals.css` and `tailwind.config.ts` as the very first step:

```css
:root {
  --banc-sky:          #4AC8E8;   /* Primary — CTAs, links, active states */
  --banc-sky-light:    #E8F8FC;   /* Tag backgrounds, info panels */
  --banc-sky-mid:      #9ADFF2;   /* Hover states */
  --banc-sky-dark:     #1A9BBF;   /* CTA hover */
  --banc-dark:         #2C2A27;   /* Primary dark, headings */
  --banc-dark-deep:    #1A1917;   /* Nav header, footer */
  --banc-dark-mid:     #3D3B37;   /* Card borders, dividers */
  --banc-grey:         #8A8880;   /* Secondary text */
  --banc-grey-pale:    #F4F3F1;   /* Page background */
  --banc-gold:         #D4AF37;   /* Premier Homes ONLY */
  --banc-gold-light:   #FBF5DC;   /* Premier tag background */
  --banc-gold-dark:    #7A5C00;   /* Premier tag text */
  --font-serif:        'Source Serif 4', Georgia, serif;
  --font-sans:         'DM Sans', -apple-system, sans-serif;
  --radius-sm:         6px;
  --radius-md:         10px;
  --radius-lg:         16px;
}
```

```js
// tailwind.config.ts extensions
colors: {
  'banc-sky':        '#4AC8E8',
  'banc-sky-light':  '#E8F8FC',
  'banc-sky-dark':   '#1A9BBF',
  'banc-dark':       '#2C2A27',
  'banc-dark-deep':  '#1A1917',
  'banc-dark-mid':   '#3D3B37',
  'banc-grey':       '#8A8880',
  'banc-grey-pale':  '#F4F3F1',
  'banc-gold':       '#D4AF37',
  'banc-gold-light': '#FBF5DC',
},
fontFamily: {
  serif: ['Source Serif 4', 'Georgia', 'serif'],
  sans:  ['DM Sans', '-apple-system', 'sans-serif'],
},
```

---

## Typography Rules

| Role    | Font           | Weight | Size    | Usage |
|---------|---------------|--------|---------|-------|
| Display | Source Serif 4 | 500    | 36-48px | Hero, page covers |
| H1      | Source Serif 4 | 400    | 26-32px | Section titles, property titles |
| H2      | DM Sans        | 500    | 18-22px | Sub-headings, card titles |
| H3      | DM Sans        | 500    | 15-17px | Feature headings |
| Body    | DM Sans        | 400    | 14-16px | All descriptive copy |
| Label   | DM Sans        | 500    | 10-12px | Tags, form labels (UPPERCASE) |
| Caption | DM Sans        | 400    | 10-11px | Timestamps, legal text |

---

## Phase 1 — Audit & Design System Application

### Step 1: Codebase Audit
- List all pages in `src/app/` or `app/`
- List all components
- Check `package.json` dependencies
- Check `.env.local` for configured services
- Fetch Stitch screens for visual reference
- Report findings before proceeding

### Step 2: Install Fonts
```tsx
// src/app/layout.tsx
import { Source_Serif_4, DM_Sans } from 'next/font/google'

const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-serif',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sourceSerif4.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

### Step 3: Apply Tokens
Add CSS variables to `globals.css`, extend `tailwind.config.ts`.

### Step 4: Apply Brand Across All Existing Pages
Reference Stitch screens for accuracy. Update colours, fonts, spacing to match.

---

## Phase 2 — Fix Known Bugs

### Bug 1: Property Search Page Broken (`/sales/properties`)
Page renders only footer. Fix so full search UI with filters and property grid is visible.
Reference: Stitch screen `de3a3f1bd71b48eda8867b1ce0117384`

### Bug 2: Placeholder Text
"AI-generated summary placeholder" visible on homepage cards.
Fix: Use 21st.dev skeleton component while data loads.

### Bug 3: Breadcrumb Data Mismatch
Property detail shows wrong address. Fix data binding.

### Bug 4: Duplicate Agent Card
Agent card appears twice on property detail. Remove duplicate, keep sticky sidebar version.

### Bug 5: Repeating Property Images
Same 2 images on all properties. Implement proper image array per property.

### Bug 6: Nav Header Colour
Ensure nav is consistently `#1A1917`.
Reference: Stitch screen `3dc2b52e7d014fdfb25b31b99b98bec0`

---

## Phase 3 — Complete Unfinished Pages

For every unfinished page, follow this workflow:
1. Check if a Stitch screen exists (see table above)
2. If not, generate one: `stitch:generate_screen_from_text`
3. Source components from 21st.dev
4. Build in Next.js matching the design

### Priority 1 — Core Journey

**`/valuation`** — Valuation Tool
- Source a multi-step stepper from 21st.dev
- 4 steps: Address → Property details → Contact → Results
- Results shows price range, comparable sales, CTA to book in-person valuation
- Send lead via Resend email

**`/sales/properties`** — Property Search (after bug fix)
- Stitch screen `de3a3f1bd71b48eda8867b1ce0117384`
- Filters sidebar, grid/list toggle, map view (Mapbox), sorting, pagination
- Use 21st.dev filter and property card components

**`/lettings`** — Lettings Hub
- Two sections: Landlords / Tenants
- Rental valuation CTA, management services, guides

### Priority 2 — Brand Pages

**`/premier-homes`** — Premier Homes
- Generate Stitch screen first (dark luxury estate agency, gold accents)
- Backgrounds: `#2C2A27` / `#1A1917`
- Gold `#D4AF37` replaces Sky Blue as accent colour
- Source Serif 4 exclusively for all headings

**`/why-us`** — About / Why Banc
- Team grid (use 21st.dev team/avatar card component)
- Stats, Guild membership, awards, testimonials

**`/area-guides`** — Area Guides
- Editorial layout for Cuffley, Mayfair, Hadley Wood

**`/contact`** — Contact Page
- Dual office details, Mapbox map embed, contact form

### Priority 3 — Tools

Use 21st.dev form components for all calculators:
- `/tools/stamp-duty`
- `/tools/mortgage-calculator`
- `/tools/yield-calculator`
- `/tools/affordability`

### Priority 4 — Portal & Auth

**`/login`** — Sign In
- Use 21st.dev auth form component as base
- Magic link + password options
- Supabase Auth integration

**`/portal`** — Vendor Dashboard
- Stitch screen `a1aee91a233d49b193a5a580b3a35322`
- Protected route (Supabase Auth)
- Use 21st.dev stat cards, data table, activity feed components
- Property summary, performance metrics, activity feed, documents, message agent

### Priority 5 — Supporting Pages
Team, track record, Guild, reviews, offices, new homes, land & development, guides (buyers/sellers/landlords), all legal pages.

---

## Phase 4 — Integrations

### Supabase
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```
Tables: `properties`, `contacts`, `viewings`, `vendor_portal_access`, `vendor_activity_feed`, `property_performance_stats`

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### Expert Agent CRM API
Build `src/lib/expert-agent.ts` — sync live property listings to Supabase every 15 min.
```
EXPERT_AGENT_API_URL=
EXPERT_AGENT_API_KEY=
```

### Rightmove BLM Feed
Build `src/lib/rightmove-blm.ts` — generate BLM XML, FTP to Rightmove on schedule.
```
RIGHTMOVE_NETWORK_ID=
RIGHTMOVE_BRANCH_ID=
RIGHTMOVE_FTP_HOST=
RIGHTMOVE_FTP_USER=
RIGHTMOVE_FTP_PASSWORD=
```

### Resend (Email)
```bash
npm install resend
```
```
RESEND_API_KEY=
```

### Sanity CMS
```bash
npm install @sanity/client next-sanity
```
```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
SANITY_API_TOKEN=
```

---

## Component Architecture

```
src/
  components/
    ui/           # Base UI — source from 21st.dev (Button, Input, Badge, Card)
    property/     # PropertyCard, PropertyGallery, PropertyDetail, PropertyStats
    search/       # SearchBar, FilterPanel, PropertyGrid, MapView
    portal/       # Dashboard, ActivityFeed, PerformanceStats, DocumentList
    forms/        # ValuationForm, ContactForm, EnquiryForm
    layout/       # Header, Footer, MobileNav, Breadcrumb
    sections/     # Hero, FeaturedProperties, Services, Reviews, Partners
```

---

## Git Workflow

```bash
git add .
git commit -m "Phase X: [description]"
git push origin main
```

---

## Definition of Done

- [ ] Source Serif 4 (headings) + DM Sans (body/UI) applied throughout
- [ ] Banc Sky (#4AC8E8) on all interactive elements
- [ ] Nav header #1A1917 consistently
- [ ] Property search page fully functional
- [ ] No duplicate components
- [ ] Valuation tool captures leads
- [ ] Premier Homes gold accent isolated correctly
- [ ] Vendor portal behind Supabase Auth
- [ ] All calculators working
- [ ] Expert Agent sync live
- [ ] Rightmove BLM feed publishing
- [ ] Lighthouse > 90
- [ ] Mobile responsive throughout
- [ ] Zero console errors in production

---

## Credentials Needed (Ask Client — Nitesh, Banc Property Group)

- Expert Agent API credentials
- Rightmove BLM FTP credentials
- Supabase project details
- Sanity project ID

If blocked on credentials, complete all frontend phases first and leave clear TODO comments.

---

*Prepared by Claude (Anthropic) — March 2026*
*Stitch Project: `3974286054584858030` | Design System: `10087854773533194260`*
*Screens: Homepage `3dc2b52e7d014fdfb25b31b99b98bec0` | Search `de3a3f1bd71b48eda8867b1ce0117384` | Portal `a1aee91a233d49b193a5a580b3a35322`*

---


---

## Claude Superpowers Plugin — Activate at Session Start

The Claude Superpowers plugin is a structured, agentic skills framework built for Claude Code. It enforces a **seven-phase software development workflow** that ensures every task is properly planned, implemented, tested, and reviewed before being committed. It uses sub-agents for autonomous operation and Git worktrees for clean branch organisation.

**The seven phases Superpowers enforces:**

| Phase | Name | What Happens |
|-------|------|-------------|
| 1 | Brainstorm | Explore approaches before committing to one |
| 2 | Plan | Create a detailed, step-by-step implementation plan |
| 3 | Implement | Write the actual code following the plan |
| 4 | Test (TDD) | Write and run tests to verify the implementation |
| 5 | Review | Self-review for quality, edge cases, and brand consistency |
| 6 | Commit | Commit to Git with a clear, descriptive message |
| 7 | Reflect | Note what was learned / what to carry into the next task |

**Why this matters for the Banc build:**
- Prevents the sub-agent from skipping planning and jumping straight to code
- TDD phase ensures the property search, valuation tool, and portal all work correctly before moving on
- Git worktrees keep each phase's work isolated — no half-finished changes in main
- The review phase explicitly checks for brand consistency (correct colours, fonts, spacing) before anything is committed
- The reflect phase builds institutional knowledge across the session so later phases benefit from earlier learnings

**How to activate Superpowers in your Claude Code opening prompt:**

```
Enable the Claude Superpowers plugin.
Read CLAUDE_CODE_INSTRUCTIONS.md in full.
Then begin Phase 1 of the build instructions using the full 
seven-phase Superpowers workflow for every task.
Do not skip the brainstorm and plan phases — produce a written 
plan before writing any code.
```

**Per-task workflow with Superpowers active:**

For every task in this build (applying brand tokens, fixing a bug, building a new page), Superpowers should enforce this sequence:

```
Phase 1 — BRAINSTORM
  "What are the different ways I could approach this?"
  Consider: existing code, Stitch design reference, 21st.dev components
  
Phase 2 — PLAN  
  Write out the exact steps before touching any file
  Include: which files change, what order, what the acceptance criteria is
  Use Sequential Thinking MCP here to structure the plan

Phase 3 — IMPLEMENT
  Follow the plan. Reference Stitch screen for visual accuracy.
  Use 21st.dev for any UI components needed.
  
Phase 4 — TEST
  Write tests for logic (calculators, form validation, data fetching)
  Manual browser check for UI (does it match the Stitch design?)
  Verify on Vercel preview URL
  
Phase 5 — REVIEW
  Does every colour match the brand tokens?
  Is the typography correct (Source Serif 4 headings, DM Sans body)?
  Is it mobile responsive?
  Any console errors?
  
Phase 6 — COMMIT
  git add . && git commit -m "Phase X: [clear description]"
  git push origin main
  
Phase 7 — REFLECT
  What worked? What was tricky?
  What should the next task know about what was just built?
```

---

## Sequential Thinking — Use Inside Phase 2 (Plan)

Sequential Thinking is a separate MCP tool that pairs with Superpowers. Use it specifically inside **Phase 2 (Plan)** of every Superpowers cycle to think through interdependencies and task ordering before writing the implementation plan.

**When Sequential Thinking is especially critical:**
- Before applying brand tokens (many files, specific order matters)
- Before fixing any bug where the root cause is unclear
- Before any integration work (Expert Agent, Rightmove, Supabase)
- Before building the vendor portal (complex auth + data dependencies)

**How to invoke it:**
```
Use the Sequential Thinking MCP tool to reason through this step by step:
1. What currently exists in the codebase relevant to this task?
2. What dependencies does this task have on other tasks?
3. What is the correct order of operations?
4. What could break if done incorrectly?
5. What is the precise definition of done for this task?
Output a numbered plan, then proceed to Phase 3 (Implement).
```

**Example — Sequential Thinking applied to brand token rollout:**
```
Sequential Thinking:
1. Tokens must go into globals.css and tailwind.config BEFORE touching any component
2. layout.tsx font configuration must come BEFORE any page uses the font variables
3. Apply tokens to layout components (Header, Footer) BEFORE page-specific components
4. Apply to shared/ui components BEFORE page-level assemblies
5. Verify each step with a browser check before moving to the next layer
6. Definition of done: no hardcoded hex values remain, all fonts use CSS variables
```

---

## The Complete Power Stack — How All Tools Work Together

This is the recommended workflow for every non-trivial task in this build:

```
1. SUPERPOWERS PHASE 1 — Brainstorm
   "What approaches could I take? What does Stitch show for this page?"
   → stitch:fetch_screen_image to see the target design

2. SUPERPOWERS PHASE 2 — Plan (with Sequential Thinking)
   Use Sequential Thinking MCP to reason through the task
   Write a numbered implementation plan

3. SUPERPOWERS PHASE 3 — Implement
   → 21st_magic_component_inspiration to browse available components
   → 21st_magic_component_builder to generate the specific component
   → stitch:fetch_screen_code for HTML reference
   → Write Next.js/React implementation

4. SUPERPOWERS PHASE 4 — Test
   Run tests, check Vercel preview, verify against Stitch design

5. SUPERPOWERS PHASE 5 — Review
   Brand consistency check: colours, fonts, spacing, mobile

6. SUPERPOWERS PHASE 6 — Commit
   git commit -m "Phase X: [description]" && git push

7. SUPERPOWERS PHASE 7 — Reflect
   Note learnings for next task
```

**This stack — Superpowers + Sequential Thinking + Stitch + 21st.dev — is the complete methodology for this build.** Using all four tools together consistently will produce significantly higher quality, more consistent output than using any of them alone.

---

*Prepared by Claude (Anthropic) — March 2026*
*Stitch Project: `3974286054584858030` | Design System: `10087854773533194260`*
*Screens: Homepage `3dc2b52e7d014fdfb25b31b99b98bec0` | Search `de3a3f1bd71b48eda8867b1ce0117384` | Portal `a1aee91a233d49b193a5a580b3a35322`*
