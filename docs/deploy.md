# Deploy (production)

Live architecture: **Render** (FE static + BE web) + **Supabase Postgres**. Decision record: [docs/adr/0002-render-supabase-deployment.md](../docs/adr/0002-render-supabase-deployment.md). Domain words: [CONTEXT.md](../CONTEXT.md).

## URLs (verified via Render / Supabase MCP)

| Role | Service | URL |
|------|---------|-----|
| User frontend | `socomain` (static) | https://socomain.onrender.com |
| User API | `be-socomain` (web) | https://be-socomain.onrender.com |
| Admin frontend | `socoadmin` (static) | https://socoadmin.onrender.com |
| Admin API | `be-socoadmin` (web) | https://be-socoadmin.onrender.com |
| Database | Supabase project `SocialCommerce` | `xzajhecxvpmjpjrhixir` (ap-southeast-1) |

Blueprint: [`render.yaml`](../render.yaml) at repo root.

## Configure

1. Set `DATABASE_URL` on both web services to the Supabase Postgres connection string (Prisma).
2. User API: `FRONTEND_URL=https://socomain.onrender.com` plus Cloudinary / JWT / other secrets from `backend/.env.example`.
3. User static: `VITE_API_BASE_URL=https://be-socomain.onrender.com/api`.
4. Admin static: `VITE_ADMIN_API_BASE_URL=https://be-socoadmin.onrender.com/api`, `VITE_CORE_PUBLIC_URL=https://be-socomain.onrender.com`.
5. Admin API: `ADMIN_CORS_ORIGIN` includes `https://socoadmin.onrender.com`.

## Notes

- Render Free web services sleep after idle (cold start). Repo pings `/health` every 10 minutes via GitHub Action `.github/workflows/keep-alive.yml` (`scripts/keep-alive.sh`). Render Cron Job is paid (starter+), so it is not created on this free stack.
- Optional `REDIS_URL` if you enable cache; not required for basic boot.
- Older All-AWS lab docs are **not** the live production path (see ADR 0001 deprecated).
