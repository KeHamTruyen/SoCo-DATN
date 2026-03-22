import { getAccessToken, clearAuthStorage } from "../auth/tokenStorage";

export class HttpError extends Error {
    status: number;
    details: unknown;

    constructor(message: string, status: number, details?: unknown) {
        super(message);
        this.name = "HttpError";
        this.status = status;
        this.details = details;
    }
}

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
    method?: RequestMethod;
    body?: unknown;
    headers?: Record<string, string>;
    requiresAuth?: boolean;
    signal?: AbortSignal;
}

const API_BASE_URL =
    (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(
        /\/$/,
        "",
    ) ?? "http://localhost:5000/api";

async function parseJsonSafe(response: Response) {
    const text = await response.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const {
        method = "GET",
        body,
        headers = {},
        requiresAuth = false,
        signal,
    } = options;

    const composedHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...headers,
    };

    if (requiresAuth) {
        const token = getAccessToken();
        if (token) {
            composedHeaders.Authorization = `Bearer ${token}`;
        }
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: composedHeaders,
        body: body == null ? undefined : JSON.stringify(body),
        credentials: "include",
        signal,
    });

    const data = await parseJsonSafe(response);

    if (!response.ok) {
        // #region agent log
        if (path.startsWith("/seller")) {
            fetch("http://127.0.0.1:7303/ingest/6c92d646-cd5e-404a-952f-872ed8b81520", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ba053a" },
                body: JSON.stringify({
                    sessionId: "ba053a",
                    runId: "pre-fix",
                    hypothesisId: "H1_H4",
                    location: "httpClient.ts:request:error",
                    message: "seller-related request failed",
                    data: {
                        method,
                        path,
                        status: response.status,
                        hasAuthHeader: Boolean(composedHeaders.Authorization),
                    },
                    timestamp: Date.now(),
                }),
            }).catch(() => {});
        }
        // #endregion
        const message =
            (data as { message?: string } | null)?.message ??
            `Request failed with status ${response.status}`;
        if (
            response.status === 401 ||
            (response.status === 403 &&
                requiresAuth &&
                /administrator accounts use the admin application/i.test(
                    String(message),
                ))
        ) {
            clearAuthStorage();
        }
        throw new HttpError(message, response.status, data);
    }

    return data as T;
}

async function requestFormData<T>(
    path: string,
    formData: FormData,
    options: { requiresAuth?: boolean; signal?: AbortSignal } = {},
): Promise<T> {
    const { requiresAuth = false, signal } = options;
    const headers: Record<string, string> = {};
    if (requiresAuth) {
        const token = getAccessToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers,
        body: formData,
        credentials: "include",
        signal,
    });

    const data = await parseJsonSafe(response);

    if (!response.ok) {
        if (response.status === 401) {
            clearAuthStorage();
        }
        const message =
            (data as { message?: string } | null)?.message ??
            `Request failed with status ${response.status}`;
        throw new HttpError(message, response.status, data);
    }

    return data as T;
}

export const httpClient = {
    get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
        request<T>(path, { ...options, method: "GET" }),
    post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
        request<T>(path, { ...options, method: "POST", body }),
    put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
        request<T>(path, { ...options, method: "PUT", body }),
    patch: <T>(
        path: string,
        body?: unknown,
        options?: Omit<RequestOptions, "method" | "body">,
    ) => request<T>(path, { ...options, method: "PATCH", body }),
    delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
        request<T>(path, { ...options, method: "DELETE" }),
    postFormData: <T>(
        path: string,
        formData: FormData,
        options?: { requiresAuth?: boolean; signal?: AbortSignal },
    ) => requestFormData<T>(path, formData, options ?? {}),
};

