import { httpClient } from "../../../shared/api/httpClient";

/** After seller is APPROVED — re-enter password before viewing masked KYC/bank summary. */
export const sellerSensitiveApi = {
    async verifyReauth(currentPassword: string) {
        await httpClient.post(
            "/seller/sensitive/reauth",
            { currentPassword },
            { requiresAuth: true },
        );
    },

    async getMaskedSummary(currentPassword: string) {
        type Masked = {
            idCardNumberMasked?: string | null;
            bankAccountNumberMasked?: string | null;
            bankName?: string | null;
            bankAccountName?: string | null;
        };
        const res = await httpClient.post<{ success?: boolean; data?: Masked }>(
            "/seller/sensitive/masked-summary",
            { currentPassword },
            { requiresAuth: true },
        );
        if (res && typeof res === "object" && "data" in res) {
            return (res as { data: Masked }).data;
        }
        return res as Masked;
    },

    async submitChangeRequest(body: {
        currentPassword: string;
        idCardNumber?: string;
        bankAccountNumber?: string;
        idCardFrontPublicId?: string | null;
        idCardBackPublicId?: string | null;
        bankName?: string | null;
        bankAccountName?: string | null;
    }) {
        await httpClient.post("/seller/sensitive/change-request", body, { requiresAuth: true });
    },

    async getMyPending() {
        type Row = { id: string; status: string; createdAt: string } | null;
        const res = await httpClient.get<{ success?: boolean; data?: Row }>("/seller/sensitive/change-request", {
            requiresAuth: true,
        });
        if (res && typeof res === "object" && "data" in res) {
            return (res as { data: Row }).data;
        }
        return null;
    },
};
