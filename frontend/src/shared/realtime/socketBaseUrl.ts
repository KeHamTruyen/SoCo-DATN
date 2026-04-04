/** Socket.IO connects to the API origin without the `/api` suffix. */
export function getSocketBaseUrl(): string {
    const rawApiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
    if (!rawApiBase) return "http://localhost:5000";
    return rawApiBase.replace(/\/api\/?$/, "");
}
