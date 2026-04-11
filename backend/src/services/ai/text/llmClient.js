/**
 * Text LLM: primary Google Gemini + optional free-tier backup (OpenRouter or Groq).
 * Image generation lives under ../image/.
 */
import { getGeminiModel } from "../../../config/gemini.js";
import {
    getGeminiApiKey,
    getGroqApiKey,
    getGroqBackupTextModel,
    getGroqBackupVisionModel,
    getGroqBaseUrl,
    getOpenRouterApiKey,
    getOpenRouterAppTitle,
    getOpenRouterBackupTextModel,
    getOpenRouterBackupVisionModel,
    getOpenRouterBaseUrl,
    getOpenRouterHttpReferer,
    getTextBackupProviderMode,
} from "../../../config/ai/textEnv.js";

let cachedClient = null;

function parseEnvFloat(key, fallback) {
    const v = process.env[key];
    if (v == null || v === "") return fallback;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
}

function parseEnvInt(key, fallback) {
    const v = process.env[key];
    if (v == null || v === "") return fallback;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : fallback;
}

async function openAiCompatibleChat(baseURL, apiKey, model, messages, extraHeaders = {}) {
    const url = `${baseURL.replace(/\/$/, "")}/chat/completions`;
    const temperature = parseEnvFloat(
        "AI_TEMPERATURE",
        parseEnvFloat("GEMINI_TEMPERATURE", 0.8),
    );
    const max_tokens = parseEnvInt(
        "AI_MAX_TOKENS",
        parseEnvInt("GEMINI_MAX_TOKENS", 4096),
    );

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            ...extraHeaders,
        },
        body: JSON.stringify({
            model,
            messages,
            temperature,
            max_tokens,
        }),
    });

    const raw = await res.text();
    if (!res.ok) {
        throw new Error(`LLM HTTP ${res.status}: ${raw.slice(0, 800)}`);
    }
    let data;
    try {
        data = JSON.parse(raw);
    } catch {
        throw new Error(`LLM invalid JSON: ${raw.slice(0, 200)}`);
    }
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.length) {
        throw new Error("LLM returned empty content");
    }
    return content;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryDelaySeconds(err) {
    const msg = String(err?.message ?? err ?? "");
    const m = msg.match(/retry in ([\d.]+)\s*s/i);
    if (m) return Math.min(Math.ceil(parseFloat(m[1])), 120);
    return 5;
}

function isRetryableGeminiQuotaError(err) {
    const msg = String(err?.message ?? err ?? "");
    return (
        msg.includes("429") ||
        msg.includes("Too Many Requests") ||
        msg.includes("RESOURCE_EXHAUSTED") ||
        /quota exceeded/i.test(msg)
    );
}

async function withGemini429Retry(operation) {
    const max = parseEnvInt("GEMINI_429_MAX_ATTEMPTS", 4);
    let lastErr;
    for (let attempt = 0; attempt < max; attempt++) {
        try {
            return await operation();
        } catch (e) {
            lastErr = e;
            if (!isRetryableGeminiQuotaError(e) || attempt === max - 1) {
                throw e;
            }
            const sec = Math.min(parseRetryDelaySeconds(e) + 1, 120);
            await sleep(sec * 1000);
        }
    }
    throw lastErr;
}

function buildUserContent(text, images) {
    if (!images?.length) {
        return text;
    }
    const parts = [{ type: "text", text }];
    for (const im of images) {
        const mime = im.mimeType || "image/jpeg";
        parts.push({
            type: "image_url",
            image_url: { url: `data:${mime};base64,${im.base64}` },
        });
    }
    return parts;
}

function createGeminiLlm() {
    return {
        provider: "gemini",

        async generate({ text, images = [] }) {
            const model = getGeminiModel();
            const parts = [{ text }];
            for (const im of images) {
                parts.push({
                    inlineData: {
                        mimeType: im.mimeType || "image/jpeg",
                        data: im.base64,
                    },
                });
            }
            return await withGemini429Retry(async () => {
                const result = await model.generateContent(parts);
                return { text: result.response.text() };
            });
        },
    };
}

function createOpenAiCompatibleLlm({
    provider,
    baseURL,
    apiKey,
    textModel,
    visionModel,
    extraHeaders = {},
    missingKeyMessage,
}) {
    if (!apiKey) {
        throw new Error(missingKeyMessage);
    }
    const vision = visionModel || textModel;

    return {
        provider,

        async generate({ text, images = [] }) {
            const model = images.length ? vision : textModel;
            const messages = [
                {
                    role: "user",
                    content: buildUserContent(text, images),
                },
            ];
            const out = await openAiCompatibleChat(
                baseURL,
                apiKey,
                model,
                messages,
                extraHeaders,
            );
            return { text: out };
        },
    };
}

function createOpenRouterBackupLlm() {
    const apiKey = getOpenRouterApiKey();
    if (!apiKey) return null;
    const textModel = getOpenRouterBackupTextModel();
    const visionModel = getOpenRouterBackupVisionModel();
    return createOpenAiCompatibleLlm({
        provider: "openrouter",
        baseURL: getOpenRouterBaseUrl(),
        apiKey,
        textModel,
        visionModel,
        extraHeaders: {
            "HTTP-Referer": getOpenRouterHttpReferer(),
            "X-Title": getOpenRouterAppTitle(),
        },
        missingKeyMessage:
            "OPENROUTER_API_KEY is required for OpenRouter text backup.",
    });
}

function createGroqBackupLlm() {
    const apiKey = getGroqApiKey();
    if (!apiKey) return null;
    return createOpenAiCompatibleLlm({
        provider: "groq",
        baseURL: getGroqBaseUrl(),
        apiKey,
        textModel: getGroqBackupTextModel(),
        visionModel: getGroqBackupVisionModel(),
        missingKeyMessage: "GROQ_API_KEY is required for Groq text backup.",
    });
}

function createTextBackupLlm() {
    const mode = getTextBackupProviderMode();
    if (mode === "none") return null;
    if (mode === "openrouter") {
        return createOpenRouterBackupLlm();
    }
    if (mode === "groq") {
        return createGroqBackupLlm();
    }
    throw new Error(
        `Unknown AI_TEXT_BACKUP_PROVIDER "${mode}". Use none, openrouter, or groq.`,
    );
}

function createCompositeTextLlm() {
    const geminiKey = getGeminiApiKey();
    const geminiLlm = geminiKey ? createGeminiLlm() : null;
    const backup = createTextBackupLlm();

    if (!geminiLlm && !backup) {
        throw new Error(
            "Configure GEMINI_API_KEY for Gemini (primary text), and/or set AI_TEXT_BACKUP_PROVIDER with OPENROUTER_API_KEY or GROQ_API_KEY for a free-tier backup.",
        );
    }

    return {
        provider: "composite",

        async generate({ text, images = [] }) {
            if (geminiLlm) {
                try {
                    return await geminiLlm.generate({ text, images });
                } catch (e) {
                    if (!backup) throw e;
                }
            }
            if (!backup) {
                throw new Error(
                    "Gemini text generation failed and no backup LLM is configured.",
                );
            }
            return await backup.generate({ text, images });
        },
    };
}

export function getLlmClient() {
    if (cachedClient) return cachedClient;
    cachedClient = createCompositeTextLlm();
    return cachedClient;
}

/** For tests or hot reload. */
export function resetLlmClientCache() {
    cachedClient = null;
}
