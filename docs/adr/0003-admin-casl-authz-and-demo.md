---
status: accepted
---

# Admin authz bằng CASL + tài khoản demo guest

Admin SoCo (`socoadmin` / `be-socoadmin`) dùng **CASL** (`@casl/ability`) để phân quyền theo profile trên `admins.permissions`, và có **Try demo** (guest CV) với quyền hẹp + rate limit — không dựng RBAC UI / IdP riêng.

## Context

- Mọi route admin hiện chỉ `protect` + `restrictTo("ADMIN")` → login được = full quyền.
- Cột `Admin.permissions` (Json) đã có trong Prisma nhưng chưa enforce.
- Cần guest tương tác admin trên deployment demo (CV / hội đồng) mà không cho xóa user, đổi role, phá category.

## Decision

1. **CASL** là lớp authz duy nhất cho admin API + SPA (cùng định nghĩa ability).
2. Profile ghi trong `admins.permissions`, ví dụ `{ "profile": "demo" }` — không bảng `roles` riêng.
3. Profiles cố định trong code: `super` | `moderator` | `ops` | `demo`.
4. Guest: nút **Try demo** → login seed `demo.admin@…`; rate limit theo IP trên login + write.
5. DB reset: **không** snapshot Postgres; thu hẹp ability trước; optional nightly reseed sau khi demo được ghi nhiều.

## Ability map (v1)

| Subject | Actions |
| --- | --- |
| `Dashboard` | `read` |
| `User` | `read`, `update` |
| `Post`, `Product` | `read`, `delete` |
| `Category` | `read`, `manage` |
| `Report` | `read`, `resolve` |
| `SellerApplication` | `read`, `review` |
| `SensitiveChange` | `read`, `review` |
| `Settings` | `read` |

| Profile | Được phép (tóm tắt) |
| --- | --- |
| `super` | `manage` all |
| `moderator` | Dashboard; Report; Content read/delete; User read |
| `ops` | Dashboard; Category; Seller + Sensitive review |
| `demo` | Dashboard; User/Content/Category **read**; Report resolve; Seller review — **không** User update, Content delete, Category manage |

BE là nguồn sự thật (403). FE dùng `@casl/react` chỉ để ẩn nav/nút.

## Considered options

| Option | Lý do không chọn (lúc này) |
| --- | --- |
| Deny-list middleware ad-hoc | Dễ lệch FE/BE; khó mở rộng moderator/ops |
| Casbin / OPA | Ops nặng hơn nhu cầu DATN |
| Keycloak / Auth0 roles | Admin JWT riêng đã có; thêm IdP không cần |
| Full RBAC UI | Ngoài scope CV; YAGNI |

## Consequences

- Thêm dependency `@casl/ability` (admin BE) và `@casl/ability` + `@casl/react` (admin FE).
- Shared ability factory: `admin/shared/ability.js` (một nguồn; FE import hoặc mirror mỏng nếu bundler hạn chế).
- Seed cập nhật `permissions.profile` cho admin/moderator/ops + tạo `demo.admin`.
- Checklist triển khai: [DEVELOPMENT_CHECKLIST.md](../../DEVELOPMENT_CHECKLIST.md) §4.14 phases P0–P3.
- Không thay Cloudinary upload user; không đổi user-app auth.

## Out of scope

- UI gán quyền động, multi-tenant, ABAC theo field.
- Auto-login `?demo=1` trên production không gắn `ALLOW_DEMO_ADMIN` (nếu thêm sau: chỉ khi env bật).
- Nightly full `prisma migrate reset` trên production (cấm).
