const KEY = "soco_admin_access_token";
const USER_KEY = "soco_admin_user";

export function getAdminToken(): string | null {
    try {
        return localStorage.getItem(KEY);
    } catch {
        return null;
    }
}

export function setAdminToken(token: string | null) {
    try {
        if (token) localStorage.setItem(KEY, token);
        else localStorage.removeItem(KEY);
    } catch {
        /* ignore */
    }
}

export function getAdminUserJson(): string | null {
    try {
        return localStorage.getItem(USER_KEY);
    } catch {
        return null;
    }
}

export function setAdminUserJson(json: string | null) {
    try {
        if (json) localStorage.setItem(USER_KEY, json);
        else localStorage.removeItem(USER_KEY);
    } catch {
        /* ignore */
    }
}
