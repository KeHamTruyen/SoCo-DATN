import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cartApi } from "../features/cart/api/cartApi";
import { CartItem } from "../features/cart/components/CartItem";
import { CartSummary } from "../features/cart/components/CartSummary";
import type { Cart as CartType } from "../features/cart/types/cart.types";
import { Button, UnifiedHeader } from "../shared/ui";

export default function Cart() {
    const navigate = useNavigate();
    const [cart, setCart] = useState<CartType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        let mounted = true;
        void (async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await cartApi.getCart();
                if (!mounted) return;
                setCart(data);
                const allIds = data.groups.flatMap((g) => g.items.map((i) => i.id));
                setSelectedIds(new Set(allIds));
            } catch {
                if (!mounted) return;
                setError("Unable to load your cart.");
            } finally {
                if (mounted) setIsLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const handleSelect = (id: string, checked: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
        });
    };

    const handleSelectAll = (checked: boolean) => {
        if (!cart) return;
        if (checked) {
            const allIds = cart.groups.flatMap((g) => g.items.map((i) => i.id));
            setSelectedIds(new Set(allIds));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleQuantityChange = async (cartItemId: string, quantity: number) => {
        try {
            const updated = await cartApi.updateItem(cartItemId, quantity);
            setCart(updated);
        } catch {
            // silently ignore
        }
    };

    const handleRemove = async (cartItemId: string) => {
        try {
            const updated = await cartApi.removeItem(cartItemId);
            setCart(updated);
            setSelectedIds((prev) => {
                const next = new Set(prev);
                next.delete(cartItemId);
                return next;
            });
        } catch {
            // silently ignore
        }
    };

    const handleDeleteSelected = async () => {
        for (const id of selectedIds) {
            await cartApi.removeItem(id);
        }
        const updated = await cartApi.getCart();
        setCart(updated);
        setSelectedIds(new Set());
    };

    const allItems = cart?.groups.flatMap((g) => g.items) ?? [];
    const allSelected = allItems.length > 0 && allItems.every((i) => selectedIds.has(i.id));
    const selectedCount = selectedIds.size;

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <UnifiedHeader
                navItems={[
                    { label: "Feed", to: "/feed" },
                    { label: "Marketplace", to: "/marketplace" },
                ]}
                activePath="/marketplace"
            />
            <main className="mx-auto w-full max-w-[1440px] px-6 py-8">
                <div className="mb-8 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <button type="button" onClick={() => navigate("/marketplace")} className="hover:text-primary transition-colors">
                            Home
                        </button>
                        <span>/</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">Shopping Cart</span>
                    </div>
                    <h1 className="text-3xl font-bold">
                        Shopping Cart{" "}
                        <span className="text-lg font-normal text-slate-500">
                            ({cart?.itemCount ?? 0} items)
                        </span>
                    </h1>
                </div>

                {isLoading ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                        Loading your cart...
                    </div>
                ) : error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
                        {error}
                    </div>
                ) : !cart || cart.itemCount === 0 ? (
                    <div className="flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white py-16 text-center dark:border-slate-800 dark:bg-slate-900">
                        <ShoppingCart className="h-16 w-16 text-slate-300 dark:text-slate-600" />
                        <h2 className="text-xl font-bold">Your cart is empty</h2>
                        <p className="text-sm text-slate-500">
                            Looks like you haven't added anything yet.
                        </p>
                        <Button onClick={() => navigate("/marketplace")}>
                            Continue Shopping
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <label className="flex cursor-pointer items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-700"
                                    />
                                    <span className="font-medium">Select All Items</span>
                                </label>
                                {selectedCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => void handleDeleteSelected()}
                                        className="text-sm font-medium text-slate-500 transition-colors hover:text-red-500"
                                    >
                                        Delete Selected
                                    </button>
                                )}
                            </div>

                            {cart.groups.map((group) => (
                                <div
                                    key={group.sellerId}
                                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                                        <input
                                            type="checkbox"
                                            checked={group.items.every((i) => selectedIds.has(i.id))}
                                            onChange={(e) =>
                                                group.items.forEach((i) =>
                                                    handleSelect(i.id, e.target.checked),
                                                )
                                            }
                                            className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-700"
                                        />
                                        <span className="font-bold">{group.sellerName}</span>
                                        {group.isTopSeller && (
                                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                                                Top Seller
                                            </span>
                                        )}
                                    </div>
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {group.items.map((item) => (
                                            <CartItem
                                                key={item.id}
                                                item={item}
                                                selected={selectedIds.has(item.id)}
                                                onSelect={handleSelect}
                                                onQuantityChange={(id, qty) => void handleQuantityChange(id, qty)}
                                                onRemove={(id) => void handleRemove(id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <CartSummary
                            cart={cart}
                            selectedCount={selectedCount}
                            onCheckout={() => navigate("/checkout")}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
