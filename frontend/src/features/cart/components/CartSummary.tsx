import { Tag } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../shared/ui/atoms/button";
import type { Cart } from "../types/cart.types";

interface CartSummaryProps {
    cart: Cart;
    selectedCount: number;
    onCheckout: () => void;
}

export function CartSummary({ cart, selectedCount, onCheckout }: CartSummaryProps) {
    const [coupon, setCoupon] = useState("");

    return (
        <div className="sticky top-24 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="mb-4 text-lg font-bold">Order Summary</h2>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-500">
                            Subtotal ({cart.itemCount} items)
                        </span>
                        <span className="font-medium">${cart.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Shipping</span>
                        {cart.shipping === 0 ? (
                            <span className="font-medium text-green-600">Free</span>
                        ) : (
                            <span className="font-medium">${cart.shipping.toFixed(2)}</span>
                        )}
                    </div>
                    {cart.discount > 0 && (
                        <div className="flex justify-between">
                            <span className="text-slate-500">Discount</span>
                            <span className="font-medium text-green-600">
                                -${cart.discount.toFixed(2)}
                            </span>
                        </div>
                    )}
                    <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
                        <div className="flex justify-between">
                            <span className="font-bold">Total</span>
                            <span className="text-xl font-bold text-primary">
                                ${cart.total.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                <Button
                    className="mt-6 w-full"
                    disabled={selectedCount === 0}
                    onClick={onCheckout}
                >
                    Checkout ({selectedCount} items)
                </Button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Tag className="h-4 w-4 text-primary" />
                    Coupon Code
                </h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        placeholder="Enter code"
                        className="flex-1 rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700"
                    />
                    <Button variant="outline" size="sm">
                        Apply
                    </Button>
                </div>
            </div>
        </div>
    );
}
