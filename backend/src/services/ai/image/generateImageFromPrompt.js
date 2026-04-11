import {
    hasHuggingfaceCredentials,
    hasReplicateCredentials,
} from "../../../config/ai/imageEnv.js";
import { huggingfaceTextToImage } from "./huggingfaceTextToImage.js";
import { replicateTextToImage } from "./replicateTextToImage.js";

function nonEmpty(v) {
    return v != null && String(v).trim() !== "";
}

/**
 * Ordered list of image backends to try (primary → backup).
 * @returns {("huggingface"|"replicate")[]}
 */
export function resolveImageProviderChain() {
    const hasHf = hasHuggingfaceCredentials();
    const hasRep = hasReplicateCredentials();

    const pRaw = process.env.AI_IMAGE_PRIMARY;
    const bRaw = process.env.AI_IMAGE_BACKUP;
    const legacy = (process.env.AI_IMAGE_PROVIDER || "").trim().toLowerCase();

    /** @type {string} */
    let primary;
    /** @type {string} */
    let backup;

    if (nonEmpty(pRaw)) {
        primary = String(pRaw).trim().toLowerCase();
    } else if (legacy === "none") {
        primary = "none";
    } else if (legacy === "huggingface" || legacy === "replicate") {
        primary = legacy;
    } else {
        primary = "huggingface";
    }

    if (nonEmpty(bRaw)) {
        backup = String(bRaw).trim().toLowerCase();
    } else if (legacy === "none") {
        backup = "none";
    } else if (legacy === "huggingface") {
        backup = "replicate";
    } else if (legacy === "replicate") {
        backup = "huggingface";
    } else if (primary === "none") {
        backup = "none";
    } else {
        backup = "replicate";
    }

    /** @type {("huggingface"|"replicate")[]} */
    const ordered = [];
    if (primary !== "none") {
        if (primary === "huggingface" || primary === "replicate") {
            ordered.push(primary);
        }
    }
    if (backup !== "none" && backup !== primary) {
        if (backup === "huggingface" || backup === "replicate") {
            ordered.push(backup);
        }
    }

    const seen = new Set();
    const unique = ordered.filter((p) => {
        if (seen.has(p)) return false;
        seen.add(p);
        return true;
    });

    return unique.filter((p) => {
        if (p === "huggingface") return hasHf;
        if (p === "replicate") return hasRep;
        return false;
    });
}

/**
 * @param {"huggingface"|"replicate"} provider
 * @param {string} prompt
 */
async function runProvider(provider, prompt) {
    if (provider === "huggingface") {
        return huggingfaceTextToImage(prompt);
    }
    return replicateTextToImage(prompt);
}

/**
 * Try primary then backup until one succeeds.
 * @param {string} prompt
 * @returns {Promise<{ mimeType: string, data: string }>}
 */
export async function generateImageFromPrompt(prompt) {
    const chain = resolveImageProviderChain();
    if (chain.length === 0) {
        throw new Error("NO_IMAGE_PROVIDERS_CONFIGURED");
    }

    /** @type {Error|null} */
    let lastErr = null;
    for (const provider of chain) {
        try {
            return await runProvider(provider, prompt);
        } catch (err) {
            lastErr = err instanceof Error ? err : new Error(String(err));
        }
    }
    throw lastErr ?? new Error("All image providers failed");
}
