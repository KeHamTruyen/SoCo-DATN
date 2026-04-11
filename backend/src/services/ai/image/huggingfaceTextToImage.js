/**
 * Hugging Face Inference Providers — text-to-image (raw image bytes).
 * @see https://huggingface.co/docs/inference-providers/tasks/text-to-image
 */
import {
    getHfImageModel,
    getHfInferenceBaseUrl,
    getHfToken,
} from "../../../config/ai/imageEnv.js";

/**
 * @param {string} prompt
 * @returns {Promise<{ mimeType: string, data: string }>}
 */
export async function huggingfaceTextToImage(prompt) {
    const token = getHfToken();
    if (!token) {
        throw new Error(
            "HF_TOKEN (or HUGGINGFACE_HUB_TOKEN) is required for Hugging Face image generation",
        );
    }
    const model = getHfImageModel();
    const base = getHfInferenceBaseUrl();
    const url = `${base}/${encodeURIComponent(model)}`;

    const res = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
    });

    const contentType = res.headers.get("content-type") || "";

    if (!res.ok) {
        const errBody = await res.text();
        throw new Error(
            `Hugging Face HTTP ${res.status}: ${errBody.slice(0, 600)}`,
        );
    }

    if (contentType.includes("application/json")) {
        const j = /** @type {Record<string, unknown>} */ (await res.json());
        if (j.error) {
            throw new Error(String(j.error));
        }
        throw new Error(
            "Hugging Face returned JSON instead of image bytes; check HF_IMAGE_MODEL supports text-to-image on Inference Providers.",
        );
    }

    const buf = Buffer.from(await res.arrayBuffer());
    const mime = contentType.split(";")[0].trim() || "image/png";
    return {
        mimeType: mime.startsWith("image/") ? mime : "image/png",
        data: buf.toString("base64"),
    };
}
