import { renderHook, act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useOrderDetailPage } from "../useOrderDetailPage";
import { orderApi } from "../../api/orderApi";
import { reviewApi } from "../../../review/api/reviewApi";
import { uploadProductImages } from "../../../upload/api/uploadApi";

const mockNavigate = vi.fn();
const translate = (_k: string, d: string) => d;

vi.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: translate }),
}));

vi.mock("../../api/orderApi", () => ({
    orderApi: {
        getOrder: vi.fn(),
        cancelOrder: vi.fn(),
        updateOrderStatus: vi.fn(),
    },
}));

vi.mock("../../../review/api/reviewApi", () => ({
    reviewApi: {
        createReview: vi.fn(),
    },
}));

vi.mock("../../../upload/api/uploadApi", () => ({
    uploadProductImages: vi.fn(),
}));

const mockOrder = {
    id: "o1",
    status: "completed",
    orderNumber: "ORD1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [{ id: "i1", productName: "A", quantity: 1, price: 100 }],
    subtotal: 100,
    shipping: 0,
    discount: 0,
    total: 100,
    shippingAddress: { fullName: "A", phone: "B", address: "C" },
    paymentMethod: "cod",
};

describe("useOrderDetailPage", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("loads order detail", async () => {
        vi.mocked(orderApi.getOrder).mockResolvedValue(mockOrder as never);
        const { result } = renderHook(() => useOrderDetailPage("o1"));

        await waitFor(() => expect(result.current.order?.id).toBe("o1"));
        expect(result.current.order?.id).toBe("o1");
    });

    it("cancels order and navigates", async () => {
        vi.mocked(orderApi.getOrder).mockResolvedValue({
            ...mockOrder,
            status: "pending",
        } as never);
        vi.mocked(orderApi.cancelOrder).mockResolvedValue({} as never);
        const { result } = renderHook(() => useOrderDetailPage("o1"));
        await waitFor(() => expect(result.current.order?.id).toBe("o1"));

        await act(async () => {
            await result.current.cancelOrder();
        });

        expect(orderApi.cancelOrder).toHaveBeenCalledWith("o1");
        expect(mockNavigate).toHaveBeenCalledWith("/orders");
    });

    it("marks as received", async () => {
        vi.mocked(orderApi.getOrder).mockResolvedValue({
            ...mockOrder,
            status: "delivered",
        } as never);
        vi.mocked(orderApi.updateOrderStatus).mockResolvedValue({
            ...mockOrder,
            status: "completed",
        } as never);
        const { result } = renderHook(() => useOrderDetailPage("o1"));
        await waitFor(() => expect(result.current.order?.id).toBe("o1"));

        await act(async () => {
            await result.current.markAsReceived();
        });

        expect(orderApi.updateOrderStatus).toHaveBeenCalledWith("o1", "completed");
        expect(result.current.order?.status).toBe("completed");
    });

    it("submits reviews and reloads order", async () => {
        vi.mocked(orderApi.getOrder).mockResolvedValue(mockOrder as never);
        vi.mocked(uploadProductImages).mockResolvedValue([{ url: "a.jpg" }] as never);
        vi.mocked(reviewApi.createReview).mockResolvedValue({ id: "r1" } as never);
        const { result } = renderHook(() => useOrderDetailPage("o1"));
        await waitFor(() => expect(result.current.order?.id).toBe("o1"));

        await act(async () => {
            await result.current.submitReviews([
                {
                    orderItemId: "i1",
                    rating: 5,
                    content: "good",
                    files: [new File(["x"], "a.png", { type: "image/png" })],
                },
            ]);
        });

        expect(reviewApi.createReview).toHaveBeenCalled();
        expect(result.current.reviewNotice).toContain("successfully");
    });
});
