import { describe, it, expect } from "vitest";
import { requestApp } from "../helpers/appRequest.js";

describe("infrastructure HTTP smoke", () => {
    it("notifications require authentication", async () => {
        const res = await requestApp().get("/api/notifications");
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(String(res.body.message)).toMatch(/not authorized/i);
    });

    it("AI history requires authentication", async () => {
        const res = await requestApp().get("/api/ai/history");
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it("scheduled posts require authentication", async () => {
        const res = await requestApp().get("/api/scheduled-posts");
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it("seller stats requires authentication", async () => {
        const res = await requestApp().get("/api/seller/stats");
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it("upload product requires authentication", async () => {
        const res = await requestApp().post("/api/upload/product");
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });
});
