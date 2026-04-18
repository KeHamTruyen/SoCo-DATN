# Backend — Runbook biến môi trường

Tài liệu này tóm tắt biến cần thiết cho chạy API, production, và test. Chi tiết đầy đủ (AI, seed, SMTP, …) nằm trong [`.env.example`](.env.example). Hướng dẫn chạy test: [`TEST.md`](TEST.md).

## Phát triển cục bộ

1. Sao chép `.env.example` → `.env` trong thư mục `backend/`.
2. **Tối thiểu** để chạy server và API lõi:
   - `DATABASE_URL` — PostgreSQL (schema Prisma nằm trong package [`database/`](../database/))
   - `JWT_SECRET`
   - `FRONTEND_URL` — CORS và link trong email
3. **Tuỳ chọn** theo tính năng:
   - Upload/media: `CLOUDINARY_*`
   - Email: `SMTP_*`
   - AI text: `GEMINI_*`, backup OpenRouter/Groq (`AI_TEXT_BACKUP_PROVIDER`, …)
   - AI ảnh: `AI_IMAGE_*`, `HF_TOKEN`, `REPLICATE_API_TOKEN`, …
   - Dữ liệu nhạy cảm seller (production bắt buộc): `SENSITIVE_DATA_KEY`
4. Biến khác: `PORT` (mặc định 5000), `LOG_LEVEL`, `JWT_EXPIRE`, `DEFAULT_USER_AVATAR_URL`, seed `SEED_*` (khi chạy `prisma db seed` từ package `database/`).

## Production (`NODE_ENV=production`)

Khi `NODE_ENV=production`, [`src/config/env.js`](src/config/env.js) **bắt buộc** các biến sau; thiếu một biến là server thoát ngay với lỗi rõ ràng:

- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `SENSITIVE_DATA_KEY`

## Giới hạn tốc độ (rate limiting)

- `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`
- `AUTH_RATE_LIMIT_WINDOW_MS`, `AUTH_RATE_LIMIT_MAX`
- `AUTH_SENSITIVE_RATE_LIMIT_WINDOW_MS`, `AUTH_SENSITIVE_RATE_LIMIT_MAX`

## Test (Vitest)

Hành vi kết nối DB khi import app nằm trong [`src/config/database.js`](src/config/database.js):

- **Unit + HTTP smoke:** setup Vitest đặt `NODE_ENV=test` và `SKIP_DB_CONNECT=true` — không cần PostgreSQL chạy.
- **Integration:** `NODE_ENV=test` nên không gọi `$connect()` sớm; Prisma vẫn kết nối khi có truy vấn. Cần `DATABASE_URL` hợp lệ; các suite dùng `integrationDescribe` sẽ **skip** nếu không có `DATABASE_URL`.

Biến thường gặp khi chạy test:

- `SKIP_DB_CONNECT` — chỉ cần quan tâm nếu tự chạy lệnh/test ngoài Vitest; setup unit/http đã set `true`.
- `JWT_SECRET` — integration cần khi test auth; [`test/setup/vitest.integration.setup.js`](test/setup/vitest.integration.setup.js) gán mặc định nếu chưa có (đủ dài cho CI/local).
- `INTEGRATION_BUYER_EMAIL` / `INTEGRATION_BUYER_PASSWORD` — tuỳ chọn, ghi đè buyer QA (xem `test/helpers/integrationFixtures.js`).

Lệnh: `npm run test` (unit+http), `npm run test:integration`, `npm run test:all` — xem [`TEST.md`](TEST.md).

## CI (GitHub Actions)

Job `backend` trong [`.github/workflows/ci.yml`](../.github/workflows/ci.yml):

- Service PostgreSQL 16; `DATABASE_URL` trỏ tới DB `ci`.
- `database/`: `prisma validate` → `generate` → `migrate deploy` → `db seed` (có thể set `SEED_*` cho admin/QA).
- `backend/`: `npm run test:all` với `JWT_SECRET` (và `DATABASE_URL` từ env workflow).

Dummy URL PostgreSQL cũng đủ cho các bước validate/generate Prisma khi không cần DB thật.
