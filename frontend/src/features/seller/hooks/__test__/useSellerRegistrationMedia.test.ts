import { renderHook, act } from "@testing-library/react";
import { useSellerRegistrationMedia } from "../useSellerRegistrationMedia";

describe("useSellerRegistrationMedia", () => {
    it("bindLocalImage sets file and preview for logo", () => {
        const { result } = renderHook(() => useSellerRegistrationMedia());
        const file = new File(["x"], "logo.png", { type: "image/png" });

        act(() => {
            result.current.bindLocalImage(
                "logo",
                file,
                result.current.setShopLogoFile,
                result.current.setShopLogoPreview,
            );
        });

        expect(result.current.shopLogoFile).toBe(file);
        expect(result.current.shopLogoPreview).toMatch(/^blob:/);
    });

    it("bindLocalImage clears when file is null", () => {
        const { result } = renderHook(() => useSellerRegistrationMedia());
        const file = new File(["x"], "logo.png", { type: "image/png" });

        act(() => {
            result.current.bindLocalImage(
                "logo",
                file,
                result.current.setShopLogoFile,
                result.current.setShopLogoPreview,
            );
        });
        act(() => {
            result.current.bindLocalImage(
                "logo",
                null,
                result.current.setShopLogoFile,
                result.current.setShopLogoPreview,
            );
        });

        expect(result.current.shopLogoFile).toBeNull();
        expect(result.current.shopLogoPreview).toBeNull();
    });
});
