import { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Footer, UnifiedHeader } from "../../shared/ui";
import {
    AppHeaderProvider,
    useAppHeaderDynamicConfig,
} from "./AppHeaderContext";
import {
    DEFAULT_HEADER_NAV_ITEMS,
    resolveHeaderConfigForPath,
} from "../router/routeHandle";

const shellClassName =
    "flex min-h-screen flex-col bg-background text-foreground";

function AppShellChrome({ showFooter }: { showFooter: boolean }) {
    const { pathname } = useLocation();
    const dynamicConfig = useAppHeaderDynamicConfig();

    const staticConfig = useMemo(
        () => resolveHeaderConfigForPath(pathname),
        [pathname],
    );

    const headerProps = useMemo(
        () => ({
            navItems: staticConfig?.navItems ?? DEFAULT_HEADER_NAV_ITEMS,
            activePath: staticConfig?.activePath,
            searchValue: dynamicConfig.searchValue ?? staticConfig?.searchValue,
            onSearch: dynamicConfig.onSearch ?? staticConfig?.onSearch,
            onSearchSubmit:
                dynamicConfig.onSearchSubmit ?? staticConfig?.onSearchSubmit,
            onSearchFocus:
                dynamicConfig.onSearchFocus ?? staticConfig?.onSearchFocus,
        }),
        [staticConfig, dynamicConfig],
    );

    return (
        <div className={shellClassName}>
            <UnifiedHeader {...headerProps} />
            <div className="flex min-h-0 flex-1 flex-col">
                <Outlet />
            </div>
            {showFooter ? <Footer /> : null}
        </div>
    );
}

function AppShellInner({ showFooter }: { showFooter: boolean }) {
    return (
        <AppHeaderProvider>
            <AppShellChrome showFooter={showFooter} />
        </AppHeaderProvider>
    );
}

/** Header + scrollable main only (feed, marketplace, infinite scroll). */
export function AppShellHeaderLayout() {
    return <AppShellInner showFooter={false} />;
}

/** Header, main content, and site footer. */
export function AppShellHeaderFooterLayout() {
    return <AppShellInner showFooter />;
}

/** @deprecated Use AppShellHeaderLayout */
export const AppShellHeaderOnlyLayout = AppShellHeaderLayout;

/** @deprecated Use AppShellHeaderFooterLayout */
export const AppShellWithFooterLayout = AppShellHeaderFooterLayout;
