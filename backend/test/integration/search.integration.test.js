import { it, expect } from "vitest";
import { requestApp } from "../helpers/appRequest.js";
import { integrationDescribe } from "../helpers/integrationEnv.js";

integrationDescribe("search (integration)", () => {
    it("GET /api/search?q= requires q", async () => {
        const res = await requestApp().get("/api/search");
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("GET /api/search?q=earbuds returns results envelope", async () => {
        const res = await requestApp().get("/api/search").query({ q: "earbuds" });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
    });
});
