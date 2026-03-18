import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { authApi } from "../../features/auth/api/authApi";
import type { AuthResponse, UserProfile } from "../../features/auth/types/auth.types";
import {
    clearAuthStorage,
    getAccessToken,
    setAuthTokens,
} from "../../shared/auth/tokenStorage";

interface AuthContextValue {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    completeAuth: (payload: AuthResponse) => void;
    refreshProfile: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshProfile = useCallback(async () => {
        const token = getAccessToken();
        if (!token) {
            setUser(null);
            return;
        }
        try {
            const profile = await authApi.me();
            setUser(profile);
        } catch {
            clearAuthStorage();
            setUser(null);
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        const init = async () => {
            try {
                await refreshProfile();
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };
        void init();
        return () => {
            mounted = false;
        };
    }, [refreshProfile]);

    const completeAuth = useCallback((payload: AuthResponse) => {
        setAuthTokens(payload.accessToken, payload.refreshToken);
        setUser(payload.user);
    }, []);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch {
            // No-op: we still clear local session even if API fails.
        } finally {
            clearAuthStorage();
            setUser(null);
        }
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            isAuthenticated: Boolean(user && getAccessToken()),
            isLoading,
            completeAuth,
            refreshProfile,
            logout,
        }),
        [completeAuth, isLoading, logout, refreshProfile, user],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthSession() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuthSession must be used inside AuthProvider");
    }
    return ctx;
}

