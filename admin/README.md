# SoCo Admin (microservice-style)

Standalone admin API and SPA. Uses the **same PostgreSQL database** as the core backend (shared Prisma schema in `database/prisma`).

## Prerequisites

- **`database/`** — `npm install` in repo root `database/` (Prisma schema: `database/prisma/`).
- Core **backend** — `npm install` in `backend/` (generated Prisma client is written to `backend/node_modules`; admin reuses it). Required if you use **seller admin** routes (they load `backend/src/services/seller.service.js`).
- `DATABASE_URL` in `admin/backend/.env` aligned with the main API (`backend/.env`).
- A row in the **`admins`** table for platform login (seed via `npm run prisma:seed` from `backend`, see `database/prisma/seed.js`).

## Admin API (`admin/backend`)

1. Copy `admin/backend/.env.example` to `admin/backend/.env` and set `ADMIN_JWT_SECRET`, `DATABASE_URL`, and (for seller KYC) the same Cloudinary / SMTP variables as `backend/.env`.
2. From repo root, ensure `database/` and `backend/` dependencies are installed; then from `admin/backend`:

```bash
npm install
npm run prisma:generate
npm run dev
```

`prisma:generate` runs `npm run generate` in `database/` (schema `database/prisma/schema.prisma`, client emitted into `backend/node_modules`). The admin API loads that client from `backend` at runtime — no copy into `admin/backend/node_modules`.

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
