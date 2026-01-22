# Polar.sh Monetization Research

## Overview

Polar.sh is a merchant of record platform designed for developers and creators. It handles payments, subscriptions, tax compliance, and benefit delivery.

**Key Advantages:**
- Simple Next.js SDK integration
- Handles all tax/VAT compliance globally
- Built-in checkout and customer portal
- Automated benefit delivery (license keys, Discord roles, etc.)
- Sandbox environment for testing

---

## Authentication

### Organization Access Tokens (OAT)
- Used server-side for backend operations
- Format: `Authorization: Bearer polar_oat_xxxxxxxxxxxxxxxxx`
- Manages products, orders, subscriptions on behalf of organization

### Customer Access Tokens
- Generated server-side via `/v1/customer-sessions/`
- Used for customer-facing browser flows
- Keeps organization credentials secure

---

## API Details

### Base URLs
- **Production:** `https://api.polar.sh/v1`
- **Sandbox:** `https://sandbox-api.polar.sh/v1`

### Rate Limits
- 300 requests/minute per organization
- 3 requests/second for unauthenticated license key operations

### Core Endpoints
| Resource | Purpose |
|----------|---------|
| `/checkouts/` | Create and manage checkout sessions |
| `/products/` | Product CRUD operations |
| `/subscriptions/` | Subscription management |
| `/customers/` | Customer management |
| `/orders/` | Order history and management |
| `/benefits/` | Benefit configuration |
| `/webhooks/` | Event notifications |

---

## Products & Pricing

### Product Types
Polar treats everything as a product - subscriptions and one-time purchases use the same model.

### Billing Cycles
- **One-time:** Single payment, perpetual access
- **Monthly:** Recurring monthly charges
- **Yearly:** Recurring annual charges

### Pricing Types
- **Fixed price:** Set amount
- **Pay what you want:** Customer chooses (with optional min/default)
- **Free:** No charge

**Important:** Billing cycle and pricing type cannot be changed after creation.

### Tier Strategy
Create separate products for each tier (e.g., Pro Monthly, Pro Yearly). They appear together at checkout allowing customers to switch.

### Trial Periods
Available for recurring products - set duration in days, weeks, months, or years.

---

## Benefits System

Automated benefits tied to products:

| Benefit Type | Description |
|--------------|-------------|
| **Credits** | Credit customer's usage meter balance |
| **License Keys** | Customizable software license keys |
| **File Downloads** | Downloadable files up to 10GB each |
| **GitHub Repo Access** | Auto-invite to private repositories |
| **Discord Invite** | Auto-invite with role assignment |
| **Custom** | Any custom benefit you define |

Benefits are modular - same benefit can attach to multiple products.

---

## Next.js SDK Integration

### Installation
```bash
npm install zod @polar-sh/nextjs
```

### Environment Variables
```env
POLAR_ACCESS_TOKEN=polar_oat_xxx
POLAR_WEBHOOK_SECRET=whsec_xxx
POLAR_SUCCESS_URL=https://yourdomain.com/success
POLAR_SERVER=sandbox  # or "production"
```

### Checkout Route (`app/api/checkout/route.ts`)
```typescript
import { Checkout } from "@polar-sh/nextjs";

export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  successUrl: process.env.POLAR_SUCCESS_URL!,
  server: process.env.POLAR_SERVER as "sandbox" | "production",
});
```

**Usage:** `/api/checkout?products=PRODUCT_ID&customerEmail=user@example.com`

### Customer Portal (`app/api/portal/route.ts`)
```typescript
import { CustomerPortal } from "@polar-sh/nextjs";

export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  getCustomerId: (req) => {
    // Return Polar customer ID from your database
    return getUserPolarCustomerId(req);
  },
  server: process.env.POLAR_SERVER as "sandbox" | "production",
});
```

### Webhook Handler (`app/api/webhooks/polar/route.ts`)
```typescript
import { Webhooks } from "@polar-sh/nextjs";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onPayload: async (payload) => {
    console.log("Webhook received:", payload.type);
  },
  onCheckoutCreated: async (payload) => {
    // Handle checkout creation
  },
  onSubscriptionActive: async (payload) => {
    // Grant access to user
    const { customerId, productId } = payload.data;
  },
  onSubscriptionCanceled: async (payload) => {
    // Revoke access
  },
  onOrderPaid: async (payload) => {
    // Handle one-time purchase
  },
});
```

---

## Webhook Events

### Checkout Events
- `checkout.created`
- `checkout.updated`

### Order Events
- `order.created`
- `order.paid`
- `order.refunded`

### Subscription Events
- `subscription.created`
- `subscription.updated`
- `subscription.active`
- `subscription.canceled`
- `subscription.revoked`

### Customer Events
- `customer.created`
- `customer.updated`
- `customer.deleted`
- `customer.state_changed`

---

## Checkout Flow Options

### 1. Checkout Links (No-code)
Create in Polar dashboard, share URL directly.

### 2. Embedded Checkout
Embed checkout form directly on your site.

### 3. Checkout Sessions API
Programmatic control via API/SDK.

### Query Parameters
| Parameter | Description |
|-----------|-------------|
| `products` | Product ID (required) |
| `customerId` | Polar customer ID |
| `customerExternalId` | Your internal user ID |
| `customerEmail` | Pre-fill email |
| `customerName` | Pre-fill name |
| `metadata` | URL-encoded JSON |

---

## Implementation Strategy for TikTok Motion App

### Suggested Tiers

**Free Tier:**
- 3 avatar generations/month
- 1 video generation/month
- Basic features

**Pro Tier ($9.99/month or $99/year):**
- 50 avatar generations/month
- 10 video generations/month
- Photo combiner access
- Priority processing

**Unlimited Tier ($29.99/month or $299/year):**
- Unlimited generations
- All features
- Priority support

### Database Schema Additions
```prisma
model User {
  // ... existing fields
  polarCustomerId     String?   @unique
  subscriptionStatus  String    @default("free") // free, active, canceled, expired
  subscriptionTier    String    @default("free") // free, pro, unlimited
  subscriptionId      String?
  currentPeriodEnd    DateTime?
  avatarQuota         Int       @default(3)
  avatarUsage         Int       @default(0)
  videoQuota          Int       @default(1)
  videoUsage          Int       @default(0)
  quotaResetDate      DateTime  @default(now())
}
```

### Required API Routes
1. `/api/checkout` - Initiate checkout
2. `/api/portal` - Customer portal redirect
3. `/api/webhooks/polar` - Handle Polar events
4. `/api/billing/usage` - Get current usage
5. `/api/billing/status` - Get subscription status

### UI Components Needed
1. Pricing page (`/pricing`)
2. Billing dashboard (`/settings/billing`)
3. Quota indicator in header
4. Upgrade prompts when quota exceeded

---

## Testing with Sandbox

1. Use `server: "sandbox"` in all SDK calls
2. Sandbox base URL: `https://sandbox-api.polar.sh/v1`
3. Create test products in Polar sandbox dashboard
4. Use test card numbers for payments

---

## Resources

- [Polar Dashboard](https://polar.sh/dashboard)
- [API Reference](https://polar.sh/docs/api-reference/introduction)
- [Next.js Guide](https://polar.sh/docs/integrate/sdk/adapters/nextjs)
- [Webhooks Guide](https://polar.sh/docs/integrate/webhooks)
- [Products Guide](https://polar.sh/docs/products)
- [Benefits Guide](https://polar.sh/docs/benefits)
