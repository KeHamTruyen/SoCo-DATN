import { renderHook, act, waitFor } from "@testing-library/react";
import { useCheckoutPage } from "../useCheckoutPage";
import { cartApi } from "../../../cart/api/cartApi";
import { orderApi } from "../../../order/api/orderApi";

const mockNavigate = vi.fn();
const mockLocation = { state: { selectedCartItemIds: ["c1"] } };

vi.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
}));

vi.mock("../../../cart/api/cartApi", () => ({
    cartApi: {
        getCart: vi.fn(),
    },
}));

vi.mock("../../../order/api/orderApi", () => ({
    orderApi: {
        createOrder: vi.fn(),
    },
}));

describe("useCheckoutPage", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("loads selected cart items", async () => {
        vi.mocked(cartApi.getCart).mockResolvedValue({
            items: [{ id: "c1", price: 100, quantity: 2, productName: "A" }],
        } as never);

        const { result } = renderHook(() => useCheckoutPage());
        await waitFor(() => expect(result.current.isLoadingCart).toBe(false));

        expect(result.current.selectedItems).toHaveLength(1);
        expect(result.current.total).toBe(30200);
    });

    it("validates required form fields", async () => {
        vi.mocked(cartApi.getCart).mockResolvedValue({
            items: [{ id: "c1", price: 100, quantity: 1, productName: "A" }],
        } as never);
        const { result } = renderHook(() => useCheckoutPage());
        await waitFor(() => expect(result.current.isLoadingCart).toBe(false));

        await act(async () => {
            await result.current.submitOrder();
        });

        expect(result.current.error).toContain("required");
    });

    it("places order and redirects single order", async () => {
        vi.mocked(cartApi.getCart).mockResolvedValue({
            items: [{ id: "c1", price: 100, quantity: 1, productName: "A" }],
        } as never);
        vi.mocked(orderApi.createOrder).mockResolvedValueOnce({ id: "o1" } as never);
        const { result } = renderHook(() => useCheckoutPage());
        await waitFor(() => expect(result.current.isLoadingCart).toBe(false));

        act(() => {
            result.current.updateForm("fullName", "John");
            result.current.updateForm("phone", "0123");
            result.current.updateForm("address", "Address");
        });
        await act(async () => {
            await result.current.submitOrder();
        });

        expect(orderApi.createOrder).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith("/checkout/success?orderId=o1");
    });
});
