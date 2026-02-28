# Tanindo Seeds Pvt Ltd — B2B Seed Distribution Platform

> **Production-grade B2B SaaS** for multi-state agricultural seed distribution. GST-compliant, RBAC-secured, built on Next.js 15 App Router.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Database | PostgreSQL via [Neon](https://neon.tech) |
| ORM | Prisma 5 |
| Auth | JWT (jsonwebtoken) + jose (Edge) |
| Email | Nodemailer (SMTP) |
| Styling | CSS Modules + Global Design System |
| Deployment | Vercel + Neon serverless Postgres |

---

## Project Structure

```
src/
├── app/
│   ├── admin/            # Admin dashboard (RBAC-protected)
│   ├── dashboard/        # Buyer dashboard
│   ├── products/         # Product catalogue + detail pages
│   ├── login/            # Auth pages
│   ├── register/         # eKYC registration
│   ├── pending-approval/ # KYC status page
│   ├── 403/              # Access denied page
│   └── api/
│       ├── admin/        # Admin-only endpoints (buyers, stats, credit, promote)
│       ├── auth/         # login, logout, register
│       ├── orders/       # Order creation + management
│       ├── products/     # Product CRUD
│       └── invoices/     # PDF invoice generation
├── components/
│   ├── Navbar.tsx        # "use client" — auth-aware navigation
│   ├── Footer.tsx        # "use client" — dynamic year + logo
│   └── AiChat.tsx        # "use client" — AI seed advisor widget
├── lib/
│   ├── auth.ts           # JWT helpers (generateToken, verifyToken, getSessionUser)
│   ├── prisma.ts         # Prisma singleton client
│   ├── mailer.ts         # Nodemailer email sender
│   ├── validate.ts       # Input sanitization helpers
│   └── ai-engine.ts      # AI recommendation logic
├── middleware.ts         # Edge RBAC + KYC gating (jose)
└── prisma/
    └── schema.prisma     # PostgreSQL schema
```

---

## RBAC Flow

```
Request
  │
  ▼
middleware.ts (Edge Runtime — jose JWT)
  │
  ├── /admin/*  or /api/admin/*
  │     ├── No token         → redirect /login (or 401)
  │     └── role ≠ "admin"   → redirect /403  (or 403)
  │
  ├── /dashboard/*  or /api/orders/*
  │     └── No token         → redirect /login (or 401)
  │
  ├── /products/*  or /api/products/*
  │     ├── Admin            → allow
  │     ├── Buyer + approved → allow
  │     └── Buyer + pending  → redirect /pending-approval (or 403)
  │
  └── /login  or /register
        └── Already logged in → redirect /dashboard or /admin
```

---

## KYC Workflow

```
Distributor Registers
  │  (POST /api/auth/register)
  │  role="buyer", kycStatus="pending"
  ▼
Awaits Admin Approval
  │  Admin → KYC tab → Approve / Reject
  │  (PATCH /api/admin/buyers)
  ▼
Approved → kycStatus="approved"
  │  Email notification sent
  │  JWT refreshed on next login (kycStatus is baked into JWT)
  ▼
Can now access /products and place orders

Rejected → kycStatus="rejected"
  └── Buyer sees rejection reason on /pending-approval
```

---

## Admin Promotion (First Admin)

After registering, run once:

```bash
curl -X POST http://localhost:3000/api/admin/promote \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","secret":"your-ADMIN_SETUP_SECRET"}'
```

Then **log out and log back in** to receive a JWT with `role: "admin"`.

> Set `ADMIN_SETUP_SECRET` in `.env` to a strong random value before production.

---

## Database Schema Overview

| Model | Key Fields | Purpose |
|---|---|---|
| `User` | role, kycStatus, creditLimit | Buyers + Admins |
| `Product` | tierPricing (JSON), moq, stockQuantity | Seed catalogue |
| `Order` | status, grandTotal, buyerState | Order lifecycle |
| `OrderItem` | pricePerUnit (server-locked), hsnCode, gstRate | Line items |
| `Invoice` | cgst, sgst, igst, grandTotal | GST-compliant tax invoice |
| `CreditTransaction` | type (debit/credit), amount | Credit ledger |

---

## Environment Variables

```env
DATABASE_URL="postgresql://..."        # Neon connection string
JWT_SECRET="strong-random-secret"
ADMIN_SETUP_SECRET="setup-secret"      # One-time admin promotion

NEXT_PUBLIC_APP_NAME="Tanindo Seeds Pvt Ltd"
NEXT_PUBLIC_SELLER_GSTIN="29AABCU9603R1ZX"
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"

EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="noreply@yourdomain.com"
EMAIL_PASS="your-smtp-app-password"
```

---

## Local Development

```bash
npm install
# configure .env
npx prisma db push
npm run dev
```

---

## Deployment — Vercel + Neon

1. Create **Neon project** → copy `postgresql://` connection string
2. Import repo to **Vercel** → add all env vars
3. **Deploy** — Vercel runs `npm run build` automatically
4. First deploy: `npx prisma db push`
5. Promote admin via `/api/admin/promote`

---

## Security Notes

- Prices are **always fetched server-side** — clients cannot submit prices
- JWT `kycStatus` and `role` are verified at the Edge via `jose`
- Admin routes require `role === "admin"` — no email-based hardcoding
- `ADMIN_SETUP_SECRET` disables route if unset
- All inputs sanitized via `lib/validate.ts`

---

© 2025 Tanindo Seeds Pvt Ltd. All rights reserved.