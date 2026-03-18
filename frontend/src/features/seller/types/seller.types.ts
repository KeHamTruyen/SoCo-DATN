export interface SellerRegistrationStep1 {
    shopName: string;
    shopCategory: string;
    shopDescription: string;
    shopAddress: string;
    contactPhone: string;
}

export interface SellerRegistrationStep2 {
    idType: "national_id" | "passport" | "business_license";
    idNumber: string;
    idImageFront?: string;
    idImageBack?: string;
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
