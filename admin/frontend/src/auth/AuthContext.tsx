import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { adminLogin, type AdminUser } from "@/api/authApi";
import {
    getAdminToken,
    getAdminUserJson,
    setAdminToken,
    setAdminUserJson,
} from "@/lib/tokenStorage";

type AuthState = {
    user: AdminUser | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
};

const Ctx = createContext<AuthState | null>(null);

function readStoredUser(): AdminUser | null {
    const raw = getAdminUserJson();
    if (!raw || !getAdminToken()) return null;
    try {
        return JSON.parse(raw) as AdminUser;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AdminUser | null>(readStoredUser);
    const [token, setToken] = useState<string | null>(() => getAdminToken());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const { user: u, accessToken } = await adminLogin(email, password);
        setAdminToken(accessToken);
        setAdminUserJson(JSON.stringify(u));
        setToken(accessToken);
        setUser(u);
    }, []);

    const logout = useCallback(() => {
        setAdminToken(null);
        setAdminUserJson(null);
        setToken(null);
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({ user, token, loading, login, logout }),
        [user, token, loading, login, logout],
    );

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
    const v = useContext(Ctx);
    if (!v) throw new Error("useAuth outside AuthProvider");
    return v;
}
