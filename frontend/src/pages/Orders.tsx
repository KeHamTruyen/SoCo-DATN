import { useEffect, useState } from "react";
import { orderApi } from "../features/order/api/orderApi";
import { OrderCard } from "../features/order/components/OrderCard";
import type { Order, OrderStatus } from "../features/order/types/order.types";
import { cn } from "../shared/lib/cn";
import { UnifiedHeader } from "../shared/ui";

type TabStatus = "all" | OrderStatus;

const TABS: { value: TabStatus; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "shipping", label: "Shipping" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
];

export default function Orders() {
    const [activeTab, setActiveTab] = useState<TabStatus>("all");
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        void (async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await orderApi.listOrders({
                    status: activeTab,
                    pageSize: 20,
                });
                if (!mounted) return;
                setOrders(data.items);
            } catch {
                if (!mounted) return;
                setError("Unable to load your orders.");
            } finally {
                if (mounted) setIsLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [activeTab]);

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <UnifiedHeader
                navItems={[
                    { label: "Feed", to: "/feed" },
                    { label: "Marketplace", to: "/marketplace" },
                ]}
            />
            <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold tracking-tight">My Orders</h1>
                    <p className="mt-2 text-neutral-500 dark:text-neutral-400">
                        Manage and track your recent purchases
                    </p>
                </div>

                <div className="mb-8 border-b border-neutral-200 dark:border-neutral-800">
                    <nav className="no-scrollbar flex space-x-8 overflow-x-auto" aria-label="Order Status">
                        {TABS.map((tab) => (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() => setActiveTab(tab.value)}
                                className={cn(
                                    "whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors",
                                    activeTab === tab.value
                                        ? "border-primary font-bold text-primary"
                                        : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300",
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-28 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
                            />
                        ))}
                    </div>
                ) : error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
                        {error}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
                        <p className="text-neutral-500">No orders found.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
