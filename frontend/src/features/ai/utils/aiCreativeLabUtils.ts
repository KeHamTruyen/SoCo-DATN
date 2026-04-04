import { format, setHours, setMinutes, setSeconds } from "date-fns";

export type StudioMode = "text" | "image" | "video";

export const AI_LAB_TONES = ["Excited", "Professional", "Fun", "Friendly"] as const;
export const AI_LAB_LENGTHS = ["Short", "Medium", "Long"] as const;

export function aiLabToDatetimeLocalValue(date: Date | undefined, timeStr: string): string {
    if (!date) return "";
    const parts = timeStr.split(":");
    const h = parseInt(parts[0] ?? "", 10);
    const m = parseInt(parts[1] ?? "", 10);
    if (Number.isNaN(h) || Number.isNaN(m)) return "";
    const d = setSeconds(setMinutes(setHours(date, h), m), 0);
    return format(d, "yyyy-MM-dd'T'HH:mm");
}

export function buildPlainTextFromGenerated(
    generated: any,
    length: (typeof AI_LAB_LENGTHS)[number],
    withHashtags: boolean,
    withCta: boolean,
): string {
    const gt = generated?.generatedText;
    if (!gt) return "";
    const parts: string[] = [];
    if (gt.title && String(gt.title).trim()) parts.push(String(gt.title).trim());
    if (gt.body && String(gt.body).trim()) parts.push(String(gt.body).trim());
    if (withCta && gt.callToAction && String(gt.callToAction).trim()) {
        parts.push(String(gt.callToAction).trim());
    }
    const hashtagMax = length === "Short" ? 5 : length === "Medium" ? 8 : 10;
    if (withHashtags && Array.isArray(gt.hashtags) && gt.hashtags.length) {
        parts.push(gt.hashtags.slice(0, hashtagMax).join(" "));
    }
    return parts.join("\n\n").trim();
}

export function base64ToFile(base64: string, mimeType: string, filename: string): File {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new File([byteArray], filename, { type: mimeType });
}

export function lengthOptionLabel(l: (typeof AI_LAB_LENGTHS)[number]): string {
    if (l === "Short") return "Short (100-140 chữ)";
    if (l === "Medium") return "Medium (140-220 chữ)";
    return "Long (220-300 chữ)";
}
