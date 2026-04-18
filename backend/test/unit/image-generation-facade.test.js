import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("generateImageFromPrompt", () => {
    const prev = {};

    beforeEach(() => {
        prev.primary = process.env.AI_IMAGE_PRIMARY;
        prev.backup = process.env.AI_IMAGE_BACKUP;
        prev.legacy = process.env.AI_IMAGE_PROVIDER;
        prev.hf = process.env.HF_TOKEN;
        prev.rep = process.env.REPLICATE_API_TOKEN;

        process.env.AI_IMAGE_PRIMARY = "none";
        process.env.AI_IMAGE_BACKUP = "none";
        delete process.env.AI_IMAGE_PROVIDER;
        delete process.env.HF_TOKEN;
        delete process.env.REPLICATE_API_TOKEN;
    });

    afterEach(() => {
        process.env.AI_IMAGE_PRIMARY = prev.primary;
        process.env.AI_IMAGE_BACKUP = prev.backup;
        process.env.AI_IMAGE_PROVIDER = prev.legacy;
        if (prev.hf !== undefined) process.env.HF_TOKEN = prev.hf;
        else delete process.env.HF_TOKEN;
        if (prev.rep !== undefined) process.env.REPLICATE_API_TOKEN = prev.rep;
        else delete process.env.REPLICATE_API_TOKEN;
    });

    it("throws when no image providers configured", async () => {
        const { generateImageFromPrompt } = await import(
            "../../src/services/ai/image/generateImageFromPrompt.js"
        );
        await expect(generateImageFromPrompt("a cat")).rejects.toThrow(
            /NO_IMAGE_PROVIDERS_CONFIGURED/,
        );
    });
});
