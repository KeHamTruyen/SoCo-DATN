# Hướng dẫn kiểm thử frontend

Ứng dụng React (Vite) dùng **hai lớp** kiểm thử: **Vitest** (nhanh, cô lập) và **Playwright** (E2E trình duyệt). Tổng quan monorepo: [TESTING.md](../TESTING.md).

## Stack

| Thành phần | Vai trò |
| ---------- | ------- |
| **Vitest** | Test runner cho logic React (hooks, utils, component nhỏ). |
| **jsdom** | Môi trường DOM giả trong Node (không mở Chrome thật). |
| **@testing-library/react** | `render`, `renderHook`, tương tác giống người dùng. |
| **@testing-library/jest-dom** | Matcher DOM (`toBeVisible`, …) khi dùng kèm setup (nếu thêm sau). |
| **vi.mock** (Vitest) | Thay API, context, router bằng mock ổn định. |
| **Playwright** | E2E: mở app thật, điều hướng route, assert UI. |
| **Vite + @vitejs/plugin-react** | Cùng pipeline build/dev; Vitest dùng config [vitest.config.ts](vitest.config.ts). |

## Hai lớp kiểm thử

### 1. Unit / component (Vitest)

Kiểm tra **một hook, util hoặc component** tách khỏi backend thật. API và session thường được **mock** (`vi.mock`).

- File đặt **cạnh mã nguồn** trong thư mục `__tests__` hoặc `__test__`.
- Ví dụ: `src/features/auth/hooks/__tests__/useAuthActions.test.ts`.
- **Không** gọi `http://localhost:5000` thật trong lớp này.

**Khái niệm thường gặp**

| Thuật ngữ | Ý nghĩa trong repo |
| --------- | ------------------- |
| Hook test | `renderHook(() => useX())` + `act` khi gọi async/setState. |
| Mock module | `vi.mock('../api/foo')` trả về hàm `vi.fn()`. |
| Hoisted mock | `vi.hoisted(() => ({ fn: vi.fn() }))` để mock dùng trong factory `vi.mock`. |

### 2. End-to-end (Playwright)

Kiểm tra **luồng người dùng** trên app chạy thật (`npm run dev` trên port 3000). Request tới API (`http://localhost:5000/api/**`) được **chặn và trả JSON giả** qua [e2e/helpers/apiMocks.ts](e2e/helpers/apiMocks.ts) — không bắt buộc backend chạy khi E2E.

- Thư mục: [e2e/](e2e/).
- Cấu hình: [playwright.config.ts](playwright.config.ts).

## Cấu trúc thư mục

```
frontend/
├── vitest.config.ts          # unit: jsdom, exclude e2e/
├── playwright.config.ts      # E2E: Edge, webServer dev
├── e2e/
│   ├── helpers/
│   │   └── apiMocks.ts       # mock REST cho Playwright
│   ├── auth-login.spec.ts
│   ├── auth-2fa.spec.ts
│   ├── protected-routes.spec.ts
│   ├── marketplace-search.spec.ts
│   ├── cart.spec.ts
│   ├── orders.spec.ts
│   ├── groups.spec.ts
│   ├── messages.spec.ts
│   ├── notifications.spec.ts
│   └── ai-assistant.spec.ts
└── src/
    ├── pages/__tests__/      # ví dụ Marketplace page
    └── features/
        └── <feature>/
            ├── hooks/__tests__/ | __test__/
            ├── context/__tests__/
            └── components/__tests__/
```

Các feature có test Vitest gồm (không đầy đủ): `auth`, `ai`, `cart`, `checkout`, `feed`, `group`, `marketplace`, `messaging`, `notification`, `order`, `product`, `profile`, `search`, `seller`, `seller-dashboard`.

## Cấu hình Vitest

File [vitest.config.ts](vitest.config.ts):

- `environment: "jsdom"` — DOM cho React.
- `globals: true` — dùng `describe` / `it` / `expect` / `vi` không cần import (tùy file vẫn có thể import rõ ràng).
- `exclude: ["e2e/**", ...]` — E2E chỉ chạy bằng Playwright.

Chạy một file hoặc pattern:

```bash
cd frontend
npx vitest run src/features/auth/hooks/__tests__/useAuthActions.test.ts
npx vitest run --config vitest.config.ts -t "login"
```

Chế độ watch (phát triển):

```bash
npx vitest --config vitest.config.ts
```

## Lệnh npm

| Lệnh | Ý nghĩa |
| ---- | ------- |
| `npm test` | Vitest một lần — **dùng trong CI**. |
| `npm run lint` | `tsc --noEmit` — kiểm tra type, không chạy test. |
| `npm run test:e2e` | Playwright: khởi động dev server + chạy `e2e/*.spec.ts`. |
| `npm run test:e2e:ui` | Playwright UI mode (debug, chọn test). |

Cài trình duyệt E2E (một lần):

```bash
cd frontend
npx playwright install msedge
```

Project CI frontend dùng **Edge channel** (`msedge`); máy Windows thường đã có Edge.

## Playwright — hành vi quan trọng

Từ [playwright.config.ts](playwright.config.ts):

| Tuỳ chọn | Lý do |
| -------- | ----- |
| `workers: 1`, `fullyParallel: false` | Một Vite dev server không ổn định khi nhiều browser song song. |
| `webServer.reuseExistingServer: false` | Luôn server mới — tránh instance cũ trên `:3000`. |
| `baseURL: http://127.0.0.1:3000` | Khớp `npm run dev`. |
| Mock API `localhost:5000` | E2E không phụ thuộc backend; đổi contract API cần cập nhật `apiMocks.ts`. |

Trace/screenshot khi fail: `trace: retain-on-failure`, `screenshot: only-on-failure`. Báo cáo HTML: `playwright-report/` sau khi chạy.

## CI

Job `frontend` trong [.github/workflows/ci.yml](../.github/workflows/ci.yml):

1. `npm ci`
2. `npm run lint`
3. `npm test` (Vitest)
4. `npm run build`

**E2E không chạy trên CI** — chạy local trước khi merge thay đổi routing, auth guard, hoặc mock API lớn.

## Thêm test mới

### Vitest (hook / util)

1. Tạo `__tests__/TenFile.test.ts` cạnh module được test.
2. Mock phụ thuộc ngoài (API, context, router):

```ts
vi.mock("../../api/authApi", () => ({
    authApi: { login: vi.fn() },
}));
```

3. Hook: `renderHook` + `act`; component: `render` + query theo role/label.
4. Chạy: `npm test` hoặc `npx vitest run <đường-dẫn-file>`.

### Playwright (luồng UI)

1. Thêm `e2e/ten-luong.spec.ts`.
2. Dùng `mockGuestApi(page, { ... })` (hoặc helper tương tự) từ [e2e/helpers/apiMocks.ts](e2e/helpers/apiMocks.ts).
3. `page.goto("/route")`, assert `expect(page).toHaveURL(...)`, `getByRole`, `getByLabel`.
4. Chạy: `npm run test:e2e` hoặc `npx playwright test e2e/auth-login.spec.ts`.

## Xử lý lỗi thường gặp

| Triệu chứng | Hướng xử lý |
| ----------- | ----------- |
| `Cannot find module` / alias `@/` | Đảm bảo import giống mã app; Vitest dùng cùng `vite` resolve nếu cần thêm `resolve.alias` vào `vitest.config.ts`. |
| Timeout E2E | Port 3000 bận — tắt dev server cũ; Playwright timeout 180s cho `webServer`. |
| E2E fail sau đổi API | Cập nhật mock trong `apiMocks.ts`, không chỉ sửa component. |
| `vi.mock` không áp dụng | Mock phải nằm **trước** import module bị mock; dùng `vi.hoisted` nếu factory tham chiếu biến ngoài. |
| Test pass local, fail CI | CI chỉ Vitest — kiểm tra `npm run lint` và path file có trong repo. |

## Liên kết

- Tổng quan + backend: [TESTING.md](../TESTING.md)
- API / DB integration: [backend/TEST.md](../backend/TEST.md)
