import { useEffect, useMemo, useState } from "react";
import { cartApi } from "../api/cartApi";
import type { Cart } from "../types/cart.types";

export function useCartPage() {
    const [cart, setCart] = useState<Cart | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [actionError, setActionError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        void (async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await cartApi.getCart();
                if (!mounted) return;
                setCart(data);
                const allIds = (data.groups ?? []).flatMap((g) => (g.items ?? []).map((i) => i.id));
                setSelectedIds(new Set(allIds));
            } catch {
                if (!mounted) return;
                setError("Unable to load your cart.");
            } finally {
                if (mounted) setIsLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const allItems = useMemo(() => cart?.groups?.flatMap((g) => g.items ?? []) ?? [], [cart]);
    const allSelected = allItems.length > 0 && allItems.every((i) => selectedIds.has(i.id));
    const selectedCount = selectedIds.size;
    const selectedSubtotal = allItems
        .filter((i) => selectedIds.has(i.id))
        .reduce((sum, i) => sum + i.price * i.quantity, 0);

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
            const allIds = (cart.groups ?? []).flatMap((g) => (g.items ?? []).map((i) => i.id));
            setSelectedIds(new Set(allIds));
            return;
        }
        setSelectedIds(new Set());
    };

    const handleQuantityChange = async (cartItemId: string, quantity: number) => {
        try {
            const updated = await cartApi.updateItem(cartItemId, quantity);
            setCart(updated);
            setActionError(null);
        } catch {
            setActionError("Unable to update quantity. Please try again.");
        }
    };

    const handleRemove = async (cartItemId: string) => {
        try {
            const updated = await cartApi.removeItem(cartItemId);
            setCart(updated);
            setActionError(null);
            setSelectedIds((prev) => {
                const next = new Set(prev);
                next.delete(cartItemId);
                return next;
            });
        } catch {
            setActionError("Unable to remove item. Please try again.");
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.size === 0) return;
        try {
            await Promise.all(Array.from(selectedIds).map((id) => cartApi.removeItem(id)));
            const updated = await cartApi.getCart();
            setCart(updated);
            setSelectedIds(new Set());
            setActionError(null);
        } catch {
            setActionError("Unable to delete selected items.");
        }
    };

    return {
        cart,
        isLoading,
        error,
        selectedIds,
        actionError,
        allItems,
        allSelected,
        selectedCount,
        selectedSubtotal,
        setActionError,
        handleSelect,
        handleSelectAll,
        handleQuantityChange,
        handleRemove,
        handleDeleteSelected,
    };
}
