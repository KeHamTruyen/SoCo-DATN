import { useState } from "react";

export type BuyerVisitorTab = "posts" | "reviews";
export type BuyerSelfTab = "posts" | "orders" | "groups" | "reviews";
export type SellerVisitorTab = "products" | "posts" | "reviews";
export type SellerSelfTab = "posts" | "shop" | "reviews" | "scheduled";

export function useProfileTabs() {
    const [buyerVisitorTab, setBuyerVisitorTab] = useState<BuyerVisitorTab>("posts");
    const [buyerSelfTab, setBuyerSelfTab] = useState<BuyerSelfTab>("posts");
    const [sellerVisitorTab, setSellerVisitorTab] = useState<SellerVisitorTab>("products");
    const [sellerSelfTab, setSellerSelfTab] = useState<SellerSelfTab>("posts");
    
    const [productCategory, setProductCategory] = useState<string | null>(null);

    return {
        buyerVisitorTab,
        setBuyerVisitorTab,
        buyerSelfTab,
        setBuyerSelfTab,
        sellerVisitorTab,
        setSellerVisitorTab,
        sellerSelfTab,
        setSellerSelfTab,
        productCategory,
        setProductCategory
    };
}
