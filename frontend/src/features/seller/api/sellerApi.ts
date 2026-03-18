import { httpClient } from "../../../shared/api/httpClient";
import type {
    SellerRegistrationData,
    SellerRegistrationResponse,
} from "../types/seller.types";

interface ApiResponse<T> {
    data?: T;
}

function unwrap<T>(res: ApiResponse<T> | T): T {
    if (typeof res === "object" && res !== null && "data" in res) {
        return (res as ApiResponse<T>).data as T;
    }
    return res as T;
}

export const sellerApi = {
    async registerSeller(data: SellerRegistrationData) {
        const res = await httpClient.post<
            ApiResponse<SellerRegistrationResponse> | SellerRegistrationResponse
        >("/seller/register", data, { requiresAuth: true });
        return unwrap<SellerRegistrationResponse>(res);
    },
};
