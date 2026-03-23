export function formatDateTime(iso?: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString();
}
