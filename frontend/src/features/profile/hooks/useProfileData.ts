import { useEffect, useState } from "react";
import { profileApi } from "../api/profileApi";
import { marketplaceApi } from "../../marketplace/api/marketplaceApi";
import type { PublicUserProfile } from "../types/profile.types";
import type { ProductListItem } from "../../marketplace/types/marketplace.types";
import { useAuthSession } from "../../../shared/auth/useAuthSession";

export function useProfileData(id?: string) {
    const { user, refreshProfile } = useAuthSession();
    const [profile, setProfile] = useState<PublicUserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [suggestedUsers, setSuggestedUsers] = useState<PublicUserProfile[]>([]);
    const [suggestedLoading, setSuggestedLoading] = useState(false);
    
    const [shopProducts, setShopProducts] = useState<ProductListItem[]>([]);
    const [shopProductsLoading, setShopProductsLoading] = useState(false);

    const isSelf = !id || id === user?.id;

    useEffect(() => {
        let mounted = true;
        void (async () => {
            setIsLoading(true);
            setSuggestedLoading(true);
            setShopProductsLoading(true);
            try {
                let loadedProfile: PublicUserProfile | null = null;
                if (isSelf) {
                    const selfId = user?.id;
                    if (!selfId) {
                        if (mounted) setProfile(null);
                        return;
                    }
                    loadedProfile = await profileApi.getProfile(selfId);
                } else if (id) {
                    loadedProfile = await profileApi.getProfile(id);
                }
                if (!mounted) return;
                setProfile(loadedProfile);
                if (!loadedProfile) return;

                const suggestedPromise =
                    loadedProfile.role === "buyer"
                        ? profileApi
                              .listSuggestedUsers()
                              .catch(() => [] as PublicUserProfile[])
                        : Promise.resolve([] as PublicUserProfile[]);
                
                const shopPromise =
                    loadedProfile.role === "seller"
                        ? marketplaceApi
                              .listProducts({
                                  sellerId: loadedProfile.id,
                                  pageSize: 48,
                              })
                              .catch(() => ({ items: [] as ProductListItem[] }))
                        : Promise.resolve({ items: [] as ProductListItem[] });

                const [su, shopData] = await Promise.all([
                    suggestedPromise,
                    shopPromise,
                ]);
                
                if (!mounted) return;
                setSuggestedUsers(su);
                setShopProducts(shopData.items);
            } catch {
                if (mounted) setProfile(null);
            } finally {
                if (mounted) {
                    setIsLoading(false);
                    setSuggestedLoading(false);
                    setShopProductsLoading(false);
                }
            }
        })();
        return () => {
            mounted = false;
        };
    }, [id, isSelf, user?.id]);

    return {
        user,
        refreshProfile,
        profile,
        setProfile,
        isLoading,
        suggestedUsers,
        suggestedLoading,
        shopProducts,
        shopProductsLoading,
        isSelf
    };
}
