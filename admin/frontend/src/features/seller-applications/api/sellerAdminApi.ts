import { http } from "@/lib/httpClient";

function unwrap<T>(res: { data?: T } | T): T {
    if (typeof res === "object" && res !== null && "data" in res) {
        return (res as { data: T }).data;
    }
    return res as T;
}

export interface SellerApplicationUser {
    id: string;
    email: string;
    username: string;
    fullName: string | null;
    /** During seller application review, this is the submitted shop logo (also user avatar). */
    avatarUrl: string | null;
    /** Shop cover image submitted with seller registration. */
    coverImage?: string | null;
    phone?: string | null;
    /** May include `shopLogoUrl` / `shopCoverUrl` when uploads exist but profile avatar/cover were not updated. */
    shopInformation?: Record<string, unknown> | null;
}

/** Matches admin list payload after `_sanitizeVerificationForAdminList`. */
export interface SellerApplicationAdmin {
    id: string;
    userId: string;
    status: string;
    step1Completed?: boolean;
    step2Completed?: boolean;
    step3Completed?: boolean;
    idCardNumber?: string | null;
    idCardFrontUrl?: string | null;
    idCardBackUrl?: string | null;
    idCardFrontPublicId?: string | null;
    idCardBackPublicId?: string | null;
    idCardFrontSignedUrl?: string | null;
    idCardBackSignedUrl?: string | null;
    dateOfBirth?: string | null;
    address?: string | null;
    businessName?: string | null;
    businessType?: string | null;
    businessLicenseNumber?: string | null;
    businessLicenseUrl?: string | null;
    taxCode?: string | null;
    bankName?: string | null;
    bankAccountNumber?: string | null;
    bankAccountName?: string | null;
    bankBranch?: string | null;
    rejectionReason?: string | null;
    verifiedAt?: string | null;
    verifiedBy?: string | null;
    createdAt: string;
    updatedAt?: string;
    user?: SellerApplicationUser;
}

export const sellerAdminApi = {
    async listApplications(params: {
        page?: number;
        limit?: number;
        status?: string;
    }) {
        const q = new URLSearchParams();
        if (params.page != null) q.set("page", String(params.page));
        if (params.limit != null) q.set("limit", String(params.limit));
        if (params.status) q.set("status", params.status);
        const res = await http<{
            data: {
                applications: SellerApplicationAdmin[];
                total: number;
                page: number;
                limit: number;
            };
        }>(`/seller/applications?${q}`);
        return unwrap(res);
    },

    async approve(id: string) {
        await http(`/seller/applications/${id}/approve`, {
            method: "POST",
            body: {},
        });
    },

    async reject(id: string, reason: string) {
        await http(`/seller/applications/${id}/reject`, {
            method: "POST",
            body: { reason },
        });
    },
};
