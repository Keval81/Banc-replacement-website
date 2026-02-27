# Agent 2: Authentication & User Management

## Your Mission
Implement complete authentication and user management system with favorites and applicant registration.

## Context
- Next.js 14+ App Router
- Project: ~/Projects/banc-website
- Database: Prisma-ready (schema in docs)
- No current auth system

## Deliverables

### 1. NextAuth Setup
Install and configure NextAuth.js v5 (Auth.js):
- Email/password provider with bcrypt
- Google OAuth provider
- Session strategy with JWT
- Prisma adapter for database persistence

Files to create:
- `app/api/auth/[...nextauth]/route.ts`
- `lib/auth.ts` - Auth configuration
- `middleware.ts` - Route protection
- `prisma/schema.prisma` - Add auth models

### 2. User Types
```typescript
interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: 'applicant' | 'vendor' | 'landlord' | 'admin';
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  favorites: Favorite[];
  alerts: Alert[];
  requirements?: PropertyRequirements;
}
```

### 3. Favorites System
- `POST /api/favorites` - Add favorite
- `DELETE /api/favorites/[id]` - Remove favorite
- `GET /api/favorites` - List user favorites
- Update PropertyCard with working heart button
- Anonymous favorites (localStorage) that sync on login

### 4. Applicant Registration Flow
Create multi-step registration:
1. Basic info (name, email, phone)
2. Property requirements (type, beds, price range, locations)
3. Timeline and additional notes
4. Confirmation

Pages:
- `/register` - Registration page
- `/login` - Login page
- `/account` - Account dashboard
- `/account/requirements` - Edit requirements

### 5. Protected Routes
Protect these routes (redirect to login):
- `/account/*`
- `/favorites`
- `/alerts`

### 6. Auth UI Components
- Login form with validation
- Registration form with validation
- Password reset flow
- Account sidebar navigation
- User dropdown in header

## Files to Modify
- `app/components/Header.tsx` - Add auth buttons/user menu
- `app/components/PropertyCard.tsx` - Wire up favorites
- `app/layout.tsx` - Add AuthProvider

## Database Schema Additions
Add to Prisma schema:
- Account, Session, User, VerificationToken (NextAuth)
- Favorite model
- Alert model
- PropertyRequirements model

## Success Criteria
- [ ] Users can register and login
- [ ] Favorites persist for logged-in users
- [ ] Anonymous favorites sync on login
- [ ] Protected routes require auth
- [ ] All auth flows work end-to-end
