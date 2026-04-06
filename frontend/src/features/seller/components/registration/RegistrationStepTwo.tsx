import { useRef } from "react";
import { ImagePlus } from "lucide-react";
import { useSellerRegistrationContext } from "../../context/SellerRegistrationContext";
import { cn } from "../../../../shared/lib/cn";
import { SELLER_REGISTRATION_ID_TYPES } from "../../utils/sellerRegistrationConstants";

export function RegistrationStepTwo() {
    const {
        step2, setStep2,
        idFrontPreview, idBackPreview,
        setIdFrontFile, setIdFrontPreview,
        setIdBackFile, setIdBackPreview,
        bindLocalImage, setError, isSubmitting
    } = useSellerRegistrationContext();

    const idFrontInputRef = useRef<HTMLInputElement>(null);
    const idBackInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">ID Document Type</label>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {SELLER_REGISTRATION_ID_TYPES.map((type) => (
                        <label
                            key={type.value}
                            className={cn(
                                "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors",
                                step2.idType === type.value
                                    ? "border-primary bg-primary/5"
                                    : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800",
                            )}
                        >
                            <input
                                type="radio"
                                name="idType"
                                value={type.value}
                                checked={step2.idType === type.value}
                                onChange={() => setStep2((s) => ({ ...s, idType: type.value as "national_id" | "passport" | "business_license" }))}
                                className="text-primary focus:ring-primary"
                            />
                            <span className="text-sm font-medium">{type.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">ID Number</label>
                <input
                    type="text"
                    value={step2.idNumber}
                    onChange={(e) => setStep2((s) => ({ ...s, idNumber: e.target.value }))}
                    placeholder="Enter your ID number"
                    className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label className="mb-3 block text-sm font-semibold">Front of ID</label>
                    <input
                        ref={idFrontInputRef as React.RefObject<HTMLInputElement>}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            if (!file || !file.type.startsWith("image/")) return;
                            setError(null);
                            bindLocalImage("idFront", file, setIdFrontFile, setIdFrontPreview);
                        }}
                    />
                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => idFrontInputRef.current?.click()}
                        className="group relative flex h-36 w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 transition-colors hover:border-primary disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800/50"
                    >
                        {idFrontPreview ? (
                            <img src={idFrontPreview} alt="" className="h-full w-full object-contain" />
                        ) : (
                            <>
                                <ImagePlus className="mb-2 h-8 w-8 text-neutral-400 group-hover:text-primary" />
                                <span className="text-sm font-medium text-neutral-500">Choose front image</span>
                            </>
                        )}
                    </button>
                    <p className="mt-2 text-center text-xs text-neutral-500">Max 5MB</p>
                </div>
                <div>
                    <label className="mb-3 block text-sm font-semibold">Back of ID</label>
                    <input
                        ref={idBackInputRef as React.RefObject<HTMLInputElement>}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            if (!file || !file.type.startsWith("image/")) return;
                            setError(null);
                            bindLocalImage("idBack", file, setIdBackFile, setIdBackPreview);
                        }}
                    />
                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => idBackInputRef.current?.click()}
                        className="group relative flex h-36 w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 transition-colors hover:border-primary disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800/50"
                    >
                        {idBackPreview ? (
                            <img src={idBackPreview} alt="" className="h-full w-full object-contain" />
                        ) : (
                            <>
                                <ImagePlus className="mb-2 h-8 w-8 text-neutral-400 group-hover:text-primary" />
                                <span className="text-sm font-medium text-neutral-500">Choose back image</span>
                            </>
                        )}
                    </button>
                    <p className="mt-2 text-center text-xs text-neutral-500">Max 5MB</p>
                </div>
            </div>
        </div>
    );
}
