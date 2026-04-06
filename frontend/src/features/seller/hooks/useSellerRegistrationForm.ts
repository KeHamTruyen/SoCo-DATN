import { useState } from "react";
import type {
    SellerRegistrationStep1,
    SellerRegistrationStep2,
    SellerRegistrationStep3,
} from "../../seller/types/seller.types";

export type Step = 1 | 2 | 3;

export function useSellerRegistrationForm() {
    const [step, setStep] = useState<Step>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [step1, setStep1] = useState<SellerRegistrationStep1>({
        shopName: "",
        shopCategory: "",
        shopDescription: "",
        shopAddress: "",
        contactPhone: "",
    });

    const [step2, setStep2] = useState<SellerRegistrationStep2>({
        idType: "national_id",
        idNumber: "",
    });

    const [step3, setStep3] = useState<SellerRegistrationStep3>({
        bankName: "",
        accountNumber: "",
        accountHolderName: "",
    });

    const [applyShopBrandingToProfile, setApplyShopBrandingToProfile] = useState(true);

    return {
        step, setStep,
        isSubmitting, setIsSubmitting,
        error, setError,
        step1, setStep1,
        step2, setStep2,
        step3, setStep3,
        applyShopBrandingToProfile, setApplyShopBrandingToProfile
    };
}
