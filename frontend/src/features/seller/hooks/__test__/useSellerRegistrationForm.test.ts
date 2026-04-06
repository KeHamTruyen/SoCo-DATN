import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSellerRegistrationForm } from "../useSellerRegistrationForm";

describe("useSellerRegistrationForm", () => {
    it("should initialize with default states", () => {
        const { result } = renderHook(() => useSellerRegistrationForm());
        expect(result.current.step).toBe(1);
        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.error).toBe(null);
        expect(result.current.applyShopBrandingToProfile).toBe(true);
        expect(result.current.step1.shopName).toBe("");
        expect(result.current.step2.idType).toBe("national_id");
        expect(result.current.step3.bankName).toBe("");
    });

    it("should allow changing steps", () => {
        const { result } = renderHook(() => useSellerRegistrationForm());
        
        act(() => {
            result.current.setStep(2);
        });
        expect(result.current.step).toBe(2);

        act(() => {
            result.current.setStep(3);
        });
        expect(result.current.step).toBe(3);
    });

    it("should allow updating form data", () => {
        const { result } = renderHook(() => useSellerRegistrationForm());
        
        act(() => {
            result.current.setStep1({
                ...result.current.step1,
                shopName: "My Cool Shop",
            });
        });
        expect(result.current.step1.shopName).toBe("My Cool Shop");
    });
});
