import {
    CheckCircle2,
    Download,
    MapPin,
    MessageCircle,
    Package,
    ShoppingBag,
    Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { orderApi } from "../features/order/api/orderApi";
import type { Order, OrderStatus } from "../features/order/types/order.types";
import { cn } from "../shared/lib/cn";
import { Button, UnifiedHeader } from "../shared/ui";

const STATUS_STEPS: { key: OrderStatus; label: string; icon: React.ReactNode }[] = [
    { key: "pending", label: "Order Placed", icon: <ShoppingBag className="h-5 w-5" /> },
    { key: "confirmed", label: "Processing", icon: <Package className="h-5 w-5" /> },
    { key: "shipping", label: "In Transit", icon: <Truck className="h-5 w-5" /> },
    { key: "delivered", label: "Completed", icon: <CheckCircle2 className="h-5 w-5" /> },
];

const PAYMENT_LABEL: Record<string, string> = {
    cod: "Cash on Delivery",
    bank_transfer: "Bank Transfer",
    e_wallet: "E-Wallet",
};

export default function OrderDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        let mounted = true;
        void (async () => {
            setIsLoading(true);
            try {
                const data = await orderApi.getOrder(id);
                if (!mounted) return;
                setOrder(data);
            } catch {
                if (!mounted) return;
                setError("Unable to load order details.");
            } finally {
                if (mounted) setIsLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [id]);

    const currentStepIndex = order
        ? STATUS_STEPS.findIndex((s) => s.key === order.status)
        : -1;

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <UnifiedHeader
                navItems={[
                    { label: "Feed", to: "/feed" },
                    { label: "Marketplace", to: "/marketplace" },
                ]}
            />
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {isLoading ? (
                    <div className="space-y-6">
                        <div className="h-12 w-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                        <div className="h-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                    </div>
                ) : error || !order ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
                        {error ?? "Order not found."}
                    </div>
                ) : (
                    <>
                        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                            <div>
                                <nav className="mb-2 flex gap-2 text-sm text-slate-500 dark:text-slate-400">
                                    <Link to="/marketplace" className="hover:text-primary">
                                        Marketplace
                                    </Link>
                                    <span>/</span>
                                    <Link to="/orders" className="hover:text-primary">
                                        Orders
                                    </Link>
                                </nav>
                                <h1 className="text-3xl font-extrabold tracking-tight">
                                    Order #{order.orderNumber}
                                </h1>
                                <p className="mt-1 text-slate-500 dark:text-slate-400">
                                    Placed on{" "}
                                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" className="gap-2">
                                    <Download className="h-4 w-4" />
                                    Invoice
                                </Button>
                                <Button className="gap-2">
                                    <MessageCircle className="h-4 w-4" />
                                    Message Seller
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                            <div className="space-y-8 lg:col-span-2">
                                {order.status !== "cancelled" && order.status !== "refunded" ? (
                                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                        <h3 className="mb-8 text-lg font-bold">Order Status</h3>
                                        <div className="relative flex items-center justify-between">
                                            <div className="absolute left-0 top-1/2 -z-0 h-1 w-full -translate-y-1/2 bg-slate-100 dark:bg-slate-800">
                                                <div
                                                    className="h-full bg-primary transition-all"
                                                    style={{
                                                        width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                            {STATUS_STEPS.map((step, idx) => {
                                                const done = idx <= currentStepIndex;
                                                const active = idx === currentStepIndex;
                                                return (
                                                    <div
                                                        key={step.key}
                                                        className="relative z-10 flex flex-col items-center gap-2"
                                                    >
                                                        <div
                                                            className={cn(
                                                                "flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-900",
                                                                done
                                                                    ? active
                                                                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                                                                        : "bg-primary text-white"
                                                                    : "bg-slate-100 text-slate-400 dark:bg-slate-800",
                                                            )}
                                                        >
                                                            {step.icon}
                                                        </div>
                                                        <span
                                                            className={cn(
                                                                "text-xs font-medium",
                                                                active
                                                                    ? "font-bold text-primary"
                                                                    : done
                                                                        ? "font-bold text-slate-900 dark:text-white"
                                                                        : "text-slate-400",
                                                            )}
                                                        >
                                                            {step.label}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>
                                ) : (
                                    <section className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm dark:border-red-900/40 dark:bg-red-900/20">
                                        <p className="text-center text-sm font-medium text-red-600 dark:text-red-400">
                                            This order has been {order.status}.
                                        </p>
                                    </section>
                                )}

                                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                    <div className="border-b border-slate-100 p-6 dark:border-slate-800">
                                        <h3 className="text-lg font-bold">
                                            Items in Order ({order.items.length})
                                        </h3>
                                    </div>
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex flex-col gap-6 p-6 sm:flex-row">
                                                <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 sm:w-24">
                                                    {item.imageUrl ? (
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.productName}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : null}
                                                </div>
                                                <div className="flex flex-1 flex-col justify-between">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h4 className="text-lg font-bold">{item.productName}</h4>
                                                            {item.variantText && (
                                                                <p className="mt-1 text-sm text-slate-500">
                                                                    {item.variantText}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <p className="font-bold">
                                                            ${item.price.toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <div className="mt-4 flex items-center justify-between">
                                                        <span className="text-sm text-slate-500">
                                                            Qty: {item.quantity}
                                                        </span>
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                className="text-sm font-semibold text-primary hover:underline"
                                                            >
                                                                Buy Again
                                                            </button>
                                                            {order.status === "delivered" && (
                                                                <>
                                                                    <span className="text-slate-300">|</span>
                                                                    <button
                                                                        type="button"
                                                                        className="text-sm font-semibold text-primary hover:underline"
                                                                    >
                                                                        Leave Review
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {order.timeline && order.timeline.length > 0 && (
                                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                        <h3 className="mb-6 text-lg font-bold">Tracking Timeline</h3>
                                        <div className="space-y-6">
                                            {order.timeline.map((entry, idx) => (
                                                <div key={idx} className="flex gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <div className="mt-1.5 h-3 w-3 rounded-full bg-primary" />
                                                        {idx < order.timeline!.length - 1 && (
                                                            <div className="mt-1 w-0.5 flex-1 bg-slate-200 dark:bg-slate-700" />
                                                        )}
                                                    </div>
                                                    <div className="pb-6">
                                                        <p className="font-semibold capitalize">
                                                            {entry.status.replace(/_/g, " ")}
                                                        </p>
                                                        {entry.note && (
                                                            <p className="text-sm text-slate-500">{entry.note}</p>
                                                        )}
                                                        <p className="mt-1 text-xs text-slate-400">
                                                            {new Date(entry.timestamp).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                    <h3 className="mb-4 text-lg font-bold">Order Summary</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Subtotal</span>
                                            <span>${order.subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Shipping</span>
                                            {order.shipping === 0 ? (
                                                <span className="text-green-600">Free</span>
                                            ) : (
                                                <span>${order.shipping.toFixed(2)}</span>
                                            )}
                                        </div>
                                        {order.discount > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Discount</span>
                                                <span className="text-green-600">-${order.discount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
                                            <div className="flex justify-between font-bold">
                                                <span>Total</span>
                                                <span className="text-xl text-primary">
                                                    ${order.total.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        Shipping Address
                                    </h3>
                                    <p className="font-semibold">{order.shippingAddress.fullName}</p>
                                    <p className="mt-1 text-sm text-slate-500">{order.shippingAddress.phone}</p>
                                    <p className="mt-1 text-sm text-slate-500">{order.shippingAddress.address}</p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                    <h3 className="mb-4 text-lg font-bold">Payment</h3>
                                    <p className="text-sm font-medium">
                                        {PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}
                                    </p>
                                </div>

                                {order.status === "pending" && (
                                    <Button
                                        variant="destructive"
                                        className="w-full"
                                        onClick={() => {
                                            void orderApi.cancelOrder(order.id).then(() => {
                                                navigate("/orders");
                                            });
                                        }}
                                    >
                                        Cancel Order
                                    </Button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
