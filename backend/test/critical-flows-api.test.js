import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";

process.env.NODE_ENV = "test";
process.env.SKIP_DB_CONNECT = "true";

async function startTestServer() {
    const { default: app } = await import("../src/app.js");
    const server = createServer(app);
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    const baseUrl = `http://127.0.0.1:${address.port}`;
    return { server, baseUrl };
}

test("auth flow: login validation fails with 400", async () => {
    const { server, baseUrl } = await startTestServer();

    try {
        const response = await fetch(`${baseUrl}/api/auth/login`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({}),
        });
        const body = await response.json();

        assert.equal(response.status, 400);
        assert.equal(body.success, false);
        assert.equal(body.message, "Validation failed");
        assert.ok(Array.isArray(body.errors));
        assert.ok(response.headers.get("x-request-id"));
        assert.ok(response.headers.get("ratelimit-limit"));
    } finally {
        server.close();
    }
});

test("auth flow: protected profile requires authentication", async () => {
    const { server, baseUrl } = await startTestServer();

    try {
        const response = await fetch(`${baseUrl}/api/auth/me`);
        const body = await response.json();

        assert.equal(response.status, 401);
        assert.equal(body.success, false);
        assert.match(body.message, /not authorized/i);
        assert.ok(response.headers.get("x-request-id"));
    } finally {
        server.close();
    }
});

test("order flow: create order requires authentication", async () => {
    const { server, baseUrl } = await startTestServer();

    try {
        const response = await fetch(`${baseUrl}/api/orders`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                shippingName: "A",
                shippingPhone: "0123456789",
                shippingAddress: "123 abc street",
                paymentMethod: "COD",
            }),
        });
        const body = await response.json();

        assert.equal(response.status, 401);
        assert.equal(body.success, false);
        assert.match(body.message, /not authorized/i);
        assert.ok(response.headers.get("x-request-id"));
    } finally {
        server.close();
    }
});

test("seller order update flow: status update requires authentication", async () => {
    const { server, baseUrl } = await startTestServer();

    try {
        const response = await fetch(`${baseUrl}/api/orders/test-order/status`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ status: "PROCESSING" }),
        });
        const body = await response.json();

        assert.equal(response.status, 401);
        assert.equal(body.success, false);
        assert.match(body.message, /not authorized/i);
    } finally {
        server.close();
    }
});

test("notifications flow: endpoints remain protected", async () => {
    const { server, baseUrl } = await startTestServer();

    try {
        const response = await fetch(`${baseUrl}/api/notifications`);
        const body = await response.json();

        assert.equal(response.status, 401);
        assert.equal(body.success, false);
        assert.match(body.message, /not authorized/i);
    } finally {
        server.close();
    }
});
