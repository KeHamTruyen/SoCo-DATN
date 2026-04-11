/**
 * Image generation environment (Hugging Face + Replicate).
 */

export const DEFAULT_HF_INFERENCE_BASE =
    "https://router.huggingface.co/hf-inference/models";

export function getHfToken() {
    return process.env.HF_TOKEN || process.env.HUGGINGFACE_HUB_TOKEN || "";
}

export function getHfImageModel() {
    return process.env.HF_IMAGE_MODEL || "black-forest-labs/FLUX.1-schnell";
}

export function getHfInferenceBaseUrl() {
    return (
        process.env.HF_INFERENCE_BASE_URL || DEFAULT_HF_INFERENCE_BASE
    ).replace(/\/$/, "");
}

export function getReplicateApiToken() {
    return process.env.REPLICATE_API_TOKEN || "";
}

export function getReplicateImageModel() {
    return process.env.REPLICATE_IMAGE_MODEL || "black-forest-labs/flux-schnell";
}

export function getReplicateImageAspectRatio() {
    return process.env.REPLICATE_IMAGE_ASPECT_RATIO || "1:1";
}

export function hasHuggingfaceCredentials() {
    return !!getHfToken();
}

export function hasReplicateCredentials() {
    return !!getReplicateApiToken();
}
