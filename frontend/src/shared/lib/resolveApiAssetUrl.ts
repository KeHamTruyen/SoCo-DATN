/**
 * Absolute URL for product/upload assets. Relative paths like `/uploads/...` resolve
 * against the API server origin (VITE_API_BASE_URL without `/api`), not the SPA origin.
 */
export function resolveApiAssetUrl(raw: string | null | undefined): string | null {
    const s = raw?.trim();
    if (!s) return null;
    if (/^https?:\/\//i.test(s)) return s;
    const apiBase =
        (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ??
        "http://localhost:5000/api";
    const origin = apiBase.replace(/\/api\/?$/, "") || "http://localhost:5000";
    if (s.startsWith("/")) return `${origin}${s}`;
    return `${origin}/${s}`;
}
