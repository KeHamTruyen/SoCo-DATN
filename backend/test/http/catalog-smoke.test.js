import { describe, it, expect } from "vitest";
import { requestApp } from "../helpers/appRequest.js";

describe("catalog HTTP smoke (no DB for search validation)", () => {
    it("search requires q parameter", async () => {
        const res = await requestApp().get("/api/search");
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/q is required/i);
    });
});
