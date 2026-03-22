# SoCo Admin (microservice-style)

Standalone admin API and SPA. Uses the **same PostgreSQL database** as the core backend (shared Prisma schema in `backend/prisma`).

## Prerequisites

- Core **backend** dependencies installed (`backend/node_modules`) if you use **seller admin** routes (they load `backend/src/services/seller.service.js`).
- `DATABASE_URL` aligned with the main API.
- An `ADMIN` user in the database (same `User` table as the main app).

## Admin API (`admin/backend`)

1. Copy `admin/backend/.env.example` to `admin/backend/.env` and set `ADMIN_JWT_SECRET`, `DATABASE_URL`, and (for seller KYC) the same Cloudinary / SMTP variables as `backend/.env`.
2. From `admin/backend`:

```bash
npm install
npm run prisma:generate
npm run dev
```

`prisma:generate` runs generate in `backend/` (shared schema) and copies `.prisma` into this package.

Default URL: `http://localhost:5001` — routes under `/api` (e.g. `POST /api/auth/login`).

## Admin web (`admin/frontend`)

1. Copy `admin/frontend/.env.example` to `admin/frontend/.env` and set `VITE_ADMIN_API_BASE_URL` (e.g. `http://localhost:5001/api`).
2. From `admin/frontend`:

```bash
npm install
npm run dev
```

Open `http://localhost:5174` and sign in with an admin account.

## Core API changes

User-facing API no longer mounts `/api/admin` or admin-only `/api/reports` / seller-application moderation routes; those live on the admin service only.
