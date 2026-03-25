import type {
    SellerProductRow,
    SellerShopStatusFilter,
} from "../types/sellerDashboard.types";
import { SellerDashboardShopPanel } from "./SellerDashboardShopPanel";

interface SellerDashboardShopTabProps {
    items: SellerProductRow[];
    loading: boolean;
    statusFilter: SellerShopStatusFilter;
    onStatusFilterChange: (next: SellerShopStatusFilter) => void;
    onProductsUpdated: () => void;
}

export function SellerDashboardShopTab({
    items,
    loading,
    statusFilter,
    onStatusFilterChange,
    onProductsUpdated,
}: SellerDashboardShopTabProps) {
    return (
        <SellerDashboardShopPanel
            items={items}
            loading={loading}
            statusFilter={statusFilter}
            onStatusFilterChange={onStatusFilterChange}
            onProductsUpdated={onProductsUpdated}
        />
    );
}
