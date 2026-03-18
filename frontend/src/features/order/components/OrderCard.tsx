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
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    shipping: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    refunded: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
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
            className="block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-primary" />
                    <div>
                        <span className="text-sm font-semibold">#{order.orderNumber}</span>
                        {order.sellerName && (
                            <span className="ml-2 text-sm text-slate-500">{order.sellerName}</span>
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
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
            </div>
            <div className="p-4">
                <div className="flex items-center gap-4">
                    {firstItem?.imageUrl && (
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
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
                            <p className="text-sm text-slate-500">+{extraCount} more item(s)</p>
                        )}
                        <p className="mt-1 text-xs text-slate-400">
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                    <div className="shrink-0 text-right">
                        <p className="text-lg font-bold text-primary">${order.total.toFixed(2)}</p>
                        <p className="text-xs text-slate-500">{order.items.length} item(s)</p>
                    </div>
                </div>
            </div>
        </Link>
    );
}
