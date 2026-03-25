import type { Order } from "../../order/types/order.types";
import { SellerDashboardOrdersPanel } from "./SellerDashboardOrdersPanel";

interface SellerDashboardOrdersTabProps {
    orders: Order[];
    loading: boolean;
}

export function SellerDashboardOrdersTab({
    orders,
    loading,
}: SellerDashboardOrdersTabProps) {
    return (
        <SellerDashboardOrdersPanel orders={orders} loading={loading} />
    );
}
