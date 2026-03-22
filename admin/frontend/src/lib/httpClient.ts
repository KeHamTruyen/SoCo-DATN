import { getAdminToken, setAdminToken } from "./tokenStorage";

const base =
    (import.meta.env.VITE_ADMIN_API_BASE_URL as string | undefined)?.replace(
        /\/$/,
        "",
    ) ?? "http://localhost:5001/api";

export class HttpError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.name = "HttpError";
        this.status = status;
    }
}

type Opts = {
    method?: string;
    body?: unknown;
    auth?: boolean;
    signal?: AbortSignal;
};

async function parseJson(text: string) {
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

export async function http<T>(
    path: string,
    opts: Opts = {},
): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (opts.auth !== false) {
        const t = getAdminToken();
        if (t) headers.Authorization = `Bearer ${t}`;
    }

    const res = await fetch(`${base}${path.startsWith("/") ? path : `/${path}`}`, {
        method: opts.method ?? "GET",
        headers,
        body:
            opts.body == null || opts.method === "GET"
                ? undefined
                : JSON.stringify(opts.body),
        credentials: "include",
        signal: opts.signal,
    });

    const text = await res.text();
    const data = await parseJson(text);

    if (res.status === 401 && opts.auth !== false) {
        setAdminToken(null);
    }

    if (!res.ok) {
        const msg =
            typeof data === "object" && data && "message" in data
                ? String((data as { message: string }).message)
                : res.statusText;
        throw new HttpError(msg, res.status);
    }

    return data as T;
}
