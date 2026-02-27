# Authentication & User Management System

## Overview
Complete authentication and user management system implemented for Banc Property Group website.

## Features Implemented

### 1. NextAuth.js v5 Setup
- **Location**: `lib/auth.ts`
- **Providers**:
  - Email/Password (Credentials)
  - Google OAuth (configured, requires env vars)
- **Session Strategy**: JWT with database persistence
- **Adapter**: Prisma Adapter for database integration

### 2. Database Schema
- **Location**: `prisma/schema.prisma`
- **Models**:
  - User (with roles: applicant, vendor, landlord, admin)
  - Account, Session, VerificationToken (NextAuth standard)
  - Favorite (user saved properties)
  - Alert (property alerts)
  - PropertyRequirements (applicant preferences)

### 3. API Routes
- `POST /api/auth/[...nextauth]` - NextAuth handler
- `POST /api/auth/register` - User registration
- `GET /api/favorites` - List user favorites
- `POST /api/favorites` - Add favorite
- `DELETE /api/favorites/[id]` - Remove favorite
- `POST /api/favorites/sync` - Sync anonymous favorites on login

### 4. Protected Routes (via middleware)
- `/account/*` - User account dashboard
- `/favorites` - Saved properties
- `/alerts` - Property alerts

### 5. Pages Created
- `/login` - Sign in page with email/password + Google
- `/register` - Multi-step registration form:
  - Step 1: Basic info (name, email, phone, password)
  - Step 2: Property requirements (type, beds, price, locations)
  - Step 3: Timeline and notes
  - Step 4: Review and confirm
- `/account` - Account dashboard with overview
- `/account/requirements` - Edit property requirements
- `/favorites` - View and manage saved properties
- `/alerts` - Property alerts (placeholder for future)

### 6. Components Updated
- **Header** (`app/components/Header.tsx`):
  - User dropdown menu (authenticated)
  - Sign In/Register buttons (unauthenticated)
  - Favorites quick link
  - Mobile auth menu
- **PropertyCard** (`app/components/PropertyCard.tsx`):
  - Working heart button for favorites
  - Visual feedback (filled heart when favorited)
  - Anonymous favorites support (localStorage)
- **AuthProvider** (`components/AuthProvider.tsx`):
  - Wraps app with NextAuth session provider

### 7. Custom Hooks
- **useFavorites** (`app/hooks/useFavorites.ts`):
  - Manages favorites state
  - Syncs between localStorage (anonymous) and database (authenticated)
  - Automatically syncs on login

### 8. UI Components
- `components/ui/input.tsx` - Form input component
- `components/ui/label.tsx` - Form label component
- `components/ui/textarea.tsx` - Textarea component

## Environment Variables
Add to `.env.local`:
```bash
# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/banc_db"
```

## Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up database**:
   ```bash
   # Update DATABASE_URL in .env.local
   npx prisma migrate dev --name init
   npx prisma generate
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

## Anonymous Favorites Flow
1. Non-logged-in users can click heart on properties
2. Favorites stored in localStorage
3. On login, favorites automatically sync to user's account
4. localStorage cleared after successful sync

## User Roles
- **applicant** - Looking to buy/rent (default)
- **vendor** - Selling a property
- **landlord** - Renting out properties
- **admin** - Full system access

## Next Steps for Full Production
1. Configure Google OAuth credentials
2. Set up production database (PostgreSQL)
3. Run database migrations
4. Set up email service for password reset
5. Implement actual property alert notifications
6. Add email verification flow
7. Set up rate limiting on auth endpoints