import { describe, expect, it } from "vitest";
import { requestApp } from "../helpers/appRequest.js";

const ID = "00000000-0000-4000-8000-000000000001";

const protectedEndpoints = [
    ["AUTH", "GET", "/api/auth/me"],
    ["AUTH", "PUT", "/api/auth/profile"],
    ["AUTH", "PUT", "/api/auth/password"],
    ["AUTH", "GET", "/api/auth/privacy"],
    ["AUTH", "GET", "/api/auth/2fa/status"],
    ["AUTH", "POST", "/api/auth/2fa/enable"],
    ["AUTH", "POST", "/api/auth/2fa/confirm"],
    ["AUTH", "POST", "/api/auth/2fa/disable"],
    ["USER", "GET", "/api/users/me"],
    ["USER", "POST", `/api/users/${ID}/follow`],
    ["POST", "GET", "/api/posts/feed"],
    ["POST", "POST", "/api/posts"],
    ["POST", "PUT", `/api/posts/${ID}`],
    ["POST", "DELETE", `/api/posts/${ID}`],
    ["POST", "POST", `/api/posts/${ID}/like`],
    ["POST", "POST", `/api/posts/${ID}/comments`],
    ["PRODUCT", "GET", "/api/products/seller/me"],
    ["PRODUCT", "POST", "/api/products"],
    ["PRODUCT", "PUT", `/api/products/${ID}`],
    ["PRODUCT", "DELETE", `/api/products/${ID}`],
    ["PRODUCT", "POST", `/api/products/${ID}/restore`],
    ["PRODUCT", "POST", `/api/products/${ID}/publish`],
    ["PRODUCT", "POST", `/api/products/${ID}/images`],
    ["PRODUCT", "POST", `/api/products/seller/me/${ID}/variants`],
    ["CART", "GET", "/api/cart"],
    ["CART", "GET", "/api/cart/count"],
    ["CART", "POST", "/api/cart/items"],
    ["CART", "PUT", `/api/cart/items/${ID}`],
    ["CART", "DELETE", `/api/cart/items/${ID}`],
    ["CART", "DELETE", "/api/cart"],
    ["ORDER", "POST", "/api/orders"],
    ["ORDER", "GET", "/api/orders/my/purchases"],
    ["ORDER", "GET", "/api/orders/my/sales"],
    ["ORDER", "GET", `/api/orders/${ID}`],
    ["ORDER", "PUT", `/api/orders/${ID}/status`],
    ["ORDER", "POST", `/api/orders/${ID}/cancel`],
    ["ORDER", "POST", `/api/orders/${ID}/payment/confirm`],
    ["ORDER", "POST", `/api/orders/${ID}/refund-request`],
    ["ORDER", "POST", `/api/orders/${ID}/refund`],
    ["REVIEW", "POST", "/api/reviews"],
    ["REVIEW", "POST", `/api/reviews/${ID}/reply`],
    ["GROUP", "POST", "/api/groups"],
    ["GROUP", "GET", "/api/groups/me"],
    ["GROUP", "POST", `/api/groups/${ID}/join`],
    ["GROUP", "POST", `/api/groups/${ID}/posts`],
    ["MSG", "GET", "/api/messages/conversations"],
    ["MSG", "POST", "/api/messages/conversations"],
    ["MSG", "POST", `/api/messages/conversations/${ID}`],
    ["MSG", "PATCH", `/api/messages/conversations/${ID}/read`],
    ["NOTI", "GET", "/api/notifications"],
    ["NOTI", "PATCH", `/api/notifications/${ID}/read`],
    ["NOTI", "PATCH", "/api/notifications/read-all"],
    ["NOTI", "GET", "/api/notifications/preferences"],
    ["NOTI", "PATCH", "/api/notifications/preferences"],
    ["SCHEDULED", "POST", "/api/scheduled-posts"],
    ["SCHEDULED", "GET", "/api/scheduled-posts"],
    ["SCHEDULED", "PUT", `/api/scheduled-posts/${ID}`],
    ["SCHEDULED", "POST", `/api/scheduled-posts/${ID}/publish`],
    ["SCHEDULED", "DELETE", `/api/scheduled-posts/${ID}`],
    ["AI", "GET", "/api/ai/history"],
    ["AI", "POST", "/api/ai/generate-text"],
    ["AI", "POST", "/api/ai/generate-image-text"],
    ["AI", "POST", "/api/ai/generate-video-images-text"],
    ["AI_ASSISTANT", "POST", "/api/ai-assistant/chat"],
    ["REPORT", "POST", "/api/reports"],
    ["REPORT", "GET", "/api/reports/me"],
    ["SAVED", "GET", "/api/saved-items"],
    ["SELLER", "GET", "/api/seller/stats"],
    ["ADMIN", "GET", "/api/admin/auth/me"],
    ["ADMIN", "GET", "/api/admin/categories"],
    ["ADMIN", "GET", "/api/admin/seller/applications"],
    ["ADMIN", "DELETE", `/api/admin/posts/${ID}`],
];

const publicValidationCases = [
    ["AUTH", "POST", "/api/auth/register", {}, /validation failed/i],
    ["AUTH", "POST", "/api/auth/login", {}, /validation failed/i],
    ["AUTH", "POST", "/api/auth/verify-email", {}, /validation failed/i],
    ["AUTH", "POST", "/api/auth/resend-verification", {}, /validation failed/i],
    ["AUTH", "POST", "/api/auth/verify-2fa", {}, /validation failed/i],
    ["AUTH", "POST", "/api/auth/forgot-password", {}, /validation failed/i],
    ["AUTH", "POST", "/api/auth/reset-password", {}, /validation failed/i],
];

function send(method, path) {
    return requestApp()[method.toLowerCase()](path);
}

describe("documented API contract smoke tests", () => {
    it.each(protectedEndpoints)(
        "%s %s %s rejects requests without authentication",
        async (_group, method, path) => {
            const res = await send(method, path).send({});
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(String(res.body.message)).toMatch(/not authorized/i);
            expect(res.headers["x-request-id"]).toBeDefined();
        },
    );

    it.each(publicValidationCases)(
        "%s %s %s validates required public auth fields",
        async (_group, method, path, body, messagePattern) => {
            const res = await send(method, path)
                .set("Content-Type", "application/json")
                .send(body);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(String(res.body.message)).toMatch(messagePattern);
        },
    );

    it("rejects malformed bearer tokens before protected business logic", async () => {
        const res = await requestApp()
            .get("/api/auth/me")
            .set("Authorization", "Bearer not-a-valid-jwt");

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(String(res.body.message)).toMatch(/invalid or expired token/i);
    });

    it("keeps public API metadata available for smoke checks", async () => {
        const res = await requestApp().get("/api");

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/social commerce api/i);
        expect(res.body.endpoints).toMatchObject({
            auth: "/api/auth",
            products: "/api/products",
            orders: "/api/orders",
            ai: "/api/ai",
            aiAssistant: "/api/ai-assistant",
        });
    });
});
