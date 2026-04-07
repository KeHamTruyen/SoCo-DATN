type LoginPortal = "admin" | "user";

export const LOGIN_PORTAL_KEY = "soco.loginPortal";

export function setStoredLoginPortal(portal: LoginPortal) {
    try {
        sessionStorage.setItem(LOGIN_PORTAL_KEY, portal);
    } catch {
        /* ignore */
    }
}

export function getStoredLoginPortal(): LoginPortal {
    try {
        const v = sessionStorage.getItem(LOGIN_PORTAL_KEY);
        if (v === "admin" || v === "user") return v;
    } catch {
        /* ignore */
    }
    return "user";
}

export function clearStoredLoginPortal() {
    try {
        sessionStorage.removeItem(LOGIN_PORTAL_KEY);
    } catch {
        /* ignore */
    }
}
