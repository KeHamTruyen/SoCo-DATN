import { describe, it, expect } from "vitest";
import { requestApp } from "../helpers/appRequest.js";

describe("social HTTP smoke", () => {
    it("create group requires authentication", async () => {
        const res = await requestApp()
            .post("/api/groups")
            .set("Content-Type", "application/json")
            .send({ name: "Test" });
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it("messages conversations require authentication", async () => {
        const res = await requestApp().get("/api/messages/conversations");
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it("create post requires authentication", async () => {
        const res = await requestApp()
            .post("/api/posts")
            .set("Content-Type", "application/json")
            .send({});
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it("create report requires authentication", async () => {
        const res = await requestApp()
            .post("/api/reports")
            .set("Content-Type", "application/json")
            .send({});
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });
});
