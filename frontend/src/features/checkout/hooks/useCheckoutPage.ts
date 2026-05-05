import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cartApi } from "../../cart/api/cartApi";
import type { CartItem } from "../../cart/types/cart.types";
import { orderApi } from "../../order/api/orderApi";

export type CheckoutPaymentMethod = "COD" | "BANK_TRANSFER" | "MOMO";

export function useCheckoutPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedCartItemIds = useMemo<string[]>(
        () =>
            ((location.state as { selectedCartItemIds?: string[] } | null)?.selectedCartItemIds ??
                []),
        [location.state],
    );

    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        address: "",
    });
    const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>("COD");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingCart, setIsLoadingCart] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
    const [voucherCode, setVoucherCode] = useState("");
    const [voucherDiscount, setVoucherDiscount] = useState(0);

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
                if (items.length === 0) setError("Selected items are no longer in your cart.");
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
    const total = subtotal + shipping - voucherDiscount;

    const updateForm = (key: "fullName" | "phone" | "address", value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const submitOrder = async () => {
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
                voucherCode: voucherCode || undefined,
            });
            const orders = Array.isArray(order) ? order : [order];
            const orderIds = orders.map((o) => o.id).filter(Boolean);
            if (orderIds.length === 1) navigate(`/checkout/success?orderId=${orderIds[0]}`);
            else navigate(`/checkout/success?orderIds=${encodeURIComponent(orderIds.join(","))}`);
        } catch {
            setError("Failed to place order. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        form,
        paymentMethod,
        isSubmitting,
        isLoadingCart,
        error,
        selectedItems,
        subtotal,
        shipping,
        total,
        voucherCode,
        voucherDiscount,
        navigate,
        updateForm,
        setPaymentMethod,
        setVoucherCode,
        setVoucherDiscount,
        submitOrder,
    };
}
