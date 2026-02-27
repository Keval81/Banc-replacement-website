# Agent 1: Property Core & API Layer

## Your Mission
Build the foundational property data API layer and optimize media delivery for the Banc Property website.

## Context
- This is a Next.js 14+ project using App Router
- Located at: ~/Projects/banc-website
- Tech stack: Next.js, TypeScript, Tailwind CSS, Prisma (ready), shadcn/ui
- Current properties use static mock data

## Deliverables

### 1. Property API Layer (app/api/properties/)
Create these API routes:
- `GET /api/properties` - List properties with filters (price, beds, type, location)
- `GET /api/properties/[id]` - Single property detail
- `GET /api/properties/featured` - Featured listings for homepage
- `GET /api/properties/premier` - £1M+ properties for Premier Homes

Use the CRM Data Model structure from the project root.

### 2. Image Optimization
- Replace direct Unsplash URLs with Next.js `<Image>` component
- Implement WebP conversion where possible
- Add blur placeholders for all property images
- Create image CDN wrapper component

### 3. Structured Data (Schema.org)
Add JSON-LD structured data to:
- Property detail pages: `RealEstateListing` schema
- Homepage: `Organization` + `LocalBusiness` schema
- Area guides: `Place` schema
- Team pages: `Person` schema

### 4. Property Types
types/property.ts:
```typescript
interface Property {
  id: string;
  title: string;
  address: {
    line1: string;
    line2?: string;
    town: string;
    postcode: string;
    latitude?: number;
    longitude?: number;
  };
  price: {
    amount: number;
    qualifier?: 'guide_price' | 'oiro' | 'offers_over';
  };
  status: 'for_sale' | 'under_offer' | 'sold' | 'withdrawn';
  details: {
    bedrooms: number;
    bathrooms: number;
    receptions: number;
    sqft?: number;
    propertyType: string;
    tenure?: string;
    epcRating?: string;
  };
  media: {
    images: string[];
    floorplan?: string;
    video?: string;
    virtualTour?: string;
  };
  description: string;
  features: string[];
  councilTaxBand?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 5. Mock Data Expansion
Expand the current mock properties to 20+ realistic listings with:
- Varied price points (£300K - £15M)
- Different property types
- Full image sets (use high-quality Unsplash)
- Complete descriptions

## File Outputs
- Write all code to ~/Projects/banc-website/
- Update existing components to use new types
- Do NOT delete existing pages - enhance them

## Success Criteria
- [ ] All API routes return valid JSON
- [ ] Image optimization reduces load times
- [ ] Schema.org markup validates in Google's tool
- [ ] TypeScript types are comprehensive
- [ ] Existing pages still work after changes
