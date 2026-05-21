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
