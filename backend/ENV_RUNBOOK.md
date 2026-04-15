# Backend Environment Runbook

## Local development

- Copy `.env.example` to `.env`.
- Set at least:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `FRONTEND_URL`
- Optional for media/email/AI features:
  - Cloudinary (`CLOUDINARY_*`)
  - SMTP (`SMTP_*`)
  - AI (`GEMINI_API_KEY`, backup providers)

## Production baseline (fail-fast validated)

When `NODE_ENV=production`, server startup validates and requires:

- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `SENSITIVE_DATA_KEY`

If any value is missing, startup exits with an explicit error.

## Rate limiting knobs

- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`
- `AUTH_RATE_LIMIT_WINDOW_MS`
- `AUTH_RATE_LIMIT_MAX`
- `AUTH_SENSITIVE_RATE_LIMIT_WINDOW_MS`
- `AUTH_SENSITIVE_RATE_LIMIT_MAX`

## Test mode

- Set `SKIP_DB_CONNECT=true` to skip Prisma connect at import-time for API tests.
- `NODE_ENV=test` also skips auto-connect to avoid hard dependency on local DB.
