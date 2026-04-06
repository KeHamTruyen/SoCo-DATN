import { useState, useCallback, useEffect } from "react";
import { httpClient } from "../../../shared/api/httpClient";

export function useAiStudioProducts(canLinkProduct: boolean) {
    const [productQuery, setProductQuery] = useState("");
    const [myProducts, setMyProducts] = useState<
        Array<{
            id: string;
            title: string;
            description?: string;
            price?: number | null;
            imageUrl?: string | null;
        }>
    >([]);
    const [isLoadingMyProducts, setIsLoadingMyProducts] = useState(false);
    const [hasLoadedMyProducts, setHasLoadedMyProducts] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<
        | {
              id: string;
              title: string;
              description?: string;
              price?: number | null;
              imageUrl?: string | null;
          }
        | null
    >(null);
    const [productDropdownOpen, setProductDropdownOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadMyProducts = useCallback(async () => {
        if (hasLoadedMyProducts || isLoadingMyProducts) return;
        setIsLoadingMyProducts(true);
        try {
            const res = await httpClient.get<{
                data?: unknown[];
            }>("/products/seller/me?limit=30&page=1", { requiresAuth: true });

            const raw = (res as unknown as { data?: any[] }).data ?? [];
            const mapped = raw.map((p) => {
                const images = Array.isArray(p?.images) ? p.images : [];
                const imageUrl = images?.[0]?.imageUrl ?? images?.[0]?.url ?? null;

                const priceNum = p?.price == null || p.price === "" ? null : Number(p.price);

                return {
                    id: String(p?.id ?? ""),
                    title: String(p?.title ?? ""),
                    description: p?.description != null ? String(p.description) : undefined,
                    price: Number.isFinite(priceNum) ? priceNum : null,
                    imageUrl: imageUrl ? String(imageUrl) : null,
                };
            });

            setMyProducts(mapped.filter((p) => p.id && p.title));
            setHasLoadedMyProducts(true);
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : "Không tải được danh sách sản phẩm.");
        } finally {
            setIsLoadingMyProducts(false);
        }
    }, [hasLoadedMyProducts, isLoadingMyProducts]);

    useEffect(() => {
        if (!productDropdownOpen) return;
        void loadMyProducts();
    }, [productDropdownOpen, loadMyProducts]);

    useEffect(() => {
        if (canLinkProduct) return;
        setSelectedProduct(null);
        setProductQuery("");
        setProductDropdownOpen(false);
    }, [canLinkProduct]);

    const filteredMyProducts = (() => {
        const q = productQuery.trim().toLowerCase();
        if (!q) return myProducts.slice(0, 8);
        return myProducts
            .filter((p) => p.title.toLowerCase().includes(q))
            .slice(0, 8);
    })();

    const handleSelectProduct = (p: typeof myProducts[number]) => {
        setSelectedProduct(p);
        setProductQuery(p.title);
        setProductDropdownOpen(false);
    };

    const resetProducts = useCallback(() => {
        setProductQuery("");
        setMyProducts([]);
        setHasLoadedMyProducts(false);
        setSelectedProduct(null);
        setProductDropdownOpen(false);
        setErrorMessage(null);
    }, []);

    return {
        productQuery, setProductQuery,
        myProducts,
        isLoadingMyProducts,
        selectedProduct, setSelectedProduct,
        productDropdownOpen, setProductDropdownOpen,
        errorMessage, setErrorMessage,
        filteredMyProducts,
        handleSelectProduct,
        resetProducts
    };
}
