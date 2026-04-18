import { describe, it, expect } from "vitest";
import { requestApp } from "../helpers/appRequest.js";

describe("health and API root", () => {
    it("GET /health returns OK", async () => {
        const res = await requestApp().get("/health");
        expect(res.status).toBe(200);
        expect(res.body.status).toBe("OK");
    });

    it("GET /api returns welcome payload", async () => {
        const res = await requestApp().get("/api");
        expect(res.status).toBe(200);
        expect(res.body.version).toBe("1.0.0");
        expect(res.body.endpoints).toBeDefined();
    });
});
