import {
    ArrowRight,
    CreditCard,
    Landmark,
    ShieldCheck,
    Wallet,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../shared/ui/atoms/button";
import type { Cart } from "../types/cart.types";
import { formatCurrencyVnd } from "../../../shared/lib/formatCurrencyVnd";

interface CartSummaryProps {
    cart: Cart;
    selectedCount: number;
    selectedSubtotal: number;
    onCheckout: () => void;
}

export function CartSummary({
    cart,
    selectedCount,
    selectedSubtotal,
    onCheckout,
}: CartSummaryProps) {
    const { t } = useTranslation();
    const [coupon, setCoupon] = useState("");

    const proportionalDiscount =
        cart.subtotal > 0 ? cart.discount * (selectedSubtotal / cart.subtotal) : 0;
    const displayTotal =
        selectedCount === 0
            ? 0
            : Math.max(0, selectedSubtotal - proportionalDiscount + cart.shipping);

    return (
        <div className="sticky top-24 space-y-4">
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-md dark:border-neutral-800 dark:bg-neutral-900">
                <h2 className="mb-6 text-xl font-bold">
                    {t("cart.summary.orderSummary")}
                </h2>

                <div className="mb-6 space-y-4 text-sm">
                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                        <span>
                            {t("cart.summary.itemsSelected", { count: selectedCount })}
                        </span>
                        <span>{formatCurrencyVnd(selectedSubtotal)}</span>
                    </div>

                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                        <span>{t("cart.summary.subtotal")}</span>
                        <span>{formatCurrencyVnd(selectedSubtotal)}</span>
                    </div>

                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                        <span>{t("cart.summary.shippingEst")}</span>
                        {selectedCount === 0 || cart.shipping === 0 ? (
                            <span className="font-medium text-success">
                                {t("cart.summary.free")}
                            </span>
                        ) : (
                            <span>{formatCurrencyVnd(cart.shipping)}</span>
                        )}
                    </div>

                    {proportionalDiscount > 0 && (
                        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                            <span>{t("cart.summary.discount")}</span>
                            <span className="font-medium text-destructive">
                                -{formatCurrencyVnd(proportionalDiscount)}
                            </span>
                        </div>
                    )}
                </div>

                <div className="mb-8">
                    <label className="mb-2 block text-sm font-medium">
                        {t("cart.summary.promoQuestion")}
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={coupon}
                            onChange={(e) => setCoupon(e.target.value)}
                            placeholder={t("cart.summary.enterCode")}
                            className="flex-1 rounded-lg border border-neutral-200 bg-transparent px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-800 dark:bg-neutral-800"
                        />
                        <button
                            type="button"
                            className="rounded-lg bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/20"
                        >
                            {t("cart.summary.apply")}
                        </button>
                    </div>
                </div>

                <div className="mb-8 border-t border-neutral-100 pt-6 dark:border-neutral-800">
                    <div className="flex items-end justify-between">
                        <span className="text-lg font-bold">
                            {t("cart.summary.total")}
                        </span>
                        <div className="text-right">
                            <span className="text-3xl font-bold text-primary">
                                {formatCurrencyVnd(displayTotal)}
                            </span>
                            <p className="mt-1 text-[10px] uppercase tracking-widest text-neutral-400">
                                {t("cart.summary.includingVat")}
                            </p>
                        </div>
                    </div>
                </div>

                <Button
                    className="h-auto w-full gap-2 rounded-xl py-4 text-base font-bold shadow-lg shadow-primary/20"
                    disabled={selectedCount === 0}
                    onClick={onCheckout}
                >
                    {t("cart.summary.proceedToCheckout")}
                    <ArrowRight className="h-5 w-5" />
                </Button>

                <div className="mt-6 flex items-center justify-center gap-4 text-neutral-300 dark:text-neutral-600">
                    <CreditCard className="h-8 w-8" aria-hidden />
                    <Wallet className="h-8 w-8" aria-hidden />
                    <Landmark className="h-8 w-8" aria-hidden />
                </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-neutral-100 p-4 dark:bg-neutral-800/50">
                <ShieldCheck className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                        {t("cart.summary.securePurchase")}
                    </p>
                    <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                        {t("cart.summary.secureDescription")}
                    </p>
                </div>
            </div>
        </div>
    );
}