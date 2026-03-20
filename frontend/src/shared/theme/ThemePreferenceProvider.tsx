import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "soco-theme-preference";

function systemIsDark(): boolean {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyThemeClass(pref: ThemePreference): void {
    const dark = pref === "dark" || (pref === "system" && systemIsDark());
    document.documentElement.classList.toggle("dark", dark);
}

function readStoredPreference(): ThemePreference {
    if (typeof window === "undefined") return "system";
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
    return "system";
}

type ThemeContextValue = {
    preference: ThemePreference;
    setPreference: (p: ThemePreference) => void;
};

const ThemePreferenceContext = createContext<ThemeContextValue | null>(null);

export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
    const [preference, setPreferenceState] = useState<ThemePreference>(readStoredPreference);

    const setPreference = useCallback((p: ThemePreference) => {
        setPreferenceState(p);
        localStorage.setItem(STORAGE_KEY, p);
    }, []);

    useEffect(() => {
        applyThemeClass(preference);
    }, [preference]);

    useEffect(() => {
        if (preference !== "system") return;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const onChange = () => applyThemeClass("system");
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, [preference]);

    return (
        <ThemePreferenceContext.Provider value={{ preference, setPreference }}>
            {children}
        </ThemePreferenceContext.Provider>
    );
}

export function useThemePreference(): ThemeContextValue {
    const ctx = useContext(ThemePreferenceContext);
    if (!ctx) {
        throw new Error("useThemePreference must be used within ThemePreferenceProvider");
    }
    return ctx;
}
