/**
 * Normalize image-generation briefs to English for diffusion APIs (HF/Replicate).
 */

/**
 * True only when the brief is plain ASCII (plus newlines/tabs). Any accented or
 * non-Latin text triggers LLM translation so Vietnamese/CJK user input is converted.
 *
 * @param {string} text
 */
export function isAsciiOnlyBrief(text) {
    if (!text || typeof text !== "string") return true;
    for (const ch of text) {
        const c = ch.codePointAt(0);
        if (c === undefined) continue;
        if (c === 0x0a || c === 0x0d || c === 0x09) continue;
        if (c >= 0x20 && c <= 0x7e) continue;
        return false;
    }
    return true;
}

/**
 * @param {{ generate: (args: { text: string, images: unknown[] }) => Promise<{ text: string }> }} llm
 * @param {string} brief
 */
export async function ensureEnglishImagePrompt(llm, brief) {
    const trimmed = String(brief || "").trim();
    if (!trimmed) return trimmed;
    if (isAsciiOnlyBrief(trimmed)) {
        return trimmed;
    }

    const instruction = `Translate the following image generation brief fully into English. Keep the same structure, bullet points, and constraints. Output ONLY the English brief, with no markdown fences and no preamble:\n\n${trimmed}`;

    const { text } = await llm.generate({
        text: instruction,
        images: [],
    });
    const out = String(text ?? "").trim();
    if (out.length >= 40) {
        return out;
    }
    return trimmed;
}
