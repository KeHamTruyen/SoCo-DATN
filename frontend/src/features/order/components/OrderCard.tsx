import { ChevronRight, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../../shared/lib/cn";
import type { Order, OrderStatus } from "../types/order.types";

const STATUS_LABEL: Record<OrderStatus, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    shipping: "Shipping",
    delivered: "Delivered",
    cancelled: "Cancelled",
    refunded: "Refunded",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
    pending: "bg-warning/10 text-warning dark:bg-warning/20",
    confirmed: "bg-info/10 text-info dark:bg-info/20",
    shipping: "bg-primary-100 text-primary-700 dark:bg-primary-950/40 dark:text-primary-400",
    delivered: "bg-success/10 text-success dark:bg-success/20",
    cancelled: "bg-destructive/10 text-destructive dark:bg-destructive/20",
    refunded: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400",
};

interface OrderCardProps {
    order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
    const firstItem = order.items[0];
    const extraCount = order.items.length - 1;

    return (
        <Link
            to={`/orders/${order.id}`}
            className="block overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
            <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50">
                <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-primary" />
                    <div>
                        <span className="text-sm font-semibold">#{order.orderNumber}</span>
                        {order.sellerName && (
                            <span className="ml-2 text-sm text-neutral-500">{order.sellerName}</span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span
                        className={cn(
                            "rounded-full px-3 py-1 text-xs font-bold",
                            STATUS_COLOR[order.status],
                        )}
                    >
                        {STATUS_LABEL[order.status]}
                    </span>
                    <ChevronRight className="h-4 w-4 text-neutral-400" />
                </div>
            </div>
            <div className="p-4">
                <div className="flex items-center gap-4">
                    {firstItem?.imageUrl && (
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                            <img
                                src={firstItem.imageUrl}
                                alt={firstItem.productName}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{firstItem?.productName}</p>
                        {extraCount > 0 && (
                            <p className="text-sm text-neutral-500">+{extraCount} more item(s)</p>
                        )}
                        <p className="mt-1 text-xs text-neutral-400">
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                    <div className="shrink-0 text-right">
                        <p className="text-lg font-bold text-primary">${order.total.toFixed(2)}</p>
                        <p className="text-xs text-neutral-500">{order.items.length} item(s)</p>
                    </div>
                </div>
            </div>
        </Link>
    );
}
