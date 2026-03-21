export interface SellerRegistrationStep1 {
    shopName: string;
    shopCategory: string;
    shopDescription: string;
    shopAddress: string;
    contactPhone: string;
    /** Cloudinary URL — saved to User.avatarUrl (shop logo) */
    shopLogoUrl?: string;
    /** Cloudinary URL — saved to User.coverImage */
    shopCoverUrl?: string;
}

export interface SellerRegistrationStep2 {
    idType: "national_id" | "passport" | "business_license";
    idNumber: string;
    idImageFront?: string;
    idImageBack?: string;
    /** Cloudinary public_id for authenticated ID uploads */
    idImageFrontPublicId?: string;
    idImageBackPublicId?: string;
}

export interface SellerRegistrationStep3 {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
}

export type SellerRegistrationData = SellerRegistrationStep1 &
    SellerRegistrationStep2 &
    SellerRegistrationStep3;

export interface SellerRegistrationResponse {
    sellerId: string;
    status: "pending_review" | "approved";
}

/** Matches GET /seller/status `data` (Prisma enum or `not_started`). */
export type SellerApplicationStatusValue =
    | "not_started"
    | "PENDING"
    | "REVIEWING"
    | "APPROVED"
    | "REJECTED";

export interface SellerApplicationStatus {
    status: SellerApplicationStatusValue | string;
    step1Completed?: boolean;
    step2Completed?: boolean;
    step3Completed?: boolean;
    rejectionReason?: string | null;
    verifiedAt?: string | null;
    createdAt?: string;
}

/** Backend `err.code` for seller registration guardrails. */
export type SellerRegistrationErrorCode =
    | "SELLER_APPLICATION_LOCKED"
    | "SELLER_APPLICATION_ALREADY_APPROVED"
    | "USER_ALREADY_SELLER";
