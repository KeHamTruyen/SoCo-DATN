import { CreditCard, Smartphone, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cartApi } from "../features/cart/api/cartApi";
import { orderApi } from "../features/order/api/orderApi";
import type { CartItem } from "../features/cart/types/cart.types";
import { Button, UnifiedHeader } from "../shared/ui";

const PAYMENT_METHODS = [
    {
        value: "COD" as const,
        label: "Cash on Delivery (COD)",
        desc: "Pay when you receive the package",
        icon: Truck,
    },
    {
        value: "BANK_TRANSFER" as const,
        label: "Bank Transfer",
        desc: "Transfer directly to our bank account",
        icon: CreditCard,
    },
    {
        value: "MOMO" as const,
        label: "E-Wallet",
        desc: "MoMo, ZaloPay, VNPay",
        icon: Smartphone,
    },
];

export default function Checkout() {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedCartItemIds = useMemo<string[]>(
        () => ((location.state as { selectedCartItemIds?: string[] } | null)?.selectedCartItemIds ?? []),
        [location.state],
    );
    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        address: "",
    });
    const [paymentMethod, setPaymentMethod] = useState<"COD" | "BANK_TRANSFER" | "MOMO">("COD");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingCart, setIsLoadingCart] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);

    useEffect(() => {
        let mounted = true;
        void (async () => {
            if (selectedCartItemIds.length === 0) {
                if (mounted) {
                    setError("No selected cart items. Please return to cart.");
                    setIsLoadingCart(false);
                }
                return;
            }
            try {
                const cart = await cartApi.getCart();
                if (!mounted) return;
                const items = (cart.items ?? []).filter((item) => selectedCartItemIds.includes(item.id));
                setSelectedItems(items);
                if (items.length === 0) {
                    setError("Selected items are no longer in your cart.");
                }
            } catch {
                if (!mounted) return;
                setError("Unable to load selected cart items.");
            } finally {
                if (mounted) setIsLoadingCart(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [selectedCartItemIds]);

    const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = selectedItems.length > 0 ? 30000 : 0;
    const total = subtotal + shipping;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.fullName || !form.phone || !form.address) {
            setError("Please fill in all required fields.");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            const order = await orderApi.createOrder({
                cartItemIds: selectedItems.map((item) => item.id),
                shippingName: form.fullName,
                shippingPhone: form.phone,
                shippingAddress: form.address,
                paymentMethod,
            });
            navigate(`/checkout/success?orderId=${order.id}`);
        } catch {
            setError("Failed to place order. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <UnifiedHeader
                navItems={[
                    { label: "Feed", to: "/feed" },
                    { label: "Marketplace", to: "/marketplace" },
                ]}
                activePath="/marketplace"
            />
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col gap-2">
                    <h1 className="text-3xl font-black tracking-tight">Checkout</h1>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        Complete your order details below
                    </p>
                </div>

                <form onSubmit={(e) => void handleSubmit(e)}>
                    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
                        <div className="space-y-6 lg:col-span-7">
                            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="flex items-center gap-3 border-b border-neutral-100 p-6 dark:border-neutral-800">
                                    <Truck className="h-5 w-5 text-primary" />
                                    <h2 className="text-xl font-bold">Shipping Information</h2>
                                </div>
                                <div className="space-y-4 p-6">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold">
                                                Full Name <span className="text-destructive">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={form.fullName}
                                                onChange={(e) =>
                                                    setForm((f) => ({ ...f, fullName: e.target.value }))
                                                }
                                                placeholder="John Doe"
                                                className="w-full rounded-lg border border-neutral-200 bg-transparent px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-700"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold">
                                                Phone Number <span className="text-destructive">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                value={form.phone}
                                                onChange={(e) =>
                                                    setForm((f) => ({ ...f, phone: e.target.value }))
                                                }
                                                placeholder="+84 000 000 000"
                                                className="w-full rounded-lg border border-neutral-200 bg-transparent px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-700"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">
                                            Detailed Address <span className="text-destructive">*</span>
                                        </label>
                                        <textarea
                                            value={form.address}
                                            onChange={(e) =>
                                                setForm((f) => ({ ...f, address: e.target.value }))
                                            }
                                            placeholder="Street address, Apartment, Suite, Floor, etc."
                                            rows={3}
                                            className="w-full rounded-lg border border-neutral-200 bg-transparent px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-700"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="flex items-center gap-3 border-b border-neutral-100 p-6 dark:border-neutral-800">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                    <h2 className="text-xl font-bold">Payment Method</h2>
                                </div>
                                <div className="space-y-3 p-6">
                                    {PAYMENT_METHODS.map(({ value, label, desc, icon: Icon }) => (
                                        <label
                                            key={value}
                                            className="relative flex cursor-pointer items-center justify-between rounded-xl border border-neutral-200 p-4 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    value={value}
                                                    checked={paymentMethod === value}
                                                    onChange={() => setPaymentMethod(value)}
                                                    className="h-4 w-4 border-neutral-300 text-primary focus:ring-primary"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="font-bold">{label}</span>
                                                    <span className="text-xs text-neutral-500">{desc}</span>
                                                </div>
                                            </div>
                                            <Icon className="h-5 w-5 text-neutral-400" />
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-5">
                            <div className="sticky top-24 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="border-b border-neutral-100 p-6 dark:border-neutral-800">
                                    <h2 className="text-xl font-bold">Order Summary</h2>
                                </div>
                                <div className="space-y-4 p-6">
                                    {isLoadingCart ? (
                                        <p className="text-sm text-neutral-500">Loading selected items...</p>
                                    ) : null}
                                    {!isLoadingCart && selectedItems.length > 0 ? (
                                        <div className="space-y-2 rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-700">
                                            {selectedItems.map((item) => (
                                                <div key={item.id} className="flex justify-between gap-3">
                                                    <span className="line-clamp-1">{item.productName} x{item.quantity}</span>
                                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-500">Subtotal</span>
                                        <span className="font-medium">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-500">Shipping</span>
                                        <span className="font-medium">{shipping > 0 ? `$${shipping.toFixed(2)}` : "Free"}</span>
                                    </div>
                                    <div className="border-t border-neutral-100 pt-4 dark:border-neutral-800">
                                        <div className="flex justify-between">
                                            <span className="font-bold">Total</span>
                                            <span className="text-xl font-bold text-primary">${total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {error && (
                                        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                            {error}
                                        </p>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isSubmitting || isLoadingCart || selectedItems.length === 0}
                                    >
                                        {isSubmitting ? "Placing Order..." : "Place Order"}
                                    </Button>
                                    <button
                                        type="button"
                                        onClick={() => navigate("/cart")}
                                        className="w-full text-center text-sm text-neutral-500 underline hover:text-primary"
                                    >
                                        Back to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}
