import { renderHook, waitFor } from "@testing-library/react";
import { useProfileData } from "../useProfileData";
import { profileApi } from "../../api/profileApi";
import { marketplaceApi } from "../../../marketplace/api/marketplaceApi";
import type { MarketplaceListResponse } from "../../../marketplace/types/marketplace.types";

const emptyProductList: MarketplaceListResponse = {
    items: [],
    total: 0,
    page: 1,
    pageSize: 48,
};

vi.mock("../../../../shared/auth/useAuthSession", () => ({
    useAuthSession: vi.fn(),
}));

vi.mock("../../api/profileApi", () => ({
    profileApi: {
        getProfile: vi.fn(),
        listSuggestedUsers: vi.fn(),
    },
}));

vi.mock("../../../marketplace/api/marketplaceApi", () => ({
    marketplaceApi: {
        listProducts: vi.fn(),
    },
}));

import { useAuthSession } from "../../../../shared/auth/useAuthSession";

const buyerProfile = {
    id: "u1",
    role: "buyer" as const,
    fullName: "Buyer",
    postsCount: 0,
};

describe("useProfileData", () => {
    beforeEach(() => {
        vi.mocked(useAuthSession).mockReset();
        vi.mocked(profileApi.getProfile).mockReset();
        vi.mocked(profileApi.listSuggestedUsers).mockReset();
        vi.mocked(marketplaceApi.listProducts).mockReset();
    });

    it("loads self profile and suggested users for buyer", async () => {
        vi.mocked(useAuthSession).mockReturnValue({
            user: { id: "u1", email: "a@a.com", fullName: "A", role: "buyer" },
            refreshProfile: vi.fn().mockResolvedValue(undefined),
        } as never);
        vi.mocked(profileApi.getProfile).mockResolvedValue(buyerProfile as never);
        vi.mocked(profileApi.listSuggestedUsers).mockResolvedValue([
            { id: "u2", role: "buyer", fullName: "S" } as never,
        ]);

        const { result } = renderHook(() => useProfileData(undefined));

        await waitFor(() => {
            expect(result.current.profile?.id).toBe("u1");
            expect(result.current.isSelf).toBe(true);
            expect(result.current.suggestedUsers).toHaveLength(1);
        });
        expect(profileApi.getProfile).toHaveBeenCalledWith("u1");
    });

    it("loads other user profile without suggested list", async () => {
        vi.mocked(useAuthSession).mockReturnValue({
            user: { id: "me", email: "m@m.com", fullName: "Me", role: "buyer" },
            refreshProfile: vi.fn(),
        } as never);
        vi.mocked(profileApi.getProfile).mockResolvedValue({
            ...buyerProfile,
            id: "other",
            role: "seller",
        } as never);
        vi.mocked(marketplaceApi.listProducts).mockResolvedValue(emptyProductList);

        const { result } = renderHook(() => useProfileData("other"));

        await waitFor(() => {
            expect(result.current.profile?.id).toBe("other");
            expect(result.current.isSelf).toBe(false);
        });
        expect(profileApi.listSuggestedUsers).not.toHaveBeenCalled();
    });

    it("loads shop products for seller profile", async () => {
        vi.mocked(useAuthSession).mockReturnValue({
            user: { id: "s1", email: "s@s.com", fullName: "S", role: "seller" },
            refreshProfile: vi.fn(),
        } as never);
        vi.mocked(profileApi.getProfile).mockResolvedValue({
            id: "s1",
            role: "seller",
            fullName: "Shop",
        } as never);
        const sellerList: MarketplaceListResponse = {
            items: [{ id: "p1", name: "Item", price: 1, imageUrl: "" }],
            total: 1,
            page: 1,
            pageSize: 48,
        };
        vi.mocked(marketplaceApi.listProducts).mockResolvedValue(sellerList);

        const { result } = renderHook(() => useProfileData("s1"));

        await waitFor(() => {
            expect(result.current.shopProducts).toHaveLength(1);
        });
        expect(marketplaceApi.listProducts).toHaveBeenCalledWith(
            expect.objectContaining({ sellerId: "s1", pageSize: 48 }),
        );
    });

    it("sets profile null when getProfile fails", async () => {
        vi.mocked(useAuthSession).mockReturnValue({
            user: { id: "u1", email: "a@a.com", fullName: "A", role: "buyer" },
            refreshProfile: vi.fn(),
        } as never);
        vi.mocked(profileApi.getProfile).mockRejectedValue(new Error("fail"));

        const { result } = renderHook(() => useProfileData(undefined));

        await waitFor(() => {
            expect(result.current.profile).toBeNull();
            expect(result.current.isLoading).toBe(false);
        });
    });
});
