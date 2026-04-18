import { describe, it, expect } from "vitest";
import { requestApp } from "../helpers/appRequest.js";

describe("auth HTTP smoke", () => {
    it("login validation fails with 400", async () => {
        const res = await requestApp()
            .post("/api/auth/login")
            .set("Content-Type", "application/json")
            .send({});
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Validation failed");
        expect(Array.isArray(res.body.errors)).toBe(true);
        expect(res.headers["x-request-id"]).toBeDefined();
        expect(res.headers["ratelimit-limit"]).toBeDefined();
    });

    it("protected profile requires authentication", async () => {
        const res = await requestApp().get("/api/auth/me");
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(String(res.body.message)).toMatch(/not authorized/i);
        expect(res.headers["x-request-id"]).toBeDefined();
    });
});
