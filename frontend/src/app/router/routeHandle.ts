export type HeaderNavItem = {
    label: string;
    to: string;
};

export type AppHeaderConfig = {
    activePath?: string;
    navItems?: HeaderNavItem[];
    searchValue?: string;
    onSearch?: (value: string) => void;
    onSearchSubmit?: (value: string) => void;
    onSearchFocus?: () => void;
};

export type AppRouteHandle = {
    header?: AppHeaderConfig;
};

export const DEFAULT_HEADER_NAV_ITEMS: HeaderNavItem[] = [
    { label: "Feed", to: "/feed" },
    { label: "Marketplace", to: "/marketplace" },
];

export const FEED_ACTIVE_HEADER: AppRouteHandle = {
    header: { activePath: "/feed", navItems: DEFAULT_HEADER_NAV_ITEMS },
};

export const MARKETPLACE_ACTIVE_HEADER: AppRouteHandle = {
    header: { activePath: "/marketplace", navItems: DEFAULT_HEADER_NAV_ITEMS },
};

const MARKETPLACE_HEADER_PREFIXES = [
    "/marketplace",
    "/products",
    "/search",
    "/cart",
    "/checkout",
    "/orders",
] as const;

const FEED_HEADER_PREFIXES = [
    "/feed",
    "/post",
    "/posts",
    "/profile",
    "/groups",
    "/messages",
    "/notifications",
    "/scheduled-posts",
    "/seller/dashboard",
    "/settings",
    "/saved-items",
    "/ai-creative-lab",
] as const;

function matchesPrefix(pathname: string, prefix: string) {
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** Resolves static header config from URL (works with BrowserRouter; no useMatches). */
export function resolveHeaderConfigForPath(
    pathname: string,
): AppHeaderConfig | undefined {
    if (MARKETPLACE_HEADER_PREFIXES.some((p) => matchesPrefix(pathname, p))) {
        return MARKETPLACE_ACTIVE_HEADER.header;
    }
    if (FEED_HEADER_PREFIXES.some((p) => matchesPrefix(pathname, p))) {
        return FEED_ACTIVE_HEADER.header;
    }
    return undefined;
}
