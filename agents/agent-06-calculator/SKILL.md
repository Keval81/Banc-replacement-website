# Agent 6: Calculators & Tools

## Your Mission
Build interactive calculators and tools that exceed competitor functionality.

## Context
- Next.js 14+ with App Router
- Project: ~/Projects/banc-website
- Need: Stamp Duty, Mortgage, and Valuation tools

## Deliverables

### 1. Stamp Duty Calculator
Create `/tools/stamp-duty/page.tsx`:

**Features:**
- Property price input with slider
- Buyer type: First-time buyer, Home mover, Additional property
- Location: England/NI, Scotland (LBTT), Wales (LTT)
- Live calculation as user types
- Breakdown table showing:
  - Tax bands
  - Rate for each band
  - Tax payable per band
  - Total tax
- Comparison: "You save £X as first-time buyer"

**Formula:**
- England/NI standard rates
- First-time buyer relief (up to £425K)
- Additional 3% for second homes

Component: `components/StampDutyCalculator.tsx`

### 2. Mortgage Calculator
Create `/tools/mortgage-calculator/page.tsx`:

**Features:**
- Property price
- Deposit amount (with % toggle)
- Interest rate (with market avg preset)
- Mortgage term (years)
- Repayment type: Capital & Interest, Interest Only

**Outputs:**
- Monthly payment
- Total interest payable
- Total cost of mortgage
- Loan-to-value ratio
- Affordability indicator

**Advanced:**
- "How much can I borrow?" reverse calculator
- Overpayment calculator
- Interest rate change impact

Components:
- `components/MortgageCalculator.tsx`
- `components/AffordabilityCalculator.tsx`

### 3. Valuation Tool Integration
Enhance `/valuation/page.tsx`:

**Features:**
- Address lookup (postcode → addresses)
- Property type selector
- Bedroom/bathroom counts
- Condition rating
- Recent improvements
- Instant estimate display
- "Book full valuation" CTA

**Note:** Build UI ready for AVM API integration. Use mock estimate for now.

### 4. Rental Yield Calculator
Create `/tools/rental-yield/page.tsx`:

**Features:**
- Property purchase price
- Monthly rent
- Annual costs (maintenance, voids, insurance)
- Calculate gross and net yield
- Compare to area average

### 5. Tools Landing Page
Create `/tools/page.tsx`:
- Grid of available tools
- Brief description of each
- Links to individual tools

## Components
```
components/
  calculators/
    StampDutyCalculator.tsx
    MortgageCalculator.tsx
    RentalYieldCalculator.tsx
    AffordabilityCalculator.tsx
    CalculatorResult.tsx
app/
  tools/
    page.tsx
    stamp-duty/
      page.tsx
    mortgage-calculator/
      page.tsx
    rental-yield/
      page.tsx
    layout.tsx
```

## Design
- Card-based layout
- Large, clear number displays
- Charts where appropriate (recharts)
- Mobile-optimized inputs
- Share results button

## Success Criteria
- [ ] Stamp Duty accurate for all UK regions
- [ ] Mortgage calculator shows amortization
- [ ] All tools are mobile-friendly
- [ ] Results can be shared/printed
- [ ] Tools are linked from relevant pages
