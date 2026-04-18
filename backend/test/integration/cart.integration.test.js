import { it, expect, beforeAll, beforeEach, afterEach } from "vitest";
import { requestApp } from "../helpers/appRequest.js";
import {
    integrationDescribe,
    loginAsQaBuyer,
} from "../helpers/integrationEnv.js";
import { getOrCreateActiveProductId } from "../helpers/integrationFixtures.js";

let activeProductId;

integrationDescribe("cart (integration)", () => {
    beforeAll(async () => {
        activeProductId = await getOrCreateActiveProductId();
    });

    let agent;
    let bearerHeaders;

    beforeEach(async () => {
        agent = requestApp();
        const login = await loginAsQaBuyer(agent);
        bearerHeaders = login.bearerHeaders;
        await agent.get("/api/cart").set(bearerHeaders);
        await agent.delete("/api/cart").set(bearerHeaders);
    });

    afterEach(async () => {
        if (bearerHeaders) {
            await agent.delete("/api/cart").set(bearerHeaders);
        }
    });

    it("adds seeded product and returns cart with line item", async () => {
        const add = await agent
            .post("/api/cart/items")
            .set("Content-Type", "application/json")
            .set(bearerHeaders)
            .send({
                productId: activeProductId,
                quantity: 1,
            });

        expect(add.status).toBe(201);
        expect(add.body.success).toBe(true);

        const cart = await agent.get("/api/cart").set(bearerHeaders);
        expect(cart.status).toBe(200);
        expect(cart.body.success).toBe(true);
        const items = cart.body.data?.items ?? [];
        expect(items.some((row) => row.productId === activeProductId)).toBe(
            true,
        );
    });
});
