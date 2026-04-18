import { describe, it, expect } from "vitest";
import { requestApp } from "../helpers/appRequest.js";

describe("commerce HTTP smoke", () => {
    it("create order requires authentication", async () => {
        const res = await requestApp()
            .post("/api/orders")
            .set("Content-Type", "application/json")
            .send({
                shippingName: "A",
                shippingPhone: "0123456789",
                shippingAddress: "123 abc street",
                paymentMethod: "COD",
            });
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(String(res.body.message)).toMatch(/not authorized/i);
        expect(res.headers["x-request-id"]).toBeDefined();
    });

    it("seller order status update requires authentication", async () => {
        const res = await requestApp()
            .put("/api/orders/test-order/status")
            .set("Content-Type", "application/json")
            .send({ status: "PROCESSING" });
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(String(res.body.message)).toMatch(/not authorized/i);
    });

    it("cart requires authentication", async () => {
        const res = await requestApp().get("/api/cart");
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it("add to cart requires authentication", async () => {
        const res = await requestApp()
            .post("/api/cart/items")
            .set("Content-Type", "application/json")
            .send({ productId: "00000000-0000-4000-8000-000000000001", quantity: 1 });
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it("create review requires authentication", async () => {
        const res = await requestApp()
            .post("/api/reviews")
            .set("Content-Type", "application/json")
            .send({});
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it("saved items require authentication", async () => {
        const res = await requestApp().get("/api/saved-items");
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });
});
