export type SellerCenterTab =
    | "dashboard"
    | "shop"
    | "inventory"
    | "orders"
    | "feedback"
    | "finances"
    | "settings";

export const SELLER_CENTER_TAB_VALUES: SellerCenterTab[] = [
    "dashboard",
    "shop",
    "inventory",
    "orders",
    "feedback",
    "finances",
    "settings",
];

const TAB_SET = new Set<string>(SELLER_CENTER_TAB_VALUES);

export function isSellerCenterTab(value: string): value is SellerCenterTab {
    return TAB_SET.has(value);
}

export function parseSellerCenterTab(
    param: string | null,
): SellerCenterTab {
    if (param && isSellerCenterTab(param)) return param;
    return "dashboard";
}

export const SELLER_CENTER_TABS: { value: SellerCenterTab; label: string }[] = [
    { value: "dashboard", label: "Dashboard" },
    { value: "shop", label: "My Shop" },
    { value: "inventory", label: "Inventory" },
    { value: "orders", label: "Customer Orders" },
    { value: "feedback", label: "Customer Feedback" },
    { value: "finances", label: "Finances" },
    { value: "settings", label: "Settings" },
];
