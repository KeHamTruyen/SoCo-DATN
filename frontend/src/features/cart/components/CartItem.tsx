import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "../../../shared/ui/atoms/button";
import type { CartItem as CartItemType } from "../types/cart.types";

interface CartItemProps {
    item: CartItemType;
    selected: boolean;
    onSelect: (id: string, checked: boolean) => void;
    onQuantityChange: (id: string, quantity: number) => void;
    onRemove: (id: string) => void;
}

export function CartItem({
    item,
    selected,
    onSelect,
    onQuantityChange,
    onRemove,
}: CartItemProps) {
    const variantText = item.variants?.map((v) => `${v.name}: ${v.value}`).join(" | ");

    return (
        <div className="flex flex-col gap-4 p-4 sm:flex-row">
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={(e) => onSelect(item.id, e.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-700"
                />
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                    {item.imageUrl ? (
                        <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400 text-xs">
                            No image
                        </div>
                    )}
                </div>
            </div>
            <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">{item.productName}</h3>
                        {variantText && (
                            <p className="text-sm text-slate-500">{variantText}</p>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-red-500"
                        onClick={() => onRemove(item.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                <div className="mt-4 flex items-end justify-between">
                    <span className="text-xl font-bold text-primary">
                        ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                            className="border-r border-slate-200 px-3 py-1 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                            <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-4 py-1 text-sm font-bold">{item.quantity}</span>
                        <button
                            type="button"
                            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                            className="border-l border-slate-200 px-3 py-1 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                            <Plus className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
