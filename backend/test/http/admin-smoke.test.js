import { describe, it, expect } from "vitest";
import { requestApp } from "../helpers/appRequest.js";

describe("admin HTTP smoke", () => {
    it("admin login validation fails with 400", async () => {
        const res = await requestApp()
            .post("/api/admin/auth/login")
            .set("Content-Type", "application/json")
            .send({});
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Validation failed");
    });

    it("admin me requires authentication", async () => {
        const res = await requestApp().get("/api/admin/auth/me");
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });
});
