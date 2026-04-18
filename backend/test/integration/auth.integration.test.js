import { it, expect } from "vitest";
import { requestApp } from "../helpers/appRequest.js";
import {
    integrationDescribe,
    loginAsQaBuyer,
} from "../helpers/integrationEnv.js";

integrationDescribe("auth (integration)", () => {
    it("login as QA buyer then GET /api/auth/me returns profile", async () => {
        const agent = requestApp();
        const { bearerHeaders, user } = await loginAsQaBuyer(agent);

        expect(user?.email).toBeDefined();

        const me = await agent.get("/api/auth/me").set(bearerHeaders);
        expect(me.status).toBe(200);
        expect(me.body.success).toBe(true);
        expect(me.body.data?.user?.email).toBe(user?.email);
    });

    it("GET /api/auth/me with invalid token returns 401", async () => {
        const res = await requestApp()
            .get("/api/auth/me")
            .set({ Authorization: "Bearer invalid-token-for-integration" });
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });
});
