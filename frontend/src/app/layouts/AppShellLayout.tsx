import { useMemo } from "react";
import { Outlet, useMatches } from "react-router-dom";
import { Footer, UnifiedHeader } from "../../shared/ui";
import {
    AppHeaderProvider,
    useAppHeaderDynamicConfig,
} from "./AppHeaderContext";
import {
    DEFAULT_HEADER_NAV_ITEMS,
    type AppRouteHandle,
} from "../router/routeHandle";

const shellClassName =
    "flex min-h-screen flex-col bg-background text-foreground";

function resolveStaticHeaderConfig(matches: ReturnType<typeof useMatches>) {
    const handle = [...matches]
        .reverse()
        .find((m) => (m.handle as AppRouteHandle | undefined)?.header)
        ?.handle as AppRouteHandle | undefined;

    return handle?.header;
}

function AppShellChrome({ showFooter }: { showFooter: boolean }) {
    const matches = useMatches();
    const dynamicConfig = useAppHeaderDynamicConfig();

    const staticConfig = useMemo(
        () => resolveStaticHeaderConfig(matches),
        [matches],
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
