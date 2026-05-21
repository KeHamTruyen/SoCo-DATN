import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import type { AppHeaderConfig } from "../router/routeHandle";

type DynamicHeaderConfig = Omit<
    AppHeaderConfig,
    "activePath" | "navItems"
>;

type AppHeaderContextValue = {
    dynamicConfig: DynamicHeaderConfig;
    setDynamicConfig: (config: DynamicHeaderConfig) => void;
};

const AppHeaderContext = createContext<AppHeaderContextValue | null>(null);

export function AppHeaderProvider({ children }: { children: ReactNode }) {
    const [dynamicConfig, setDynamicConfigState] = useState<DynamicHeaderConfig>(
        {},
    );

    const setDynamicConfig = useCallback((config: DynamicHeaderConfig) => {
        setDynamicConfigState(config);
    }, []);

    const value = useMemo(
        () => ({ dynamicConfig, setDynamicConfig }),
        [dynamicConfig, setDynamicConfig],
    );

    return (
        <AppHeaderContext.Provider value={value}>
            {children}
        </AppHeaderContext.Provider>
    );
}

export function useAppHeaderDynamicConfig() {
    const ctx = useContext(AppHeaderContext);
    if (!ctx) {
        throw new Error("useAppHeaderDynamicConfig must be used within AppHeaderProvider");
    }
    return ctx.dynamicConfig;
}

/** Pages with search-in-header bind props here; cleared on unmount. */
export function useConfigureAppHeader(config: DynamicHeaderConfig) {
    const ctx = useContext(AppHeaderContext);
    if (!ctx) {
        throw new Error("useConfigureAppHeader must be used within AppHeaderProvider");
    }

    const { setDynamicConfig } = ctx;

    useEffect(() => {
        setDynamicConfig(config);
        return () => setDynamicConfig({});
    }, [
        setDynamicConfig,
        config.searchValue,
        config.onSearch,
        config.onSearchSubmit,
        config.onSearchFocus,
    ]);
}
