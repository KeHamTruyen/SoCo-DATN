import { useRef } from "react";
import { ImagePlus } from "lucide-react";
import { useSellerRegistrationContext } from "../../context/SellerRegistrationContext";
import { cn } from "../../../../shared/lib/cn";
import { SELLER_REGISTRATION_CATEGORIES } from "../../utils/sellerRegistrationConstants";

export function RegistrationStepOne() {
    const {
        step1, setStep1,
        applyShopBrandingToProfile, setApplyShopBrandingToProfile,
        shopLogoPreview, shopCoverPreview,
        setShopLogoFile, setShopLogoPreview,
        setShopCoverFile, setShopCoverPreview,
        bindLocalImage, setError, isSubmitting
    } = useSellerRegistrationContext();

    const logoInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const brandingLocked = !applyShopBrandingToProfile || isSubmitting;

    return (
        <div className="space-y-6">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50/80 p-4 dark:border-neutral-700 dark:bg-neutral-800/40">
                <input
                    type="checkbox"
                    checked={applyShopBrandingToProfile}
                    onChange={(e) => setApplyShopBrandingToProfile(e.target.checked)}
                    className="mt-0.5 rounded border-neutral-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        Replace my profile avatar and/or cover with the shop images below.
                    </span>{" "}
                    When checked, each image you upload here is sent on submit and replaces only that slot (avatar for logo, cover for banner). 
                    Uncheck to keep your current photos — logo and banner uploads are disabled and nothing is uploaded to the server for branding.
                </span>
            </label>

            <div className={cn("grid grid-cols-1 gap-8 md:grid-cols-3", brandingLocked && "pointer-events-none opacity-50")}>
                <div className="col-span-1 flex flex-col items-center">
                    <label className="mb-3 block text-sm font-semibold">Shop Logo</label>
                    <input
                        ref={logoInputRef as React.RefObject<HTMLInputElement>}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={brandingLocked}
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            if (!file || !file.type.startsWith("image/")) return;
                            setError(null);
                            bindLocalImage("logo", file, setShopLogoFile, setShopLogoPreview);
                        }}
                    />
                    <button
                        type="button"
                        disabled={brandingLocked}
                        onClick={() => logoInputRef.current?.click()}
                        className="group relative flex h-32 w-32 flex-col items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-neutral-300 bg-neutral-50 transition-colors hover:border-primary disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800/50"
                    >
                        {shopLogoPreview ? (
                            <img src={shopLogoPreview} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <>
                                <ImagePlus className="mb-1 h-8 w-8 text-neutral-400 group-hover:text-primary" />
                                <span className="text-[10px] font-medium text-neutral-500">CHOOSE FILE</span>
                            </>
                        )}
                    </button>
                    <p className="mt-2 text-center text-xs text-neutral-500">
                        Cloudinary · max 3MB · ~512×512
                    </p>
                </div>
                <div className="col-span-1 md:col-span-2">
                    <label className="mb-3 block text-sm font-semibold">Cover Photo</label>
                    <input
                        ref={coverInputRef as React.RefObject<HTMLInputElement>}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={brandingLocked}
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            if (!file || !file.type.startsWith("image/")) return;
                            setError(null);
                            bindLocalImage("cover", file, setShopCoverFile, setShopCoverPreview);
                        }}
                    />
                    <button
                        type="button"
                        disabled={brandingLocked}
                        onClick={() => coverInputRef.current?.click()}
                        className="group relative flex h-32 w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 transition-colors hover:border-primary disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800/50"
                    >
                        {shopCoverPreview ? (
                            <img src={shopCoverPreview} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <>
                                <ImagePlus className="mb-1 h-8 w-8 text-neutral-400 group-hover:text-primary" />
                                <span className="text-xs font-medium text-neutral-500">Click to choose banner</span>
                            </>
                        )}
                    </button>
                    <p className="mt-2 text-xs text-neutral-500">
                        Cloudinary · max 5MB · Wide banner
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Shop Name</label>
                    <input
                        type="text"
                        value={step1.shopName}
                        onChange={(e) => setStep1((s) => ({ ...s, shopName: e.target.value }))}
                        placeholder="Enter your business name"
                        className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Shop Category</label>
                    <select
                        value={step1.shopCategory}
                        onChange={(e) => setStep1((s) => ({ ...s, shopCategory: e.target.value }))}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                    >
                        <option value="">Select a category</option>
                        {SELLER_REGISTRATION_CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Shop Description</label>
                <textarea
                    value={step1.shopDescription}
                    onChange={(e) => setStep1((s) => ({ ...s, shopDescription: e.target.value }))}
                    placeholder="Tell customers about your shop..."
                    rows={4}
                    className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Shop Address</label>
                    <input
                        type="text"
                        value={step1.shopAddress}
                        onChange={(e) => setStep1((s) => ({ ...s, shopAddress: e.target.value }))}
                        placeholder="Business address"
                        className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Contact Phone</label>
                    <input
                        type="tel"
                        value={step1.contactPhone}
                        onChange={(e) => setStep1((s) => ({ ...s, contactPhone: e.target.value }))}
                        placeholder="+84 000 000 000"
                        className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                    />
                </div>
            </div>
        </div>
    );
}
