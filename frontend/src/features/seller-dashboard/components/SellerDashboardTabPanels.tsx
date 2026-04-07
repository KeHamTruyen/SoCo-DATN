import type { Order } from "../../order/types/order.types";
import type { SellerStats } from "../../profile/types/profile.types";
import type {
    SellerProductRow,
    SellerShopStatusFilter,
} from "../types/sellerDashboard.types";
import type { SellerCenterTab } from "../sellerDashboardTabs";
import { SellerDashboardDashboardTab } from "./SellerDashboardDashboardTab";
import { SellerDashboardFeedbackTab } from "./SellerDashboardFeedbackTab";
import { SellerDashboardFinancesTab } from "./SellerDashboardFinancesTab";
import { SellerDashboardInventoryTab } from "./SellerDashboardInventoryTab";
import { SellerDashboardOrdersTab } from "./SellerDashboardOrdersTab";
import { SellerDashboardSettingsTab } from "./SellerDashboardSettingsTab";
import { SellerDashboardShopTab } from "./SellerDashboardShopTab";

interface SellerDashboardTabPanelsProps {
    tab: SellerCenterTab;
    stats: SellerStats;
    products: SellerProductRow[];
    productsLoading: boolean;
    orders: Order[];
    ordersLoading: boolean;
    shopStatusFilter: SellerShopStatusFilter;
    onShopStatusFilterChange: (next: SellerShopStatusFilter) => void;
    onProductsUpdated: () => void;
    onOrdersUpdated: () => void;
}

export function SellerDashboardTabPanels({
    tab,
    stats,
    products,
    productsLoading,
    orders,
    ordersLoading,
    shopStatusFilter,
    onShopStatusFilterChange,
    onProductsUpdated,
    onOrdersUpdated,
}: SellerDashboardTabPanelsProps) {
    switch (tab) {
        case "dashboard":
            return <SellerDashboardDashboardTab stats={stats} />;
        case "shop":
            return (
                <SellerDashboardShopTab
                    items={products}
                    loading={productsLoading}
                    statusFilter={shopStatusFilter}
                    onStatusFilterChange={onShopStatusFilterChange}
                    onProductsUpdated={onProductsUpdated}
                />
            );
        case "inventory":
            return (
                <SellerDashboardInventoryTab
                    items={products}
                    loading={productsLoading}
                    onProductsUpdated={onProductsUpdated}
                />
            );
        case "orders":
            return (
                <SellerDashboardOrdersTab
                    orders={orders}
                    loading={ordersLoading}
                    onOrderChanged={onOrdersUpdated}
                />
            );
        case "feedback":
            return <SellerDashboardFeedbackTab />;
        case "finances":
            return <SellerDashboardFinancesTab stats={stats} />;
        case "settings":
            return <SellerDashboardSettingsTab />;
        default:
            return <SellerDashboardDashboardTab stats={stats} />;
    }
}
