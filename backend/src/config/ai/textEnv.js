/**
 * Text LLM environment (Gemini primary + OpenRouter/Groq backup).
 */

export function getGeminiApiKey() {
    return process.env.GEMINI_API_KEY || "";
}

export function getTextBackupProviderMode() {
    return (process.env.AI_TEXT_BACKUP_PROVIDER || "openrouter").toLowerCase();
}

export function getOpenRouterApiKey() {
    return process.env.OPENROUTER_API_KEY || "";
}

export function getOpenRouterBackupTextModel() {
    return (
        process.env.OPENROUTER_BACKUP_MODEL ||
        process.env.OPENROUTER_MODEL ||
        "meta-llama/llama-3.3-70b-instruct:free"
    );
}

export function getOpenRouterBackupVisionModel() {
    return (
        process.env.OPENROUTER_BACKUP_VISION_MODEL ||
        process.env.OPENROUTER_VISION_MODEL ||
        getOpenRouterBackupTextModel()
    );
}

export function getOpenRouterBaseUrl() {
    return process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
}

export function getOpenRouterHttpReferer() {
    return process.env.OPENROUTER_HTTP_REFERER || "http://localhost:3000";
}

export function getOpenRouterAppTitle() {
    return process.env.OPENROUTER_APP_TITLE || "SoCo-DATN";
}

export function getGroqApiKey() {
    return process.env.GROQ_API_KEY || "";
}

export function getGroqBackupTextModel() {
    return (
        process.env.GROQ_BACKUP_MODEL ||
        process.env.GROQ_MODEL ||
        "llama-3.3-70b-versatile"
    );
}

export function getGroqBackupVisionModel() {
    return (
        process.env.GROQ_BACKUP_VISION_MODEL ||
        process.env.GROQ_VISION_MODEL ||
        "llama-3.2-11b-vision-preview"
    );
}

export function getGroqBaseUrl() {
    return process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";
}
