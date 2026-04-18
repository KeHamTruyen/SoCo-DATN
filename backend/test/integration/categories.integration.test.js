import { it, expect } from "vitest";
import { requestApp } from "../helpers/appRequest.js";
import { integrationDescribe } from "../helpers/integrationEnv.js";

integrationDescribe("categories (integration)", () => {
    it("GET /api/categories returns list", async () => {
        const res = await requestApp().get("/api/categories");
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});
