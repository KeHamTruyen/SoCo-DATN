# Development Checklist — SoCo-DATN

Social commerce đồ án tốt nghiệp: mạng xã hội gắn mua sắm. File này là **nguồn sự thật tiến độ + cổng chất lượng**, không chỉ danh sách CRUD.

**Cách tick:** `[x]` = đã có trong repo và chạy được (local hoặc CI). `[ ]` = còn thiếu hoặc chưa chứng minh bằng test/tài liệu. Không tick “xong” vì chỉ có UI mock.

**Hai lớp bắt buộc khi đọc**

| Lớp                | Trả lời câu hỏi                                             | Đọc khi                               |
| ------------------ | ----------------------------------------------------------- | ------------------------------------- |
| **A — Sản phẩm**   | Module nào đã giao cho user/seller/admin?                   | Làm feature, báo cáo tiến độ đồ án    |
| **B — Chất lượng** | Làm sao biết không gãy, không lộ data, deploy không mất DB? | Trước merge, trước demo, trước bảo vệ |

Một màn hình “chạy được trên máy dev” **chưa** đủ DoD (định nghĩa xong việc — xem §2).

Tài liệu kèm: [README.md](README.md) (setup), [TESTING.md](TESTING.md) (test), [docs/deploy.md](docs/deploy.md) (production), [CONTEXT.md](CONTEXT.md) (thuật ngữ deploy), [EXTERNAL_SERVICES_GUIDE.md](EXTERNAL_SERVICES_GUIDE.md) (Cloudinary, SMTP, AI).

_Last updated: 16 Sep 2026 — rewrite SDLC: tách feature / quality gate, đồng bộ repo (Vitest, Playwright, CI, Render + Supabase)._

---

## 0. Hiện trạng một trang

Production đang live: Render (FE static + BE web) + Supabase Postgres. Chi tiết URL: [docs/deploy.md](docs/deploy.md).

| Mảng                          | Ước lượng | Ghi chú                                                                         |
| ----------------------------- | --------- | ------------------------------------------------------------------------------- |
| Tính năng user/seller (Lớp A) | ~85–90%   | Còn polish: store public, AI gắn composer, seller order UI, search autocomplete |
| Cổng chất lượng (Lớp B)       | ~40–50%   | CI + test nền tốt; thiếu IDOR, backup, health DB, DoD, admin test               |
| Sẵn sàng demo/bảo vệ          | Chưa đóng | Làm xong mục **Bắt buộc** ở §7 rồi mới gọi là “đủ tin”                          |

**Không đuổi:** Elasticsearch bắt buộc, Storybook, Redis cache, Kubernetes, coverage ≥ 70% như cổng merge, FCM. Lý do: §6.

---

## 1. Thuật ngữ (fresher)

Đọc mục này trước khi tick Lớp B. Cùng một từ dùng xuyên file.

### 1.1 Quy trình

- **SDLC (Software Development Life Cycle):** vòng đời phần mềm — yêu cầu → thiết kế → code → test → review → deploy → vận hành. Checklist cũ gần như chỉ có bước “code feature”.
- **Definition of Done (DoD):** điều kiện để một việc được gọi là xong. Không có DoD thì mỗi người “xong” một kiểu (chỉ UI, chưa test, chưa check quyền).
- **Acceptance criteria:** điều kiện chấp nhận của _một_ user story (ví dụ: “buyer hủy đơn `PENDING` thì kho cộng lại”). DoD áp dụng _mọi_ story; AC áp dụng _story đó_.
- **YAGNI (You Aren’t Gonna Need It):** đừng xây hệ thống “cho tương lai” khi chưa có bằng chứng cần. Elasticsearch / k8s thuộc nhóm này với DATN.
- **ADR (Architecture Decision Record):** ghi _vì sao_ chọn stack. Repo có `docs/adr/0002-render-supabase-deployment.md` (production hiện tại) và `0001` (All-AWS, đã superseded).
- **PR (Pull Request):** đề xuất merge nhánh. CI chạy trên PR. Repo **chưa** có file template PR — mục B0 còn mở.

### 1.2 Kiểm thử

- **Kim tự tháp test:** nhiều unit (nhanh, rẻ) → ít integration (thật DB) → rất ít E2E (chậm, dễ gãy). Đảo kim tự tháp (chỉ E2E) tốn thời gian và khó debug.
- **Unit test:** test một hàm/hook, mock mạng và DB. SoCo: Vitest. FE: `frontend/src/**/__tests__/`. BE: `backend/test/unit/`.
- **HTTP smoke:** gọi Express `app` qua Supertest, không `listen()` port. Kiểm tra route + middleware (401 khi thiếu token). SoCo: `backend/test/http/`.
- **Integration test:** gọi API **có PostgreSQL thật** (Prisma). Cần `DATABASE_URL`. Thiếu biến thì test **skip** — đừng tưởng pass. SoCo: `backend/test/integration/` + job CI có Postgres 16.
- **E2E (end-to-end):** mở trình duyệt, đi luồng user. SoCo: Playwright (`frontend/e2e/`), mock API `localhost:5000` — **không** chứng minh backend đúng, chỉ chứng minh UI + routing.
- **Coverage:** % dòng code được chạy khi test. Tool: `@vitest/coverage-v8`. **Không** phải “đã test đủ”. Dễ đạt 70% bằng chỗ dễ, bỏ order/IDOR. Dùng để _tìm lỗ hổng_, không dùng làm cổng vanity.
- **Regression:** sửa A làm hỏng B. Test critical (auth, cart, order) trong CI để chặn regression.
- **UAT (User Acceptance Test):** người (hoặc checklist tay) đi luồng thật trên môi trường gần production. Khác E2E mock.
- **Fixture / seed:** dữ liệu mẫu. `database/prisma/seed.js` + `npm run prisma:seed` từ `backend`. CI seed user QA cho integration.
- **Vitest:** test runner Node/Vite (nhanh, ESM). Thay Jest/`node --test` trong repo này.
- **Playwright:** E2E điều khiển Edge/Chromium. Cypress **không** dùng.
- **Supertest:** gửi HTTP giả lập vào `app` Express.

### 1.3 Bảo mật

- **JWT (JSON Web Token):** chuỗi ký số chứa `userId` + hạn. Server không lưu session server-side (stateless). Rủi ro: lộ token = giả danh đến khi hết hạn.
- **Access token / refresh token:** access ngắn hạn gọi API; refresh đổi access mới. FE lưu cả hai trong `localStorage` (`soco.accessToken`).
- **httpOnly cookie:** cookie JS trên trang **không đọc được**. Chống XSS _lấy token_. Backend _đã_ `res.cookie("token", …, { httpOnly: true })` lúc login; FE _vẫn_ cất token JSON vào `localStorage` → XSS vẫn lấy được.
- **XSS (Cross-Site Scripting):** chèn JS vào trang người khác. Feed HTML dùng DOMPurify (`sanitizePostHtml`). Token trong `localStorage` vẫn bị script độc đọc.
- **CSRF (Cross-Site Request Forgery):** trang khác khiến trình duyệt gửi cookie session tới API của mình. Chỉ nghiêm nếu auth **chỉ** dựa cookie. Cookie SoCo có `sameSite: "strict"`. Khi FE gửi `Authorization: Bearer` từ localStorage, CSRF kém liên quan hơn XSS.
- **IDOR (Insecure Direct Object Reference):** đoán/đổi id trên URL để đọc data người khác (`GET /api/orders/uuid-của-bạn`). Test: user A không PATCH notification/order của user B. **Chưa có test IDOR trong** `backend/test/`**.**
- **OWASP:** danh sách rủi ro web phổ biến (injection, broken access, XSS…). DATN không cần chứng chỉ; cần map vài mục vào code.
- **Helmet:** middleware Express set header HTTP (tắt `X-Powered-By`, CSP một phần, …). Đã bật `backend/src/app.js`.
- **Rate limit:** giới hạn số request / IP / thời gian — chống brute-force login và spam API. `express-rate-limit`: global `/api` + limiter auth.
- **CORS:** trình duyệt chặn JS domain A gọi API domain B trừ khi server cho phép `Origin`. Production phải khớp `FRONTEND_URL` (user) và `ADMIN_CORS_ORIGIN` (admin).
- **bcrypt:** hash mật khẩu một chiều + salt. Không lưu plaintext. Đã dùng `bcryptjs`.
- **Prisma / SQL injection:** Prisma bind tham số — không nối chuỗi SQL. Vẫn có thể lộ data nếu quên `where: { userId }` (đó là IDOR, không phải injection).
- **Secrets:** `JWT_SECRET`, `DATABASE_URL`, Cloudinary, SMTP. Không commit `.env`. Production: `validateEnv()` fail-fast khi thiếu biến (`backend/src/config/env.js`).
- **Dependabot /** `npm audit`**:** quét lỗ hổng thư viện. Repo chưa có `dependabot.yml`.

### 1.4 Deploy & vận hành

- **CI (Continuous Integration):** mỗi push/PR, máy ảo chạy lint + test + build. File: `.github/workflows/ci.yml`.
- **CD (Continuous Deployment):** tự deploy khi CI xanh. Render có auto-deploy từ git; **không** có “smoke production bắt buộc sau deploy” trong repo.
- **Environment /** `.env`**:** cấu hình theo máy. Vite chỉ nhúng biến `VITE_`\* lúc **build** — đổi API URL production phải rebuild static.
- **Health check:** endpoint để platform biết process sống. `GET /health` hiện trả `{ status: "OK" }` **không** ping DB. Render: `healthCheckPath: /health` trong `render.yaml`.
- **Cold start:** Render Free ngủ sau ~15 phút idle; request đầu chậm. Không phải bug app.
- **Ephemeral disk:** ổ Render mất khi redeploy. Ảnh/file phải lên Cloudinary, không lưu `uploads/` trên server.
- **Observability:** log + metric + trace để biết production đang làm gì. SoCo: Winston JSON + `requestId` (`x-request-id`). Chưa có Sentry (gom lỗi JS/BE).
- **Backup / restore:** bản sao DB có thể quay lại. Supabase có backup theo plan; **chưa** ghi runbook restore trong `docs/deploy.md`.
- **Migrate vs** `db push`**:** `prisma migrate deploy` = chạy file SQL đã review (production/CI). `prisma db push` = đồng bộ schema nhanh trên máy dev, **không** dùng production.
- **Rollback:** cách về bản cũ (redeploy image/commit trước). Render: rollback deploy. DB migrate **không** tự rollback — cần migration ngược hoặc restore backup.
- **Staging:** môi trường giống production, data giả. DATN có thể dùng Render preview hoặc nhánh; **chưa** bắt buộc nếu UAT trên production cẩn thận (tài khoản QA, không data thật của người lạ).

### 1.5 Stack SoCo (nhắc nhanh)

| Thành phần     | Công nghệ                            | Vai trò                                  |
| -------------- | ------------------------------------ | ---------------------------------------- |
| User FE        | React 19, Vite, TypeScript           | SPA `:3000`                              |
| User API       | Express, ESM                         | `:5000`, Socket.IO                       |
| Admin FE / API | Vite + Express riêng                 | `:5174` / `:5001`, **cùng một Postgres** |
| DB             | PostgreSQL + Prisma                  | schema `database/prisma/`                |
| Upload         | Cloudinary + multer                  | ảnh sản phẩm/avatar/post/KYC             |
| Search         | SQL + `GET /api/search`; ES optional | unified search v1 không cần ES           |
| AI             | Gemini (+ backup OpenRouter/Groq)    | `/api/ai/*`                              |
| Host           | Render + Supabase                    | production hiện tại                      |

---

## 2. Definition of Done (áp dụng mọi PR / module)

Một mục Lớp A chỉ `[x]` khi **tất cả** dòng dưới đúng. In và dán vào mô tả PR nếu team chưa có template.

1. **Hành vi:** AC của story được code (API + UI nếu story có UI). Không để mock khi ticket nói “nối API”.
2. **Quyền:** user/role sai nhận 401/403. User A không đọc/sửa resource của user B (IDOR) với id đoán được.
3. **Validate:** input sai → 400, không 500. File upload: MIME + size (multer `limits` / `fileFilter`).
4. **Test:** ít nhất một test tự động chạm logic mới — unit _hoặc_ HTTP smoke _hoặc_ integration. Luồng tiền (auth, cart, order, seller status) ưu tiên integration.
5. **Schema:** đổi Prisma → thêm migration trong `database/prisma/migrations/`, CI `prisma migrate deploy` vẫn chạy. Không `db push` lên Supabase production.
6. **Secrets:** không commit `.env`, key, dump DB. Thêm biến mới → `.env.example` + `validateEnv` nếu bắt buộc production.
7. **Quan sát:** lỗi không nuốt im; đi `errorHandler` (có `requestId`). FE không trắng trang — `AppErrorBoundary` đã bọc app user.
8. **Tài liệu:** endpoint mới trong Swagger hoặc ghi vào PR; đổi deploy → `docs/deploy.md`.

**Checklist PR (copy):**

- [ ] Test liên quan đã chạy local (`frontend`: `npm test`; `backend`: `npm test` và `npm run test:all` nếu đụng DB)
- [ ] Không IDOR trên resource mới
- [ ] Migration nếu đổi schema
- [ ] `.env.example` cập nhật
- [ ] Không đụng secret
- [ ] Mô tả PR nói _vì sao_, không chỉ _sửa file nào_

---

## 3. Lớp B — Cổng chất lượng

### B0. Quy trình làm việc

- [x] README setup local (bốn app + Prisma)
- [x] ADR deploy (`docs/adr/0002-render-supabase-deployment.md`)
- [x] Glossary production (`CONTEXT.md`)
- [ ] **TODO:** file PR template (`.github/pull_request_template.md`) — 6 dòng DoD ở trên
- [ ] **TODO:** nhánh bảo vệ `main`: bắt buộc CI xanh trước merge (Settings GitHub — không nằm trong code)
- [ ] **TODO:** ghi “ai merge / ai review” trong README (DATN 1–2 người: tự review diff + CI vẫn hơn không)

**Giải thích:** Process không phải Scrum đầy đủ. Với đồ án, đủ khi _mọi_ thay đổi đi qua git + CI + DoD, không commit thẳng production lúc demo.

---

### B1. Kiểm thử

Kiến trúc và lệnh: [TESTING.md](TESTING.md), [backend/TEST.md](backend/TEST.md), [frontend/TEST.md](frontend/TEST.md).

| Lớp            | Công cụ                     | CI?              | Việc còn lại                  |
| -------------- | --------------------------- | ---------------- | ----------------------------- |
| Unit FE        | Vitest + Testing Library    | Có (`npm test`)  | Giữ; đừng đuổi 70%            |
| Unit + HTTP BE | Vitest + Supertest          | Có               | Thêm IDOR / 403               |
| Integration BE | Vitest + Postgres service   | Có (`test:all`)  | Order/notification cross-user |
| E2E FE         | Playwright (Edge, mock API) | **Không**        | Chạy tay trước demo           |
| Admin          | _Không có_ `test/`          | Job chỉ `npm ci` | Smoke login + 1 moderation    |

- [x] Frontend unit (~51 file / ~185 test lúc ghi TESTING.md)
- [x] Backend unit + HTTP smoke
- [x] Backend integration (auth me, cart, catalog, search, posts public, …) — skip nếu thiếu `DATABASE_URL`
- [x] Playwright: auth, 2FA UI, cart, orders, groups, messages, notifications, marketplace, AI (mock)
- [x] Coverage tool BE (`npm run test:coverage`) — **chưa** gắn ngưỡng CI
- [ ] **TODO:** Integration IDOR: order, message, notification, saved-item (user A vs B)
- [ ] **TODO:** Admin: ít nhất HTTP smoke login + 401
- [ ] **TODO:** Job CI `admin-backend` chạy test/lint, không dừng sau install
- [ ] **TODO:** E2E Playwright trước demo/bảo vệ (local đủ; CI là plus)
- [ ] **TODO:** Chạy coverage một lần, ghi số thật vào PR/luận văn — **không** đặt gate 70%
- [ ] **TODO:** UAT tay §5 trên production QA account

**Vì sao không bắt 70% coverage:** số dễ bị hack (test getter, bỏ nhánh thanh toán). Hội đồng tin _luồng tiền chạy được_ hơn _báo cáo 72% dòng_.

---

### B2. Bảo mật

Map OWASP gọn → việc SoCo.

| Rủi ro               | Đã có                                                     | Còn thiếu                                                   |
| -------------------- | --------------------------------------------------------- | ----------------------------------------------------------- |
| Broken auth          | JWT, bcrypt, rate limit login, `validateEnv` JWT          | Token FE trong `localStorage`                               |
| Broken access (IDOR) | Guard role (`RoleRoute`, admin service tách)              | Test cross-user resource                                    |
| Injection            | Prisma, express-validator                                 | Không nối SQL thủ công (giữ)                                |
| XSS                  | DOMPurify post HTML, Helmet                               | Mọi chỗ `dangerouslySetInnerHTML` phải sanitize             |
| CSRF                 | Cookie `sameSite: strict`                                 | Chỉ bắt buộc nếu bỏ Bearer, auth thuần cookie               |
| Upload               | multer `fileSize` + `fileFilter` ảnh seller KYC           | Rà mọi endpoint upload (product/post) cùng rule             |
| Secrets              | `.env.example`, không hardcode trong CI (dùng GitHub env) | Dependabot / `npm audit` định kỳ                            |
| CORS                 | whitelist localhost + `FRONTEND_URL`                      | Production `FRONTEND_URL` = `https://socomain.onrender.com` |

- [x] Password hashing bcrypt
- [x] JWT middleware; 401 token sai (integration auth)
- [x] Helmet tại `app.js`
- [x] Rate limit global `/api` + auth + auth-sensitive
- [x] CORS `credentials: true` + origin list
- [x] Cookie login `httpOnly` + `secure` production + `sameSite: "strict"`
- [x] Fail-fast env production (`validateEnv`)
- [x] DOMPurify cho nội dung post
- [x] `AppErrorBoundary` FE user
- [ ] **TODO:** Thống nhất auth: (A) FE chỉ cookie httpOnly + `credentials: 'include'`, xóa token `localStorage`, **hoặc** (B) giữ Bearer + ghi rõ trong luận văn: XSS đọc được session — đây là đánh đổi DATN, không phải “xong bảo mật”
- [ ] **TODO:** Test IDOR (xem B1)
- [ ] **TODO:** Socket.IO: client không join room user khác sau handshake
- [ ] **TODO:** `npm audit` + (nên) Dependabot
- [ ] **TODO:** Tắt hoặc bảo vệ `/api-docs` trên production nếu không muốn lộ contract (hoặc chỉ mở khi có auth)

**Không làm trên DATN trừ khi hội đồng hỏi sâu:** WAF, pentest thuê ngoài, SSO doanh nghiệp, mã hóa cột DB (đã có `SENSITIVE_DATA_KEY` — chỉ dùng đúng chỗ PII, đừng tự viết crypto mới).

---

### B3. CI / CD

File: `.github/workflows/ci.yml`.

- [x] CI frontend: `lint` (tsc) + Vitest + `vite build`
- [x] CI backend: Postgres 16 → Prisma validate/generate/`migrate deploy` → seed → `npm run test:all`
- [x] CI admin frontend: `npm run build`
- [ ] **TODO:** CI admin backend: sau `npm ci` phải có kiểm tra (ít nhất `node -e` boot hoặc smoke); hiện job **kết thúc ở install**
- [ ] **TODO:** (nên) Playwright job `if: manual` hoặc nightly — không chặn mọi PR nếu flaky
- [x] Render blueprint `render.yaml` (4 service) — CD theo git trên dashboard Render
- [ ] **TODO:** Sau deploy: mở `GET https://be-socomain.onrender.com/health` (và admin) — ghi 3 dòng vào `docs/deploy.md`

**Giải thích concurrency:** `cancel-in-progress: true` hủy CI cũ khi push thêm — đúng với DATN (tiết kiệm phút GitHub).

---

### B4. Quan sát lỗi (observability)

- [x] `requestId` trên request + header `x-request-id`
- [x] Request/error log JSON (Winston / middleware)
- [x] `GET /health` process sống
- [ ] **TODO:** `/health` (hoặc `/ready`) **ping Prisma** `SELECT 1` — Render đang tin process Node sống dù DB đứt
- [ ] **TODO:** (nên) Sentry free _hoặc_ thói quen: user báo lỗi → hỏi `x-request-id` → tìm log Render
- [ ] **TODO:** Health không trả secret, không trả stack trace

Redis (`REDIS_URL`) là cache optional — **không** bắt buộc trên mọi instance (ADR 0002). Health chỉ check Redis khi biến được set.

---

### B5. Database & dữ liệu

- [x] Schema Prisma + migrations (`database/prisma/migrations/`, gồm `init_schema`)
- [x] CI dùng `prisma migrate deploy` (đúng cách production)
- [x] Seed idempotent QA (`npm run prisma:seed`)
- [x] Seed CI có password riêng qua env (`SEED_*`)
- [ ] **TODO:** Runbook 1 trang: backup Supabase + restore thử trên branch/DB copy — **trước demo lớn**
- [ ] **TODO:** Cấm `prisma db push` / `prisma:reset` trên `DATABASE_URL` production (ghi cảnh báo trong `backend/README.md` nếu chưa có)
- [ ] **TODO:** (nên) Policy data demo: tài khoản giả, không CCCD thật trên KYC Cloudinary public

**Giải thích:** Migration là lịch sử schema. Mất folder `migrations/` rồi `push` lên prod = schema lệch, rollback không được. Backup là “bảo hiểm đồ án”: Render Free/Supabase vẫn có thể xóa nhầm project.

---

### B6. Deploy production

- [x] Bốn URL live (user FE/API, admin FE/API) — [docs/deploy.md](docs/deploy.md)
- [x] `render.yaml`: `healthCheckPath`, env `sync: false` cho secret
- [x] Static SPA rewrite `/*` → `index.html` (React Router)
- [x] Bind/platform: Render gán `PORT`; Express phải listen `process.env.PORT` (kiểm tra `server.js` khi đổi)
- [x] File media: Cloudinary (ổ Render ephemeral)
- [ ] **TODO:** Checklist “ngày demo”: warmup (gọi `/health` trước 2 phút), tài khoản QA, Stripe/COD mock, AI key còn quota
- [ ] **TODO:** Ghi cold start Free plan vào luận văn (tránh hội đồng tưởng app chết)

**Không cần cho DATN:** Kubernetes, Docker production bắt buộc, CDN riêng, blue/green. Render static + web đủ. Docker local chỉ khi muốn Postgres/ES giống nhau giữa máy.

---

### B7. UX, a11y, i18n (chất lượng giao diện)

- [x] Dark mode (token semantic; một số màn legacy)
- [x] i18n VI/EN cơ bản (header toggle)
- [x] Error boundary app user
- [ ] **TODO:** Form auth + checkout: mọi input có `<label>`, submit được bằng bàn phím
- [ ] **TODO:** Empty/error/loading có thông điệp, không màn trắng (skeleton _đủ luồng tiền_; không cần illustration khắp app)
- [ ] **TODO:** Responsive các màn demo: Feed, Marketplace, Cart, Checkout, Messages
- [ ] **TODO:** i18n phủ màn demo (không cần 100% admin)

Toast: nếu app đã có cơ chế thông báo (notification toast realtime) thì **không** bắt buộc thêm thư viện sonner. Checklist cũ ghi TODO sonner — chỉ làm nếu UX lỗi im lặng khi API fail.

---

## 4. Lớp A — Module sản phẩm

“Done” = API + UI luồng chính + có test hoặc smoke. Polish = UX/nâng cao, không chặn demo trừ khi ghi **bắt buộc**.

### 4.1 Auth & user — ✅ cốt lõi

**Backend:** User Prisma, `/api/auth/`\* (register, verify email/OTP, login, logout, profile, đổi mật khẩu), JWT, 2FA flag trên login, cookie httpOnly + body token.

**Frontend:** AuthContext, Login/Register/ForgotPassword, `ProtectedRoute` / `RoleRoute` / `PublicRoute`, token `localStorage` (xem B2).

- [x] Register / login / logout / me / update / change password
- [x] Guards route
- [ ] **TODO:** Quyết định cookie vs localStorage (B2) — đây là việc bảo mật, không phải feature mới

### 4.2 Products & categories — ✅ gần đủ

- [x] Product / Category / Image / Variant, slug, validators, Cloudinary upload
- [x] Marketplace filter/sort/pagination, ProductDetail, Seller CRUD
- [ ] Polish: rich text mô tả, bulk actions, autocomplete search (không chặn demo)

### 4.3 Cart & checkout — ✅ luồng COD

- [x] Cart API + CartPage
- [x] Checkout địa chỉ + tóm tắt đơn
- [x] Thanh toán **mock COD** (đủ DATN; không PCI)

**Giải thích mock payment:** không nhận thẻ thật. Luận văn nói rõ “mô phỏng xác nhận thanh toán”. Đừng cài Stripe thật nếu chưa có nhu cầu hội đồng.

### 4.4 Orders — ✅ buyer; ⏳ seller chi tiết

- [x] Tạo từ cart, list/detail buyer, cancel, status transitions, mock confirm
- [x] Seller list sales trên Seller Center
- [ ] **TODO:** UI seller đổi trạng thái đơn nếu API đã có mà nút chưa đủ (kiểm tra `listSellerSales` vs update status)

### 4.5 Posts & feed — ✅

- [x] CRUD post, like, comment phân trang, upload media, Swagger
- [x] Feed, composer, PostDetail, optimistic like, DOMPurify HTML

### 4.6 Scheduled posts — ✅ cốt lõi; ⏳ UX TZ

- [x] Model + cron `backend/src/jobs/scheduler.js`
- [x] Trang `/scheduled-posts` list/tạo/sửa/xóa
- [ ] Polish: timezone selector & preview

### 4.7 Messaging — ✅ REST + socket; ⏳ presence

- [x] Conversation/message, phân trang, Socket.IO, widget + `useMessageSocket`
- [ ] Polish: read receipt đầy đủ, typing/presence, đính kèm ảnh (emoji không bắt buộc)

### 4.8 Notifications — ✅ realtime v1

- [x] REST + preferences `social/order/system`
- [x] Payload `notification:new` có `event`, `schemaVersion`, `category`
- [x] `NotificationProvider` header + page + toast; resync reconnect
- [ ] **TODO:** UAT đa tab / IDOR (§5) — kỹ thuật đã làm, **chưa tick chứng minh**
- [ ] Email / FCM: **không làm** (YAGNI) trừ khi AC đồ án bắt buộc

### 4.9 Groups — ✅ v1

- [x] Role ADMIN/MOD/MEMBER, private join, invite, media/products
- [x] Discover, detail, my groups, member management
- [x] Flow tests `groups-v1` (unit/rules; xem `backend/test/unit/group-membership-rules.test.js`)

### 4.10 Reviews — ✅ core

- [x] Review API, form từ đơn (`OrderReviewModal`), list/filter trên ProductDetail, seller reply
- [ ] Polish: moderation flag; tách star component (không chặn)

### 4.11 Search & marketplace — ✅ unified v1

- [x] `GET /api/products` filter; `GET /api/users/search`; `GET /api/search` fan-out
- [x] `/search?q=` + header Enter
- [ ] Polish: autocomplete; Elasticsearch **tuỳ chọn** (docker-compose local) — không phải cổng production

### 4.12 Seller — ✅ apply + dashboard; ⏳ store public

- [x] Đăng ký + upload KYC, admin duyệt, `GET /api/seller/stats`, Seller Center
- [ ] **TODO:** StorePage công khai (nên có nếu demo “cửa hàng”)
- [ ] Export báo cáo / analytics sâu: không chặn

### 4.13 Profile & social — ✅

- [x] Follow, public profile, settings privacy
- [ ] Polish: `/profile/:username` slug

### 4.14 Admin (cụm riêng) — 🟡

Admin **không** mount trên user API (`admin/README.md`). Cùng DB. Authz + demo: [ADR 0003](docs/adr/0003-admin-casl-authz-and-demo.md).

- [x] Users, seller applications, categories, content, reports
- [x] **TODO:** Smoke test admin API (B1)
- [ ] Polish: analytics charts toàn nền tảng, product moderation tách trang

#### Phase P0 — CASL nền (trước P1)

- [x] Shared ability factory (`admin/shared/ability`) — profiles: `super` / `moderator` / `ops` / `demo`
- [x] BE: `protect` gắn `req.ability`; middleware `authorize(action, subject)` trên route ghi/đọc nhạy cảm
- [x] FE: `@casl/react` — ẩn nav/nút theo ability; login trả `permissions`
- [x] Seed: gán `permissions.profile` cho admin hiện có + không còn “mọi admin = full” chỉ vì JWT

#### Phase P1 — Try demo + rate limit

- [x] Seed `demo.admin@…` với `profile: "demo"`
- [x] LoginPage: nút **Try demo** + banner “limited actions”
- [x] Rate limit IP: login + write admin API (`express-rate-limit` in-memory)
- [ ] (Sau P2 nếu DB bẩn) Optional: GH Action reseed nhẹ — **không** `prisma reset` prod

#### Phase P2 — Khép moderation (ưu tiên CV)

- [x] Reports: filter pending/resolved; resolve có lý do; empty/loading rõ
- [x] Seller applications: polish approve/reject; UI **Sensitive change requests** (API đã có)
- [x] Users: search/filter; toggle/role chỉ `super` (CASL); demo chỉ đọc
- [x] Content: tabs posts/products; delete theo ability

#### Phase P3 — Đủ đồ án + CI

- [x] Dashboard: pending reports / seller apps click vào queue
- [x] Settings: hiện profile + danh sách quyền (read-only)
- [x] Smoke CI admin: login + 401 user-token + 403 demo trên route cấm
- [x] UAT §5.3 cập nhật: Try demo + 1 resolve report + 1 seller review

#### Không làm (YAGNI admin)

- UI gán role động, Casbin/OPA, Keycloak
- Snapshot/branch DB per guest
- Product moderation trang tách / export CSV (polish Phase 4 nếu còn thời gian)

### 4.15 AI — ✅ API + lab; ⏳ gắn composer

- [x] `/api/ai/generate-text` (và image/video-text), `AiCreativeLab` + `aiApi`
- [x] `npm run ai:health` (provider keys)
- [ ] **TODO:** Nút AI trong CreatePostModal / form sản phẩm (nếu là AC đồ án)
- [ ] Quota/history endpoint: chỉ khi abuse thật sự

### 4.16 Analytics — 🟡 tối thiểu

- [x] ProductView model, admin dashboard API một phần, chart seller đơn giản
- [ ] Track view tự động / export: không chặn demo

### 4.17 Saved items & reports — ✅ / 🟡

- [x] Saved items API + page
- [x] Report API + bảng admin
- [ ] Polish: luồng admin xử lý report cho đến “resolved” nếu chưa khép

---

## 5. UAT tối thiểu (tay, trước bảo vệ)

Thay cho ma trận notification ~90 ô: **ít, nhưng chạy trên môi trường thật** (local đủ DB hoặc production QA). Tick khi đã làm _trên tay hoặc integration_.

### 5.1 Luồng tiền (bắt buộc)

- [ ] Đăng ký → verify (nếu bật OTP) → login → logout → login lại
- [ ] Login sai mật khẩu nhiều lần: bị rate limit (429), không 500
- [ ] Thêm giỏ → đổi SL → checkout COD → thấy đơn buyer
- [ ] Seller thấy đơn; đổi status (nếu UI có) → buyer thấy timeline
- [ ] Hủy đơn `PENDING` → giỏ/kho hợp lý (đúng AC thật trong code)
- [ ] User A không mở `GET /api/orders/:id` của user B (401/403/404)

### 5.2 Social (nên)

- [ ] Đăng bài có ảnh Cloudinary → hiện Feed → like/comment
- [ ] Follow → notification (nếu preference `social` on)
- [ ] Tắt preference `social` → like không tạo noti mới
- [ ] Hai tab: mark read tab A → badge tab B (nếu socket sống)

### 5.3 Admin (nên)

- [ ] Login admin `:5174` / production admin
- [ ] User thường không gọi được admin API (token user → 401/403)
- [ ] Duyệt / từ chối 1 seller application giả
- [ ] **Try demo:** vào được dashboard; không toggle user / không xóa post (403 hoặc nút ẩn)
- [ ] Resolve 1 report + (nếu có) review 1 seller application bằng demo hoặc moderator
- [ ] Dashboard: click pending reports / seller apps → đúng queue
- [ ] Settings: thấy profile + danh sách quyền (read-only)

### 5.4 Deploy (bắt buộc ngày demo)

- [ ] `GET /health` user API + admin API
- [ ] Mở 4 URL Render, login QA
- [ ] Không lộ `.env` trên GitHub
- [ ] Gọi thử 1 upload (avatar hoặc post) — Cloudinary còn quota

---

## 6. Việc không làm (YAGNI) — và câu trả lời hội đồng

| Ý tưởng                   | Vì sao bỏ                                   | Trả lời nếu bị hỏi                                 |
| ------------------------- | ------------------------------------------- | -------------------------------------------------- |
| Elasticsearch bắt buộc    | Unified search SQL đã có; ES thêm ops + RAM | “Có compose local; production dùng fan-out v1”     |
| Storybook                 | Không tăng độ tin deploy                    | “Component test Vitest + Playwright”               |
| Coverage ≥ 70% gate       | Vanity, bỏ luồng tiền                       | “Coverage để tìm lỗ; cổng là CI + IDOR + UAT”      |
| Redis cache mọi GET       | Chưa đo chậm; Free tier                     | “Optional `REDIS_URL`; chưa có bottleneck đo được” |
| Kubernetes / Docker Swarm | Một region, 4 service Render                | “Overkill DATN; ADR 0002”                          |
| FCM / email marketing     | Socket noti đủ demo                         | “Email OTP/SMTP có; push native không thuộc AC”    |
| Stripe/PayPal thật        | PCI, sandbox phức tạp                       | “COD mock; trạng thái đơn vẫn state machine”       |
| Load test 10k user        | Không có SLA đồ án                          | “Rate limit + index Prisma khi chậm”               |

---

## 7. Thứ tự làm (2 tuần trước demo)

Làm trên xuống. Đừng xen Elasticsearch vào giữa.

### Bắt buộc

1. [ ] Sửa auth story: cookie **hoặc** chấp nhận + viết luận văn (B2)
2. [ ] Integration IDOR order / notification / message
3. [ ] `/health` ping DB
4. [ ] Runbook backup/restore Supabase (nửa trang trong `docs/deploy.md`)
5. [ ] CI admin-backend không phải job “install rồi xong”
6. [ ] UAT §5.1 + §5.4 trên tài khoản QA
7. [ ] Chạy Playwright local một lần, sửa test gãy do UI đổi

### Nên

1. [ ] PR template + branch protection CI
2. [ ] `npm audit` / Dependabot
3. [ ] StorePage seller nếu demo cửa hàng
4. [ ] AI gắn CreatePostModal nếu AC đồ án có AI
5. [ ] Label/keyboard auth + checkout

### Sau bảo vệ / nếu dư sức

1. Analytics admin, autocomplete, timezone scheduled posts, typing indicator

---

## 8. Bảng tiến độ (ước lượng, không phải KPI)

| Module              | Backend | Frontend     | Cổng chất lượng    | Ghi chú                                         |
| ------------------- | ------- | ------------ | ------------------ | ----------------------------------------------- |
| Auth                | ✅      | ✅           | 🟡 token storage   | Feature xong; bảo mật session chưa thống nhất   |
| Products / upload   | ✅      | ✅           | 🟡                 | Polish mô tả                                    |
| Categories          | ✅      | ✅           | ✅                 |                                                 |
| Cart / checkout COD | ✅      | ✅           | 🟡                 | Thêm test IDOR không áp dụng cart của user khác |
| Orders              | ✅      | 🟡 seller UI | 🟡                 | IDOR bắt buộc                                   |
| Feed / posts        | ✅      | ✅           | 🟡 XSS đã sanitize |                                                 |
| Scheduled posts     | ✅      | ✅           | ✅ cron            | TZ polish                                       |
| Messages            | ✅      | ✅           | 🟡                 | Socket room                                     |
| Notifications       | ✅      | ✅           | 🟡                 | UAT đa tab                                      |
| Groups              | ✅ v1   | ✅           | ✅ rules test      |                                                 |
| Reviews             | ✅      | ✅ core      | ✅                 |                                                 |
| Search              | ✅ v1   | ✅           | ✅                 | ES optional                                     |
| Seller              | ✅      | 🟡 store     | 🟡                 | KYC upload                                      |
| Profile             | ✅      | ✅           | ✅                 |                                                 |
| Admin               | 🟡      | 🟡           | ❌ test            | Cụm riêng                                       |
| AI                  | ✅      | 🟡 composer  | 🟡 quota           |                                                 |
| Saved / reports     | ✅      | 🟡 admin     | 🟡                 |                                                 |
| **Lớp B tổng**      | —       | —            | **🟡 ~45%**        | CI/test nền tốt; backup/IDOR/health DB thiếu    |

Ước **tính năng ~88%**. Ước **sẵn sàng bảo vệ** chỉ sau khi tick hết §7 Bắt buộc — đừng dùng “94%” kiểu checklist cũ (chỉ đếm module UI).

---

## 9. Next steps (lịch sử pha)

1. ✅ Phase 1 Products & categories
2. ✅ Phase 2 Cart & orders
3. ✅ Phase 3 Feed
4. ✅ Phase 3b Scheduled posts, marketplace, social API
5. ✅ Nền tảng: Helmet, rate limit, logging, env fail-fast, CI, Vitest/Playwright, Render live
6. 🎯 **Hiện tại:** Lớp B bắt buộc (§7) — IDOR, health DB, backup, admin CI, UAT, thống nhất JWT
7. Sau đó: AI inline, store public, polish UX

---

## Phụ lục A — Lệnh kiểm tra nhanh

```bash
# FE unit + typecheck (CI tương đương)
cd frontend && npm test && npm run lint && npm run build

# BE unit + HTTP; integration cần DATABASE_URL
cd backend && npm test
cd backend && npm run test:all

# E2E (cần Edge; mock API — không thay integration)
cd frontend && npx playwright install msedge && npm run test:e2e

# Health production
curl -sS https://be-socomain.onrender.com/health
curl -sS https://be-socoadmin.onrender.com/health
```

## Phụ lục B — Notification (rút gọn từ ma trận cũ)

Kỹ thuật realtime **đã code** (schema event, preferences, provider, reconnect). Các ô dưới là **chứng minh**, không phải feature mới:

- [ ] Tab A mark read → tab B badge
- [ ] Reconnect 15–30s: không duplicate `id`
- [ ] Preference off: không tạo noti loại đó
- [ ] User B không `PATCH` noti của user A
- [ ] Socket không nhận event user khác

Chi tiết field API: Swagger `/api-docs` và test HTTP hiện có. Không nhân 90 checkbox trong file tiến độ — dễ bỏ tick giả.

---

_Quy ước: cập nhật ngày ở đầu file mỗi lần đổi DoD hoặc URL production. Feature tick theo repo, không theo nhớ._
