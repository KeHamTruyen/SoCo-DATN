/**
 * HTTP smoke for admin authz (CI).
 * Expects admin API already listening; DB seeded with demo.admin.
 *
 * Run: node scripts/smoke-authz.mjs
 */
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

const BASE = process.env.SMOKE_BASE_URL || "http://127.0.0.1:5001";
const DEMO_EMAIL = "demo.admin@socialcommerce.vn";
const DEMO_PASS = process.env.SEED_DEMO_ADMIN_PASSWORD || "DemoAdmin@123";
const ADMIN_SECRET =
    process.env.ADMIN_JWT_SECRET || "ci-admin-jwt-secret-min-32-chars-ok";

async function req(path, opts = {}) {
    const res = await fetch(`${BASE}${path}`, opts);
    const text = await res.text();
    let body = null;
    try {
        body = text ? JSON.parse(text) : null;
    } catch {
        body = { raw: text };
    }
    return { status: res.status, body };
}

// 1) No token → 401
{
    const r = await req("/api/admin/dashboard");
    assert.equal(r.status, 401, `no-token: ${JSON.stringify(r.body)}`);
}

// 2) User-style JWT (wrong principal) → 401
{
    const userToken = jwt.sign(
        { id: "user-not-admin", principal: "user", role: "BUYER" },
        ADMIN_SECRET,
        { expiresIn: "1h" },
    );
    const r = await req("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.equal(r.status, 401, `user-token: ${JSON.stringify(r.body)}`);
}

// 3) Demo login
const login = await req("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASS }),
});
assert.equal(login.status, 200, `login: ${JSON.stringify(login.body)}`);
const accessToken = login.body?.data?.accessToken;
assert.ok(accessToken, "login missing accessToken");
assert.equal(login.body?.data?.user?.profile, "demo", "expected demo profile");

// 4) Demo can read dashboard
{
    const r = await req("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    assert.equal(r.status, 200, `dashboard: ${JSON.stringify(r.body)}`);
    assert.equal(typeof r.body?.data?.pendingReports, "number");
}

// 5) Demo cannot update users → 403
{
    const r = await req(
        "/api/admin/users/00000000-0000-4000-8000-000000000001/toggle-active",
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        },
    );
    assert.equal(r.status, 403, `demo toggle: ${JSON.stringify(r.body)}`);
}

console.log("smoke-authz: ok");
