# Hướng dẫn kiểm thử backend

Tài liệu này mô tả cách chạy và hiểu bộ test của API Express (không mở port thật trong hầu hết test — gọi trực tiếp `app` qua HTTP giả lập).

## Stack

| Thành phần              | Vai trò                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| **Vitest**              | Test runner: chạy file test, báo pass/fail, hỗ trợ watch và UI.                              |
| **Supertest**           | Gửi request HTTP tới `app` Express (`request(app).get('/api/...')`) mà không cần `listen()`. |
| **@vitest/ui**          | Giao diện trình duyệt để xem danh sách test, lọc, timeline (chạy kèm `vitest --ui`).         |
| **@vitest/coverage-v8** | Đo **coverage**: dòng/lệnh trong `src/` được test thực thi bao nhiêu phần trăm (engine V8).  |

## Một số khái niệm

### Unit test (test đơn vị)

Kiểm tra **một hàm / module nhỏ** tách khỏi mạng và database thật khi có thể (dùng mock hoặc input cố định). Mục tiêu: logic đúng, nhanh, ổn định.

- Trong repo: [`test/unit/`](test/unit/).

### HTTP smoke

Gọi vài endpoint thật qua `app` để chắc chắn **route + middleware** phản hồi đúng kiểu (ví dụ 401 khi chưa đăng nhập, 400 khi body sai). Thường **không** cần dữ liệu phức tạp trong DB.

- Trong repo: [`test/http/`](test/http/).

### Integration test (tích hợp)

Gọi API **có kết nối PostgreSQL thật** (Prisma), để kiểm tra luồng gần giống production: đọc/ghi DB, serialize JSON, auth JWT. Cần `DATABASE_URL` hợp lệ; nếu không có biến này, cả khối test integration sẽ **bị bỏ qua** (skip).

- Trong repo: [`test/integration/`](test/integration/).
- Cấu hình riêng: [`vitest.integration.config.js`](vitest.integration.config.js) (ví dụ `pool: "forks"`, không chạy song song nhiều file — an toàn hơn với Prisma).

### Coverage (độ phủ)

Báo cáo cho biết phần code trong `src/` đã được **chạy qua** khi chạy test bao nhiêu. Không phải “đã test đủ hay chưa” hoàn toàn, nhưng giúp thấy vùng chưa được đụng tới.

- Báo cáo HTML (sau khi chạy lệnh có `--coverage`): thư mục `coverage/` (unit/http) hoặc `coverage-integration/` (integration).

### Watch mode & Vitest UI

- **Watch**: chạy lại test khi sửa file (`npm run test:watch`).
- **UI**: mở giao diện để xem và lọc test (`npm run test:ui` hoặc `npm run test:integration:ui`).

## Cấu trúc thư mục `test/`

```
test/
├── setup/
│   ├── vitest.setup.js              # env chung cho unit + http
│   └── vitest.integration.setup.js  # env cho integration (ví dụ NODE_ENV=test, JWT_SECRET mặc định)
├── helpers/
│   ├── appRequest.js                # supertest + app
│   ├── authHeaders.js               # header Bearer
│   ├── integrationEnv.js            # skip khi không có DATABASE_URL, login helper
│   └── integrationFixtures.js       # tạo/đảm bảo user & product qua Prisma khi cần
├── unit/                            # unit tests
├── http/                            # smoke HTTP
└── integration/                     # integration (cần DB)
```

## Lệnh thường dùng

| Lệnh                                | Ý nghĩa                                           |
| ----------------------------------- | ------------------------------------------------- |
| `npm run test`                      | Chạy **unit + http** một lần (`vitest run`).      |
| `npm run test:watch`                | Unit + http ở chế độ watch.                       |
| `npm run test:ui`                   | Unit + http với **Vitest UI** (watch).            |
| `npm run test:ui:run`               | Unit + http một lần + mở UI.                      |
| `npm run test:coverage`             | Unit + http + **coverage** → `coverage/`.         |
| `npm run test:integration`          | Chỉ **integration** (cần `DATABASE_URL`).         |
| `npm run test:integration:ui`       | Integration + UI.                                 |
| `npm run test:coverage:integration` | Integration + coverage → `coverage-integration/`. |
| `npm run test:all`                  | `test` rồi `test:integration` (dùng trong CI).    |

## Chạy integration trên máy local

1. Cấu hình `DATABASE_URL` trong `backend/.env` (PostgreSQL đã migrate/schema khớp).
2. (Khuyến nghị) `npm run prisma:migrate:deploy` hoặc `prisma:push` tùy quy trình team.
3. Chạy `npm run test:integration` hoặc `npm run test:all`.

Khi không set `DATABASE_URL`, các file trong `test/integration/` được bọc bởi `integrationDescribe` nên **không chạy** (skip), tránh lỗi kết nối.

### Biến môi trường gợi ý

| Biến                                                     | Ghi chú                                                                                                                                           |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                           | Bắt buộc để integration thực sự chạy.                                                                                                             |
| `JWT_SECRET`                                             | Dùng khi test login/JWT; file setup integration có giá trị mặc định nếu thiếu (phù hợp CI/local nhanh).                                           |
| `INTEGRATION_BUYER_EMAIL` / `INTEGRATION_BUYER_PASSWORD` | Tuỳ chọn: ghi đè tài khoản buyer dùng cho login trong integration (mặc định xem [`integrationFixtures.js`](test/helpers/integrationFixtures.js)). |

Helper **`integrationFixtures`** có thể tạo user/product tối thiểu qua Prisma nếu DB trống, nên không bắt buộc phải `prisma:seed` để chạy được integration trên máy dev (CI vẫn có thể seed — xem workflow).

## CI

Trên GitHub Actions, job backend thường: cài dependency → validate Prisma → generate client → `migrate deploy` → **seed** (dữ liệu QA) → `npm run test:all` với `DATABASE_URL` và `JWT_SECRET` phù hợp. Chi tiết xem [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

## Thêm test mới

- **Unit**: thêm `*.test.js` trong `test/unit/`, import `describe` / `it` / `expect` từ `vitest`.
- **Smoke HTTP**: thêm vào `test/http/`, dùng [`requestApp()`](test/helpers/appRequest.js).
- **Integration**: thêm `*.integration.test.js` trong `test/integration/`, bọc bằng `integrationDescribe` từ [`integrationEnv.js`](test/helpers/integrationEnv.js), tái sử dụng fixture/login nếu cần.

File cấu hình chính: [`vitest.config.js`](vitest.config.js) (unit + http), [`vitest.integration.config.js`](vitest.integration.config.js) (integration).
