import { renderHook } from "@testing-library/react";
import { useSellerRegistrationContext } from "../SellerRegistrationContext";

describe("useSellerRegistrationContext", () => {
    it("throws when used outside SellerRegistrationProvider", () => {
        expect(() => {
            renderHook(() => useSellerRegistrationContext());
        }).toThrow("useSellerRegistrationContext must be used within SellerRegistrationProvider");
    });
});
