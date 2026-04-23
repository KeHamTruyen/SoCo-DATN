import { renderHook, act, waitFor } from "@testing-library/react";
import { useSellerProductForm } from "../useSellerProductForm";

const i18nMocks = vi.hoisted(() => ({
    t: (k: string, def?: string) => def ?? k,
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: i18nMocks.t }),
}));

vi.mock("../../api/sellerDashboardApi", () => ({
    sellerDashboardApi: {
        listCategories: vi.fn(),
        getMyProduct: vi.fn(),
        createProduct: vi.fn(),
        updateProduct: vi.fn(),
        deleteProductImage: vi.fn(),
        addProductImages: vi.fn(),
        deleteProductVariant: vi.fn(),
        createProductVariant: vi.fn(),
    },
}));

vi.mock("../../../upload/api/uploadApi", () => ({
    uploadApi: {
        uploadProductImages: vi.fn(),
    },
}));

import { sellerDashboardApi } from "../../api/sellerDashboardApi";

describe("useSellerProductForm", () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    beforeEach(() => {
        onClose.mockReset();
        onSuccess.mockReset();
        vi.mocked(sellerDashboardApi.listCategories).mockReset();
        vi.mocked(sellerDashboardApi.getMyProduct).mockReset();
        vi.mocked(sellerDashboardApi.createProduct).mockReset();
        vi.mocked(sellerDashboardApi.listCategories).mockResolvedValue([
            { id: "c1", name: "Cat" } as never,
        ]);
    });

    it("loads categories when dialog opens", async () => {
        const { result } = renderHook(() =>
            useSellerProductForm(true, "create", null, onClose, onSuccess),
        );

        await waitFor(() => expect(result.current.categories.length).toBeGreaterThan(0));
        expect(sellerDashboardApi.listCategories).toHaveBeenCalled();
    });

    it("handleSubmit rejects empty title", async () => {
        const { result } = renderHook(() =>
            useSellerProductForm(true, "create", null, onClose, onSuccess),
        );

        await waitFor(() => expect(result.current.categories.length).toBeGreaterThan(0));

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(result.current.error).toContain("tên sản phẩm");
        expect(sellerDashboardApi.createProduct).not.toHaveBeenCalled();
    });

    it("handleSubmit creates product in create mode", async () => {
        vi.mocked(sellerDashboardApi.createProduct).mockResolvedValue(undefined as never);

        const { result } = renderHook(() =>
            useSellerProductForm(true, "create", null, onClose, onSuccess),
        );

        await waitFor(() => expect(result.current.categories.length).toBeGreaterThan(0));

        await act(async () => {
            result.current.setForm((f) => ({
                ...f,
                title: "Widget",
                price: "9.99",
                description: "d",
                stockQuantity: "10",
                lowStockThreshold: "2",
                trackInventory: true,
                categoryIds: ["c1"],
                status: "DRAFT",
            }));
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(sellerDashboardApi.createProduct).toHaveBeenCalled();
        expect(onSuccess).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });
});
