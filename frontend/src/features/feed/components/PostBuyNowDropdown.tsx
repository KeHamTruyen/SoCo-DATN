import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "../../../shared/lib/cn";
import { formatCurrencyVnd } from "../../../shared/lib/formatCurrencyVnd";
import type { ShoppableProduct } from "../types/feed.types";

interface PostBuyNowDropdownProps {
    products: ShoppableProduct[];
    className?: string;
    menuAlign?: "left" | "right";
}

export function PostBuyNowDropdown({
    products,
    className,
    menuAlign = "right",
}: PostBuyNowDropdownProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    const close = useCallback(() => setOpen(false), []);

    useEffect(() => {
        if (!open) return;
        const onDoc = (e: MouseEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) close();
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        document.addEventListener("mousedown", onDoc);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDoc);
            document.removeEventListener("keydown", onKey);
        };
    }, [open, close]);

    if (products.length === 0) return null;

    const label = t("feed.buyNow", "Buy Now");

    return (
        <div ref={rootRef} className={cn("relative", className)}>
            <button
                type="button"
                aria-expanded={open}
                aria-haspopup="menu"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white transition-all hover:bg-primary-700"
            >
                {label}
                {products.length > 1 ? <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} /> : null}
            </button>
            {open ? (
                <div
                    role="menu"
                    className={cn(
                        "absolute bottom-full z-50 mb-1 max-h-64 min-w-[220px] overflow-y-auto rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900",
                        menuAlign === "right" ? "right-0" : "left-0",
                    )}
                >
                    <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                        {t("feed.taggedProducts", "Tagged products")}
                    </p>
                    {products.map((product) => (
                        <button
                            key={product.productId}
                            type="button"
                            role="menuitem"
                            onClick={() => {
                                close();
                                navigate(`/products/${product.productId}`);
                            }}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl}
                                    alt=""
                                    className="h-9 w-9 shrink-0 rounded-md object-cover"
                                />
                            ) : (
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-[10px] font-bold text-neutral-400 dark:bg-neutral-800">
                                    ?
                                </div>
                            )}
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                    {product.productName}
                                </span>
                                <span className="text-xs font-bold text-primary">
                                    {formatCurrencyVnd(product.price ?? 0)}
                                </span>
                            </span>
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
