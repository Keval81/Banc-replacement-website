# Agent 8: SEO & Performance

## Your Mission
Optimize the site for search engines and performance excellence.

## Context
- Next.js 14+ with App Router
- Project: ~/Projects/banc-website
- Target: 100/100 Lighthouse score

## Deliverables

### 1. Meta Tags & Open Graph
Create comprehensive metadata:

**For each page type:**
- Unique, descriptive title (50-60 chars)
- Compelling description (150-160 chars)
- Open Graph images (1200x630)
- Twitter Card meta
- Canonical URLs

**Dynamic OG Images:**
- Create API route for dynamic OG images
- Property pages show property image + price
- Use @vercel/og or similar

**File:** `app/api/og/route.tsx`

### 2. Structured Data Enhancement
Expand Schema.org implementation:

**Property Pages:**
```json
{
  "@context": "https://schema.org",
  "@type": "RealEstateListing",
  "name": "Property Title",
  "description": "...",
  "url": "...",
  "image": [...],
  "offers": {
    "@type": "Offer",
    "price": "...",
    "priceCurrency": "GBP"
  },
  "address": {...}
}
```

**BreadcrumbList:**
- Add to all pages
- Reflect site hierarchy

**Organization:**
- Banc Property Group details
- SameAs links (social profiles)

**LocalBusiness:**
- Cuffley office
- Mayfair office

**FAQPage:**
- Mark up FAQ section

### 3. XML Sitemap
Create `app/sitemap.xml/route.ts`:
- Dynamic sitemap generation
- Include all static pages
- Include all property pages
- Proper lastmod, changefreq, priority

### 4. Robots.txt
Create `app/robots.ts`:
- Allow all important pages
- Disallow: /api/, /account/ (private)
- Sitemap reference

### 5. Core Web Vitals Optimization

**LCP (Largest Contentful Paint):**
- Preload hero images
- Use next/image priority
- Optimize above-fold content

**CLS (Cumulative Layout Shift):**
- Fixed dimensions for images
- Reserve space for dynamic content
- Font display swap

**FID/INP (Interaction):**
- Code splitting
- Lazy load below-fold
- Minimize JS bundles

### 6. Performance Monitoring
Add Vercel Analytics or similar:
- `npm i @vercel/analytics`
- Add to layout
- Core Web Vitals tracking

### 7. Image Optimization Audit
Review all images:
- Convert to WebP where possible
- Ensure proper sizing
- Add blur placeholders
- Lazy load below-fold

### 8. Page Speed Checklist
- [ ] Minimize CSS/JS
- [ ] Enable compression (brotli)
- [ ] CDN for static assets
- [ ] Preconnect to external domains
- [ ] Font optimization

### 9. SEO Checklist
- [ ] All pages have unique titles
- [ ] Meta descriptions everywhere
- [ ] Proper heading hierarchy (H1 → H6)
- [ ] Alt text on all images
- [ ] Internal linking strategy
- [ ] 404 page
- [ ] 500 error page

### 10. Search Console Setup
Create verification file and instructions:
- Google Search Console
- Bing Webmaster Tools

## Files
```
app/
  api/
    og/
      route.tsx
  sitemap.xml/
    route.ts
  robots.ts
  not-found.tsx
  error.tsx
lib/
  seo.ts - SEO utilities
components/
  JsonLd.tsx - Structured data component
```

## Success Criteria
- [ ] 100/100 Lighthouse Performance
- [ ] 100/100 Lighthouse SEO
- [ ] 100/100 Lighthouse Accessibility
- [ ] All pages have unique metadata
- [ ] OG images work on social share
- [ ] Sitemap validates
- [ ] Structured data validates
