import { httpClient } from "../../../shared/api/httpClient";
import type {
    SellerApplicationStatus,
    SellerRegistrationData,
    SellerRegistrationResponse,
} from "../types/seller.types";

export type SellerRegistrationWizardFiles = {
    idFront: File;
    idBack: File;
    shopLogo?: File | null;
    shopCover?: File | null;
};

export const sellerApi = {
    async getApplicationStatus(): Promise<SellerApplicationStatus> {
        const res = await httpClient.get<{ success?: boolean; data?: SellerApplicationStatus }>(
            "/seller/status",
            { requiresAuth: true },
        );
        if (!res?.data) {
            throw new Error("Invalid seller status response");
        }
        return res.data;
    },

    /** Chỉ khi đơn đang REVIEWING: xóa đơn + clear shopInformation để đăng ký lại. */
    async withdrawReviewingApplication(): Promise<void> {
        await httpClient.post("/seller/application/withdraw", {}, { requiresAuth: true });
    },

    /**
     * Single request: validate → Cloudinary upload on server → DB (steps 1–3).
     * No client-side upload before submit, so failed submits do not leave orphan images.
     */
    async registerSeller(
        data: SellerRegistrationData,
        files: SellerRegistrationWizardFiles,
        options?: { applyShopBrandingToProfile?: boolean },
    ) {
        const fd = new FormData();
        fd.append(
            "payload",
            JSON.stringify({
                shopName: data.shopName,
                shopCategory: data.shopCategory,
                shopDescription: data.shopDescription,
                shopAddress: data.shopAddress,
                contactPhone: data.contactPhone,
                idType: data.idType,
                idNumber: data.idNumber,
                bankName: data.bankName,
                accountNumber: data.accountNumber,
                accountHolderName: data.accountHolderName,
                applyShopBrandingToProfile: options?.applyShopBrandingToProfile !== false,
            }),
        );
        fd.append("idFront", files.idFront);
        fd.append("idBack", files.idBack);
        if (files.shopLogo) fd.append("shopLogo", files.shopLogo);
        if (files.shopCover) fd.append("shopCover", files.shopCover);

        const final = await httpClient.postFormData<{
            data?: { application?: { id?: string } };
        }>("/seller/register-with-uploads", fd, { requiresAuth: true });

        const appId =
            typeof final === "object" &&
            final !== null &&
            "data" in final &&
            final.data &&
            typeof final.data === "object" &&
            "application" in final.data
                ? (final.data as { application?: { id?: string } }).application?.id
                : undefined;

        const out: SellerRegistrationResponse = {
            sellerId: appId ?? "",
            status: "pending_review",
        };

        return out;
    },
};
