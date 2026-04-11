/**
 * Replicate — text-to-image via models API + poll.
 * @see https://replicate.com/docs/reference/http
 */
import {
    getReplicateApiToken,
    getReplicateImageAspectRatio,
    getReplicateImageModel,
} from "../../../config/ai/imageEnv.js";

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

/**
 * @param {string} prompt
 * @returns {Promise<{ mimeType: string, data: string }>}
 */
export async function replicateTextToImage(prompt) {
    const token = getReplicateApiToken();
    if (!token) {
        throw new Error(
            "REPLICATE_API_TOKEN is required for Replicate image generation",
        );
    }

    const modelPath = getReplicateImageModel();
    const parts = modelPath.split("/").filter(Boolean);
    if (parts.length < 2) {
        throw new Error(
            'REPLICATE_IMAGE_MODEL must be "owner/model" (e.g. black-forest-labs/flux-schnell)',
        );
    }
    const name = parts.pop();
    const owner = parts.join("/");

    const createUrl = `https://api.replicate.com/v1/models/${owner}/${name}/predictions`;
    const aspectRatio = getReplicateImageAspectRatio();

    const createRes = await fetch(createUrl, {
        method: "POST",
        headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            input: {
                prompt,
                aspect_ratio: aspectRatio,
                output_format: "png",
            },
        }),
    });

    const rawCreate = await createRes.text();
    if (!createRes.ok) {
        throw new Error(
            `Replicate create HTTP ${createRes.status}: ${rawCreate.slice(0, 600)}`,
        );
    }

    let prediction = /** @type {{ status?: string, urls?: { get?: string }, error?: string, output?: string | string[] }} */ (
        JSON.parse(rawCreate)
    );

    const pollUrl = prediction.urls?.get;
    if (!pollUrl) {
        throw new Error("Replicate response missing prediction urls.get");
    }

    const maxPolls = 90;
    for (let i = 0; i < maxPolls; i++) {
        if (prediction.status === "succeeded") break;
        if (prediction.status === "failed" || prediction.status === "canceled") {
            throw new Error(
                prediction.error || `Replicate status: ${prediction.status}`,
            );
        }
        await sleep(1000);
        const pollRes = await fetch(pollUrl, {
            headers: { Authorization: `Token ${token}` },
        });
        const rawPoll = await pollRes.text();
        if (!pollRes.ok) {
            throw new Error(
                `Replicate poll HTTP ${pollRes.status}: ${rawPoll.slice(0, 400)}`,
            );
        }
        prediction = JSON.parse(rawPoll);
    }

    if (prediction.status !== "succeeded") {
        throw new Error(
            prediction.error || "Replicate prediction did not complete in time",
        );
    }

    const out = prediction.output;
    const imageUrl = Array.isArray(out) ? out[0] : out;
    if (typeof imageUrl !== "string" || !imageUrl.startsWith("http")) {
        throw new Error("Replicate output was not an image URL");
    }

    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
        throw new Error(`Failed to download Replicate output: ${imgRes.status}`);
    }
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const ct = imgRes.headers.get("content-type") || "image/png";
    return {
        mimeType: ct.split(";")[0].trim() || "image/png",
        data: buf.toString("base64"),
    };
}
