import { it, expect, beforeAll } from "vitest";
import { requestApp } from "../helpers/appRequest.js";
import { integrationDescribe } from "../helpers/integrationEnv.js";
import { getOrCreateActiveProductId } from "../helpers/integrationFixtures.js";

let activeProductId;

integrationDescribe("catalog products (integration)", () => {
    beforeAll(async () => {
        activeProductId = await getOrCreateActiveProductId();
    });

    it("GET /api/products returns paginated list", async () => {
        const res = await requestApp().get("/api/products").query({ limit: 5 });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.pagination).toBeDefined();
    });

    it("GET /api/products/:id returns active product", async () => {
        const res = await requestApp().get(`/api/products/${activeProductId}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data?.id).toBe(activeProductId);
        expect(res.body.data?.slug).toBeDefined();
    });
});
