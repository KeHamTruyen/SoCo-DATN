/**
 * Stored on `User.shopInformation` (JSON). No avatar/cover URLs, no plaintext CCCD/bank account.
 * Written when seller wizard step3 succeeds (`registrationMeta` snapshot). Display-only shop profile.
 * Source of truth for KYC/bank + ID images: `SellerVerification` (encrypted + Cloudinary public_id).
 */
export interface ShopInformationSnapshot {
    shopName?: string | null;
    shopCategory?: string | null;
    shopDescription?: string | null;
    shopAddress?: string | null;
    contactPhone?: string | null;
    idType?: string | null;
}
