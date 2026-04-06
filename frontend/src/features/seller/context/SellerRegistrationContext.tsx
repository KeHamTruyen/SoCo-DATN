import { createContext, useContext, useCallback, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthSession } from "../../../shared/auth/useAuthSession";
import { sellerApi } from "../../seller/api/sellerApi";
import { messageForSellerRegistrationSubmitError } from "../../seller/utils/sellerRegistrationConstants";
import { useSellerApplicationStatus } from "../hooks/useSellerApplicationStatus";
import { useSellerRegistrationMedia } from "../hooks/useSellerRegistrationMedia";
import { useSellerRegistrationForm, type Step } from "../hooks/useSellerRegistrationForm";

type ApplicationStatusHook = ReturnType<typeof useSellerApplicationStatus>;
type MediaHook = ReturnType<typeof useSellerRegistrationMedia>;
type FormHook = ReturnType<typeof useSellerRegistrationForm>;

interface SellerRegistrationContextValue extends ApplicationStatusHook, MediaHook, FormHook {
    isAlreadySeller: boolean;
    goNext: () => void;
    handleSubmit: () => Promise<void>;
}

const SellerRegistrationContext = createContext<SellerRegistrationContextValue | null>(null);

export function SellerRegistrationProvider({ children }: { children: ReactNode }) {
    const navigate = useNavigate();
    const { user, refreshProfile } = useAuthSession();
    
    const status = useSellerApplicationStatus();
    const media = useSellerRegistrationMedia();
    const form = useSellerRegistrationForm();

    const isAlreadySeller = user?.role === "seller" || status.applicationStatus?.status === "APPROVED";

    useEffect(() => {
        if (!form.applyShopBrandingToProfile) {
            media.bindLocalImage("logo", null, media.setShopLogoFile, media.setShopLogoPreview);
            media.bindLocalImage("cover", null, media.setShopCoverFile, media.setShopCoverPreview);
        }
    }, [form.applyShopBrandingToProfile, media.bindLocalImage, media.setShopLogoFile, media.setShopLogoPreview, media.setShopCoverFile, media.setShopCoverPreview]);

    const goNext = useCallback(() => {
        form.setError(null);
        if (form.step === 2) {
            if (!form.step2.idNumber.trim()) {
                form.setError("Please enter your ID number.");
                return;
            }
            if (!media.idFrontFile || !media.idBackFile) {
                form.setError("Please select both the front and back photos of your document (upload happens when you submit).");
                return;
            }
        }
        form.setStep((s) => Math.min(3, s + 1) as Step);
    }, [form.step, form.step2.idNumber, media.idFrontFile, media.idBackFile, form.setError, form.setStep]);

    const handleSubmit = async () => {
        form.setIsSubmitting(true);
        form.setError(null);
        try {
            if (!media.idFrontFile || !media.idBackFile) {
                form.setError("ID document images are required. Go back to step 2 and select both sides.");
                return;
            }

            try {
                await sellerApi.registerSeller(
                    { ...form.step1, ...form.step2, ...form.step3 },
                    {
                        idFront: media.idFrontFile,
                        idBack: media.idBackFile,
                        ...(form.applyShopBrandingToProfile
                            ? { shopLogo: media.shopLogoFile ?? undefined, shopCover: media.shopCoverFile ?? undefined }
                            : {}),
                    },
                    { applyShopBrandingToProfile: form.applyShopBrandingToProfile },
                );
            } catch (regErr) {
                form.setError(messageForSellerRegistrationSubmitError(regErr));
                return;
            }

            await refreshProfile();
            navigate("/seller-registration/success");
        } finally {
            form.setIsSubmitting(false);
        }
    };

    return (
        <SellerRegistrationContext.Provider value={{
            ...status,
            ...media,
            ...form,
            isAlreadySeller,
            goNext,
            handleSubmit,
        }}>
            {children}
        </SellerRegistrationContext.Provider>
    );
}

export function useSellerRegistrationContext() {
    const context = useContext(SellerRegistrationContext);
    if (!context) {
        throw new Error("useSellerRegistrationContext must be used within SellerRegistrationProvider");
    }
    return context;
}
