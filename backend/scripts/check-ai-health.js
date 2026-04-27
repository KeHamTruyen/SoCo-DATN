import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

function maskSecret(value) {
    if (!value) return "(missing)";
    if (value.length <= 8) return "****";
    return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

async function checkGemini() {
    const apiKey = process.env.GEMINI_API_KEY || "";
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    if (!apiKey) {
        return { provider: "gemini", ok: false, detail: "GEMINI_API_KEY missing" };
    }

    try {
        const client = new GoogleGenerativeAI(apiKey);
        const model = client.getGenerativeModel({
            model: modelName,
            generationConfig: { temperature: 0.1, maxOutputTokens: 16 },
        });
        const result = await model.generateContent([{ text: "Reply with OK only." }]);
        const text = result?.response?.text?.() || "";
        return {
            provider: "gemini",
            ok: true,
            detail: `model=${modelName}, response=${text.slice(0, 40) || "(empty)"}`,
        };
    } catch (error) {
        return {
            provider: "gemini",
            ok: false,
            detail: String(error?.message || error),
        };
    }
}

async function checkOpenRouter() {
    const apiKey = process.env.OPENROUTER_API_KEY || "";
    const model = process.env.OPENROUTER_BACKUP_MODEL || "meta-llama/llama-3.3-70b-instruct:free";
    const baseUrl = (process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1").replace(/\/$/, "");

    if (!apiKey) {
        return { provider: "openrouter", ok: false, detail: "OPENROUTER_API_KEY missing" };
    }

    try {
        const res = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
                "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER || "http://localhost:3000",
                "X-Title": process.env.OPENROUTER_APP_TITLE || "SoCo-DATN",
            },
            body: JSON.stringify({
                model,
                messages: [{ role: "user", content: "Reply with OK only." }],
                max_tokens: 8,
                temperature: 0,
            }),
        });

        const body = await res.text();
        if (!res.ok) {
            return {
                provider: "openrouter",
                ok: false,
                detail: `HTTP ${res.status}: ${body.slice(0, 200)}`,
            };
        }
        return {
            provider: "openrouter",
            ok: true,
            detail: `model=${model}, HTTP ${res.status}`,
        };
    } catch (error) {
        return {
            provider: "openrouter",
            ok: false,
            detail: String(error?.message || error),
        };
    }
}

async function checkGroq() {
    const apiKey = process.env.GROQ_API_KEY || "";
    const model = process.env.GROQ_BACKUP_MODEL || "llama-3.3-70b-versatile";
    const baseUrl = (process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1").replace(/\/$/, "");

    if (!apiKey) {
        return { provider: "groq", ok: false, detail: "GROQ_API_KEY missing" };
    }

    try {
        const res = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages: [{ role: "user", content: "Reply with OK only." }],
                max_tokens: 8,
                temperature: 0,
            }),
        });

        const body = await res.text();
        if (!res.ok) {
            return {
                provider: "groq",
                ok: false,
                detail: `HTTP ${res.status}: ${body.slice(0, 200)}`,
            };
        }
        return {
            provider: "groq",
            ok: true,
            detail: `model=${model}, HTTP ${res.status}`,
        };
    } catch (error) {
        return {
            provider: "groq",
            ok: false,
            detail: String(error?.message || error),
        };
    }
}

async function checkHuggingFace() {
    const token = process.env.HF_TOKEN || "";
    if (!token) {
        return { provider: "huggingface", ok: false, detail: "HF_TOKEN missing" };
    }

    try {
        const res = await fetch("https://huggingface.co/api/whoami-v2", {
            headers: { Authorization: `Bearer ${token}` },
        });
        const body = await res.text();
        if (!res.ok) {
            return {
                provider: "huggingface",
                ok: false,
                detail: `HTTP ${res.status}: ${body.slice(0, 200)}`,
            };
        }
        return {
            provider: "huggingface",
            ok: true,
            detail: `HTTP ${res.status}`,
        };
    } catch (error) {
        return {
            provider: "huggingface",
            ok: false,
            detail: String(error?.message || error),
        };
    }
}

async function checkReplicate() {
    const token = process.env.REPLICATE_API_TOKEN || "";
    if (!token) {
        return { provider: "replicate", ok: false, detail: "REPLICATE_API_TOKEN missing" };
    }

    try {
        const res = await fetch("https://api.replicate.com/v1/account", {
            headers: { Authorization: `Token ${token}` },
        });
        const body = await res.text();
        if (!res.ok) {
            return {
                provider: "replicate",
                ok: false,
                detail: `HTTP ${res.status}: ${body.slice(0, 200)}`,
            };
        }
        return {
            provider: "replicate",
            ok: true,
            detail: `HTTP ${res.status}`,
        };
    } catch (error) {
        return {
            provider: "replicate",
            ok: false,
            detail: String(error?.message || error),
        };
    }
}

async function main() {
    console.log("AI health check started\n");

    console.log("Config snapshot:");
    console.log(`- GEMINI_MODEL=${process.env.GEMINI_MODEL || "(default)"}`);
    console.log(`- GEMINI_API_KEY=${maskSecret(process.env.GEMINI_API_KEY || "")}`);
    console.log(`- AI_TEXT_BACKUP_PROVIDER=${process.env.AI_TEXT_BACKUP_PROVIDER || "openrouter"}`);
    console.log(`- OPENROUTER_API_KEY=${maskSecret(process.env.OPENROUTER_API_KEY || "")}`);
    console.log(`- GROQ_API_KEY=${maskSecret(process.env.GROQ_API_KEY || "")}`);
    console.log(`- HF_TOKEN=${maskSecret(process.env.HF_TOKEN || "")}`);
    console.log(`- REPLICATE_API_TOKEN=${maskSecret(process.env.REPLICATE_API_TOKEN || "")}`);
    console.log("");

    const results = await Promise.all([
        checkGemini(),
        checkOpenRouter(),
        checkGroq(),
        checkHuggingFace(),
        checkReplicate(),
    ]);

    console.log("Provider status:");
    for (const r of results) {
        const status = r.ok ? "OK" : "FAIL";
        console.log(`- [${status}] ${r.provider}: ${r.detail}`);
    }

    const failed = results.filter((r) => !r.ok).length;
    if (failed > 0) {
        process.exitCode = 1;
        console.log(`\nCompleted with ${failed} failing provider(s).`);
    } else {
        console.log("\nAll providers are healthy.");
    }
}

main().catch((error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
});
