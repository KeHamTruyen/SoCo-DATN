const STORAGE_KEY = "soco-search-history";
const MAX_ITEMS = 100;

function readRawHistory(): string[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed
            .map((item) => String(item ?? "").trim())
            .filter((item) => item.length > 0);
    } catch {
        return [];
    }
}

function writeRawHistory(items: string[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
    } catch {
        // ignore storage write errors
    }
}

export function getSearchHistory(): string[] {
    if (typeof window === "undefined") return [];
    return readRawHistory();
}

export function saveSearchTerm(term: string): string[] {
    if (typeof window === "undefined") return [];
    const normalized = String(term ?? "").trim();
    if (!normalized) return readRawHistory();
    const existing = readRawHistory().filter(
        (item) => item.toLowerCase() !== normalized.toLowerCase(),
    );
    const next = [normalized, ...existing].slice(0, MAX_ITEMS);
    writeRawHistory(next);
    return next;
}

export function clearSearchHistory() {
    if (typeof window === "undefined") return;
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // ignore storage remove errors
    }
}
