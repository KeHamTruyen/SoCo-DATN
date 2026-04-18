import { it, expect } from "vitest";
import { requestApp } from "../helpers/appRequest.js";
import { integrationDescribe } from "../helpers/integrationEnv.js";

integrationDescribe("posts public feed (integration)", () => {
    it("GET /api/posts returns feed envelope without auth", async () => {
        const res = await requestApp().get("/api/posts").query({ limit: 5 });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});
