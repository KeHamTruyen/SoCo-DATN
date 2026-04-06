import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProfileTabs } from "./useProfileTabs";

describe("useProfileTabs", () => {
    it("should initialize with default values", () => {
        const { result } = renderHook(() => useProfileTabs());
        
        expect(result.current.buyerVisitorTab).toBe("posts");
        expect(result.current.buyerSelfTab).toBe("posts");
        expect(result.current.sellerVisitorTab).toBe("products");
        expect(result.current.sellerSelfTab).toBe("posts");
        expect(result.current.productCategory).toBeNull();
    });

    it("should update buyerVisitorTab", () => {
        const { result } = renderHook(() => useProfileTabs());
        
        act(() => {
            result.current.setBuyerVisitorTab("reviews");
        });
        
        expect(result.current.buyerVisitorTab).toBe("reviews");
    });

    it("should update productCategory", () => {
        const { result } = renderHook(() => useProfileTabs());
        
        act(() => {
            result.current.setProductCategory("electronics");
        });
        
        expect(result.current.productCategory).toBe("electronics");
    });
});
