import type { SellerProductRow } from "../types/sellerDashboard.types";
import { SellerDashboardInventoryPanel } from "./SellerDashboardInventoryPanel";

interface SellerDashboardInventoryTabProps {
    items: SellerProductRow[];
    loading: boolean;
    onProductsUpdated: () => void;
}

export function SellerDashboardInventoryTab({
    items,
    loading,
    onProductsUpdated,
}: SellerDashboardInventoryTabProps) {
    return (
        <SellerDashboardInventoryPanel
            items={items}
            loading={loading}
            onProductsUpdated={onProductsUpdated}
        />
    );
}
