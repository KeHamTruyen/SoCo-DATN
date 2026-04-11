import test from "node:test";
import assert from "node:assert/strict";

test("generateImageFromPrompt throws when no image providers configured", async () => {
    const prevPrimary = process.env.AI_IMAGE_PRIMARY;
    const prevBackup = process.env.AI_IMAGE_BACKUP;
    const prevLegacy = process.env.AI_IMAGE_PROVIDER;
    const prevHf = process.env.HF_TOKEN;
    const prevRep = process.env.REPLICATE_API_TOKEN;

    process.env.AI_IMAGE_PRIMARY = "none";
    process.env.AI_IMAGE_BACKUP = "none";
    delete process.env.AI_IMAGE_PROVIDER;
    delete process.env.HF_TOKEN;
    delete process.env.REPLICATE_API_TOKEN;

    const { generateImageFromPrompt } = await import(
        "../src/services/ai/image/generateImageFromPrompt.js"
    );
    await assert.rejects(
        () => generateImageFromPrompt("a cat"),
        /NO_IMAGE_PROVIDERS_CONFIGURED/,
    );

    process.env.AI_IMAGE_PRIMARY = prevPrimary;
    process.env.AI_IMAGE_BACKUP = prevBackup;
    process.env.AI_IMAGE_PROVIDER = prevLegacy;
    if (prevHf !== undefined) process.env.HF_TOKEN = prevHf;
    else delete process.env.HF_TOKEN;
    if (prevRep !== undefined) process.env.REPLICATE_API_TOKEN = prevRep;
    else delete process.env.REPLICATE_API_TOKEN;
});
