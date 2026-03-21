import { Link } from "react-router-dom";
import type { Order } from "../../order/types/order.types";

interface SellerDashboardOrdersPanelProps {
    orders: Order[];
    loading: boolean;
}

const statusLabel: Record<string, string> = {
    pending: "Chờ xử lý",
    confirmed: "Đã xác nhận",
    processing: "Đang xử lý",
    shipping: "Đang giao",
    delivered: "Đã giao",
    completed: "Hoàn thành",
    cancelled: "Đã huỷ",
    refunded: "Hoàn tiền",
};

export function SellerDashboardOrdersPanel({ orders, loading }: SellerDashboardOrdersPanelProps) {
    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="h-24 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800"
                    />
                ))}
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-neutral-200 py-12 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                Chưa có đơn hàng từ khách.
            </div>
        );
    }

    return (
        <ul className="space-y-3">
            {orders.map((order) => (
                <li
                    key={order.id}
                    className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800 dark:bg-neutral-900/40"
                >
                    <div>
                        <p className="font-bold text-neutral-900 dark:text-neutral-100">
                            #{order.orderNumber}
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {order.items[0]?.productName ?? "Đơn hàng"}
                            {order.items.length > 1 ? ` +${order.items.length - 1}` : ""}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                            {statusLabel[order.status] ?? order.status}
                        </p>
                    </div>
                    <Link
                        to={`/orders/${order.id}`}
                        className="shrink-0 rounded-lg bg-primary px-4 py-2 text-center text-sm font-bold text-white hover:opacity-90"
                    >
                        Chi tiết
                    </Link>
                </li>
            ))}
        </ul>
    );
}
