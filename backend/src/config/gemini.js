import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI = null;

export function getGeminiClient() {
    if (!genAI) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error(
                "GEMINI_API_KEY is not set in environment variables",
            );
        }
        genAI = new GoogleGenerativeAI(apiKey);
    }
    return genAI;
}

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

/** @param {string} [modelName] */
export function getGeminiModel(modelName = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL) {
    const client = getGeminiClient();
    return client.getGenerativeModel({
        model: modelName,
        generationConfig: {
            temperature: parseFloat(process.env.GEMINI_TEMPERATURE || "0.8"),
            topP: 0.95,
            topK: 40,
            maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS || "4096", 10),
        },
    });
}
