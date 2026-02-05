# FLUX Auto - Platform Documentation

> **Version**: 1.0.0  
> **Last Updated**: February 2026  
> **Platform**: Vehicle Marketplace with Market Intelligence

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Platform Architecture](#platform-architecture)
3. [User Roles & Authentication](#user-roles--authentication)
4. [Pages & Routes](#pages--routes)
5. [Core Features](#core-features)
6. [Intelligence Layer (Phase 7)](#intelligence-layer-phase-7)
7. [Database Schema](#database-schema)
8. [Storage & Media](#storage--media)
9. [Email System](#email-system)
10. [Security & RLS Policies](#security--rls-policies)
11. [API & Edge Functions](#api--edge-functions)

---

## Executive Summary

FLUX Auto is a comprehensive vehicle marketplace platform designed for the Kenyan automotive market. It connects three key stakeholders:

- **Buyers**: Browse verified vehicles with market intelligence insights
- **Dealers**: List inventory, request vehicle imports, manage verification
- **Importers**: Accept and fulfill dealer import requests

The platform features a unique **Market Intelligence Layer** that provides data-driven insights including confidence scores, price positioning, demand analysis, and dealer trust metrics.

---

## Platform Architecture

### Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| State Management | React Query (TanStack Query) |
| Routing | React Router v6 |
| Backend | Supabase (Lovable Cloud) |
| Database | PostgreSQL |
| Authentication | Supabase Auth |
| Storage | Supabase Storage |
| Email | Resend API |

### Project Structure

```
src/
├── components/
│   ├── admin/           # Admin dashboard components
│   ├── dashboard/       # Shared dashboard components
│   ├── dealer/          # Dealer-specific components
│   ├── importer/        # Importer-specific components
│   ├── marketplace/     # Marketplace components (cards, modals, filters)
│   ├── navbar/          # Navigation components
│   └── ui/              # shadcn/ui components
├── contexts/
│   └── AuthContext.tsx  # Authentication context provider
├── hooks/
│   ├── useMarketIntelligence.ts  # Intelligence layer hooks
│   └── usePhotoUpload.ts         # Photo upload hook
├── pages/
│   ├── AdminDashboard.tsx
│   ├── BuyerDashboard.tsx
│   ├── DealerDashboard.tsx
│   ├── ImporterDashboard.tsx
│   ├── Marketplace.tsx
│   └── ...
└── integrations/
    └── supabase/        # Supabase client & types
```

---

## User Roles & Authentication

### Role Types

| Role | Description | Approval Required |
|------|-------------|-------------------|
| `buyer` | Can browse marketplace, save vehicles, contact dealers | Auto-approved |
| `dealer` | Can list vehicles, request imports, manage inventory | Admin approval required |
| `importer` | Can accept import requests, manage shipments | Admin approval required |
| `admin` | Full platform access, user management, verification | Manual creation |

### Authentication Flow

1. User signs up at `/auth` with email/password
2. User selects their role (Buyer, Dealer, or Importer)
3. Email verification required
4. Buyers: Immediately redirected to dashboard
5. Dealers/Importers: Redirected to `/pending-approval` until admin approves

### Role Storage

Roles are stored in a dedicated `user_roles` table (not in profiles) to prevent privilege escalation attacks.

```sql
CREATE TYPE app_role AS ENUM ('buyer', 'dealer', 'importer', 'admin');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    role app_role NOT NULL,
    status approval_status DEFAULT 'pending',
    approved_at TIMESTAMPTZ,
    approved_by UUID,
    rejected_at TIMESTAMPTZ,
    rejected_by UUID,
    rejection_reason TEXT
);
```

---

## Pages & Routes

### Public Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing Page | Hero section, problem/solution, waitlist CTA |
| `/marketplace` | Marketplace | Browse all available vehicles with filters |
| `/waitlist` | Waitlist | Pre-launch email signup form |
| `/auth` | Authentication | Login and signup with role selection |

### Protected Pages

| Route | Page | Required Role | Description |
|-------|------|---------------|-------------|
| `/dashboard/buyer` | Buyer Dashboard | buyer | Saved vehicles, contact history |
| `/dashboard/dealer` | Dealer Dashboard | dealer | Inventory, import requests, verification |
| `/dashboard/importer` | Importer Dashboard | importer | Available requests, shipments |
| `/admin/dashboard` | Admin Dashboard | admin | User management, verification, insights |
| `/pending-approval` | Pending Approval | any (pending) | Shown while awaiting admin approval |

---

## Core Features

### 1. Marketplace

**Location**: `/marketplace`

**Features**:
- Vehicle grid with responsive cards
- Advanced filtering (make, model, year, price range, fuel type, condition)
- Favorites/saved vehicles (authenticated users)
- Vehicle detail modal with full specifications
- Intelligence badges on cards (confidence score, price position, demand)
- Contact dealer functionality

**Components**:
- `VehicleCard.tsx` - Individual vehicle display
- `VehicleFilters.tsx` - Filter sidebar
- `VehicleDetailModal.tsx` - Full vehicle details
- `IntelligenceBadges.tsx` - Market intelligence indicators

### 2. Dealer Dashboard

**Location**: `/dashboard/dealer`

**Tabs**:

| Tab | Functionality |
|-----|---------------|
| **Inventory** | Add/edit/delete vehicles, photo upload, price guidance |
| **Import Requests** | Create new import requests for specific vehicles |
| **My Imports** | Track status of import requests |

**Key Features**:
- Vehicle form with validation
- Drag-and-drop photo upload (10MB limit)
- Photo reordering for primary image selection
- Real-time price guidance from market data
- Request verification button
- Import request workflow

### 3. Importer Dashboard

**Location**: `/dashboard/importer`

**Tabs**:

| Tab | Functionality |
|-----|---------------|
| **Available Requests** | View and accept open import requests |
| **My Shipments** | Manage accepted requests (in transit, cleared) |
| **Delivered** | Mark shipments as delivered |

**Status Flow**:
```
requested → accepted → in_transit → cleared → delivered → received
```

### 4. Buyer Dashboard

**Location**: `/dashboard/buyer`

**Tabs**:

| Tab | Functionality |
|-----|---------------|
| **Saved Vehicles** | View favorited vehicles |
| **Contact History** | Track contact requests sent to dealers |

### 5. Admin Dashboard

**Location**: `/admin/dashboard`

**Tabs**:

| Tab | Functionality |
|-----|---------------|
| **User Management** | Approve/reject dealer & importer signups |
| **Vehicle Verification** | Verify or reject vehicle listings |
| **Email Templates** | Manage notification email templates |
| **Email Logs** | View sent email history |
| **Insights** | Platform analytics and metrics |
| **Audit Trail** | View all admin actions |

**Key Features**:
- Real-time activity feed
- Notification bell for pending actions
- Audit logging for all admin decisions

---

## Intelligence Layer (Phase 7)

The Market Intelligence Layer provides data-driven insights to enhance marketplace trust and buyer decision-making.

### Components

#### 1. Confidence Score (0-100)

A weighted reliability metric displayed on vehicle cards.

**Calculation**:
```typescript
const weights = {
  pricePosition: 0.3,    // How price compares to market
  demandRatio: 0.2,      // Supply vs demand
  dealerTrust: 0.25,     // Dealer fulfillment rate
  riskPenalty: 0.15,     // Risk flags
  verifiedBonus: 0.1,    // Admin verification
};
```

#### 2. Price Position Badges

| Badge | Condition | Color |
|-------|-----------|-------|
| Below Market | Price < avg - 10% | Green |
| Fair Price | Within ±10% of avg | Blue |
| Above Market | Price > avg + 10% | Amber |

#### 3. Demand Badges

| Badge | Condition |
|-------|-----------|
| High Demand | demand_ratio > 1.5 |
| Moderate Demand | demand_ratio 0.5-1.5 |

#### 4. FLUX Verified Badge

Displayed when `verification_status = 'verified'` (admin approved).

#### 5. Risk Indicators

Flags displayed when risks detected:
- Price significantly below market
- Missing or limited photos
- Incomplete vehicle data
- New dealer (< 30 days)

### Database Views

```sql
-- Market pricing statistics
CREATE VIEW market_pricing_stats AS
SELECT make, model, year,
       COUNT(*) as vehicle_count,
       AVG(price) as avg_price,
       MIN(price) as min_price,
       MAX(price) as max_price,
       STDDEV(price) as price_stddev
FROM vehicles WHERE is_sold = false
GROUP BY make, model, year;

-- Market demand statistics
CREATE VIEW market_demand_stats AS
SELECT make, model,
       available_count,
       request_count,
       request_count::numeric / NULLIF(available_count, 0) as demand_ratio
FROM ...;

-- Dealer trust statistics
CREATE VIEW dealer_trust_stats AS
SELECT dealer_id,
       total_listings,
       active_listings,
       total_imports,
       fulfilled_imports,
       fulfillment_rate,
       member_since
FROM ...;

-- Vehicle risk flags
CREATE VIEW vehicle_risk_flags AS
SELECT vehicle_id,
       price_below_market,
       missing_photos,
       incomplete_data,
       new_dealer,
       risk_score
FROM ...;
```

### React Hooks

```typescript
// Market pricing for a specific vehicle
useMarketPricing(make, model, year)

// Market demand for make/model
useMarketDemand(make, model)

// Dealer trust metrics
useDealerTrust(dealerId)

// Vehicle risk assessment
useVehicleRisk(vehicleId)
```

---

## Database Schema

### Core Tables

#### `profiles`
User profile information synced from auth.users.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (matches auth.users.id) |
| email | TEXT | User email |
| full_name | TEXT | Display name |
| created_at | TIMESTAMPTZ | Registration date |
| updated_at | TIMESTAMPTZ | Last update |

#### `user_roles`
User roles with approval workflow.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | References auth.users |
| role | app_role | buyer/dealer/importer/admin |
| status | approval_status | pending/approved/rejected |
| approved_at | TIMESTAMPTZ | Approval timestamp |
| approved_by | UUID | Admin who approved |
| rejected_at | TIMESTAMPTZ | Rejection timestamp |
| rejected_by | UUID | Admin who rejected |
| rejection_reason | TEXT | Reason for rejection |

#### `vehicles`
Vehicle inventory listings.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| dealer_id | UUID | Owner dealer |
| import_request_id | UUID | Link to import (if applicable) |
| make | TEXT | Vehicle make (Toyota, Honda, etc.) |
| model | TEXT | Vehicle model |
| year | INTEGER | Manufacturing year |
| condition | vehicle_condition | new/used/certified_pre_owned |
| fuel_type | fuel_type | petrol/diesel/electric/hybrid |
| engine_capacity | TEXT | Engine size (e.g., "2.0L") |
| mileage | INTEGER | Odometer reading |
| price | NUMERIC | Listing price |
| negotiable | BOOLEAN | Price negotiable flag |
| color | TEXT | Vehicle color |
| transmission | TEXT | Manual/Automatic |
| description | TEXT | Detailed description |
| photos | TEXT[] | Array of storage URLs |
| is_sold | BOOLEAN | Sold status |
| verification_status | TEXT | pending/verified/rejected |
| verification_notes | TEXT | Admin notes |
| verified_at | TIMESTAMPTZ | Verification timestamp |
| verified_by | UUID | Verifying admin |

#### `dealer_import_requests`
Import requests from dealers to importers.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| dealer_id | UUID | Requesting dealer |
| importer_id | UUID | Assigned importer (nullable) |
| make | TEXT | Requested make |
| model | TEXT | Requested model |
| year | INTEGER | Requested year |
| budget | NUMERIC | Maximum budget |
| specs | TEXT | Additional specifications |
| status | import_status | Current status |
| accepted_at | TIMESTAMPTZ | When importer accepted |
| delivered_at | TIMESTAMPTZ | When delivered |

**Import Status Flow**:
```
requested → accepted → in_transit → cleared → delivered → received
```

#### `favorites`
User saved vehicles.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | User who saved |
| vehicle_id | UUID | Saved vehicle |
| created_at | TIMESTAMPTZ | When saved |

#### `contact_requests`
Buyer inquiries to dealers.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| vehicle_id | UUID | Vehicle of interest |
| buyer_id | UUID | Inquiring buyer |
| buyer_name | TEXT | Buyer's name |
| buyer_email | TEXT | Buyer's email |
| buyer_phone | TEXT | Buyer's phone |
| message | TEXT | Inquiry message |
| read_at | TIMESTAMPTZ | When dealer read it |

#### `waitlist`
Pre-launch signup list.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Signup name |
| email | TEXT | Signup email |
| phone_number | TEXT | Phone number |
| role | TEXT | Interested role |

### Admin Tables

#### `approval_audit`
Immutable log of admin actions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Affected user |
| performed_by | UUID | Admin who acted |
| performed_at | TIMESTAMPTZ | When action occurred |
| role | app_role | User's role |
| action | TEXT | approve/reject |
| rejection_reason | TEXT | Reason if rejected |

#### `email_templates`
Customizable email templates.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| template_type | TEXT | Template identifier |
| subject | TEXT | Email subject |
| body_html | TEXT | HTML body |
| updated_by | UUID | Last editor |

#### `email_logs`
Email delivery tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| recipient_email | TEXT | Recipient |
| recipient_user_id | UUID | User ID if known |
| email_type | TEXT | Template type used |
| status | TEXT | pending/sent/failed |
| sent_at | TIMESTAMPTZ | Delivery time |
| error_message | TEXT | Error if failed |

### Enum Types

```sql
CREATE TYPE app_role AS ENUM ('buyer', 'dealer', 'importer', 'admin');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE vehicle_condition AS ENUM ('new', 'used', 'certified_pre_owned');
CREATE TYPE fuel_type AS ENUM ('petrol', 'diesel', 'electric', 'hybrid', 'plug_in_hybrid');
CREATE TYPE import_status AS ENUM ('requested', 'accepted', 'in_transit', 'cleared', 'delivered', 'received');
```

---

## Storage & Media

### Storage Buckets

| Bucket | Purpose | Public | Max Size |
|--------|---------|--------|----------|
| `vehicle-photos` | Vehicle images | Yes | 10MB |

### Upload Flow

1. Client compresses image (if needed)
2. Upload to `vehicle-photos/{user_id}/{filename}`
3. Get public URL
4. Store URL in vehicle's `photos` array

### RLS Policies

```sql
-- Public read access
CREATE POLICY "Public can view vehicle photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'vehicle-photos');

-- Dealers can upload to their folder
CREATE POLICY "Dealers can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vehicle-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND has_role(auth.uid(), 'dealer')
);
```

---

## Email System

### Email Types

| Type | Trigger | Recipients |
|------|---------|------------|
| `approval_approved` | Admin approves user | User |
| `approval_rejected` | Admin rejects user | User |
| `verification_approved` | Admin verifies vehicle | Dealer |
| `verification_rejected` | Admin rejects vehicle | Dealer |
| `waitlist_confirmation` | Waitlist signup | Signup |

### Edge Functions

#### `send-verification-email`
Sends templated emails via Resend API.

#### `waitlist-signup`
Handles waitlist signups and confirmation emails.

### Required Secrets

| Secret | Purpose |
|--------|---------|
| `RESEND_API_KEY` | Resend email API |

---

## Security & RLS Policies

### Key Security Principles

1. **Roles in separate table**: Prevents privilege escalation
2. **Security definer functions**: `has_role()`, `get_user_role()` bypass RLS
3. **Immutable audit logs**: Cannot update or delete audit records
4. **Path-based storage ownership**: Users can only access their folders

### RLS Summary by Table

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | Own + Admin + Related | Own | Own | ❌ |
| user_roles | Own + Admin | Own (signup) | Admin | Admin |
| vehicles | All (unsold) + Admin + Own | Dealer (own) | Dealer (own) + Admin | Dealer (own) |
| favorites | Own | Own | ❌ | Own |
| dealer_import_requests | Dealer (own) + Importer (assigned/available) + Admin | Dealer | Dealer + Importer | ❌ |
| contact_requests | Dealer (vehicle) + Buyer (own) | Auth users | Dealer (vehicle) | ❌ |
| approval_audit | Admin | Admin | ❌ | ❌ |
| email_templates | Admin | Admin | Admin | ❌ |
| email_logs | Admin | Admin | ❌ | ❌ |
| waitlist | Admin | Anyone | Admin | Admin |

---

## API & Edge Functions

### Edge Functions

| Function | Path | Auth | Purpose |
|----------|------|------|---------|
| `send-verification-email` | `/send-verification-email` | JWT | Send templated emails |
| `waitlist-signup` | `/waitlist-signup` | Public | Process waitlist signups |

### Calling Edge Functions

```typescript
import { supabase } from "@/integrations/supabase/client";

const { data, error } = await supabase.functions.invoke('function-name', {
  body: { /* payload */ }
});
```

---

## Appendix

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |
| `VITE_SUPABASE_PROJECT_ID` | Project identifier |

### Database Views (Intelligence Layer)

- `market_pricing_stats` - Price statistics by make/model/year
- `market_demand_stats` - Supply vs demand ratios
- `dealer_trust_stats` - Dealer reliability metrics
- `vehicle_risk_flags` - Risk assessment per vehicle

---

*Documentation generated for FLUX Auto Platform v1.0.0*
